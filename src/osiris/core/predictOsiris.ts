/**
 * Everything OSIRIS predicts about one molecule, in one pass, OpenChemLib
 * handed in by the caller so this module loads none of it.
 *
 * The order of the reads is not arbitrary. `MoleculeProperties`' constructor
 * normalises ambiguous bonds on the molecule it is given, so the work is done
 * on a copy and the caller's molecule is never touched. Its fields are getters
 * that rerun the predictor on every read, so each is read once. Nothing here
 * trusts OpenChemLib to fail loudly: every sentinel becomes `null`, and a drug
 * score is computed only when all its inputs are real.
 */

import type { OsirisRiskLevel, OsirisRiskType } from './osirisRisks.ts';
import {
  OSIRIS_NO_FRAGMENT_MATCHED,
  OSIRIS_RISK_TYPES,
  OSIRIS_RISK_TYPE_CODES,
  OSIRIS_UNKNOWN_NUMBER,
  OSIRIS_UNKNOWN_SURFACE_AREA,
  osirisRiskCodeOf,
  osirisRiskLevelOf,
} from './osirisRisks.ts';

/** The least of an OpenChemLib `Molecule` OSIRIS reads. */
export interface OsirisMolecule<TMolecule> {
  /** A copy the predictors may normalise. */
  getCompactCopy: () => TMolecule;
  /** Its formula; the relative weight is what OSIRIS scores. */
  getMolecularFormula: () => { relativeWeight: number };
}

/** What `MoleculeProperties` answers, read once each. */
export interface OsirisPropertyReader {
  /** cLogP, octanol/water; -999 when unknown. */
  logP: number;
  /** Aqueous solubility, log10 of mol/L; -999 when unknown. */
  logS: number;
  /** Topological polar surface area, Å²; -1 when unknown. */
  polarSurfaceArea: number;
  /** Nitrogen and oxygen atoms. */
  acceptorCount: number;
  /** Nitrogen and oxygen atoms carrying a hydrogen: an NH2 counts once. */
  donorCount: number;
  /** Stereocentres, configured or not. */
  stereoCenterCount: number;
  /** Single bonds that are not terminal, not in a ring and not amide. */
  rotatableBondCount: number;
}

/** OpenChemLib's OSIRIS predictors, their tables registered and proved. */
export interface OsirisPredictorSet<TMolecule> {
  /** OpenChemLib's `MoleculeProperties`. */
  MoleculeProperties: new (molecule: TMolecule) => OsirisPropertyReader;
  /** A `ToxicityPredictor`. */
  toxicity: { assessRisk: (molecule: TMolecule, riskType: number) => number };
  /** A `DruglikenessPredictor`. */
  druglikeness: { assessDruglikeness: (molecule: TMolecule) => number };
  /** OpenChemLib's `DrugScoreCalculator`. */
  DrugScoreCalculator: {
    calculate: (
      logP: number,
      logS: number,
      molecularWeight: number,
      druglikeness: number,
      toxRisks: number[],
    ) => number;
  };
}

/** What OSIRIS says about one molecule: `null` where it does not know. */
export interface OsirisPrediction {
  /** The relative molecular weight, g/mol — never the monoisotopic mass. */
  molecularWeight: number;
  /** cLogP, octanol/water. */
  logP: number | null;
  /** Aqueous solubility, log10 of mol/L. */
  logS: number | null;
  /** Topological polar surface area (Ertl: N, O, S and P), Å². */
  polarSurfaceArea: number | null;
  /** Nitrogen and oxygen atoms. */
  acceptorCount: number;
  /** Nitrogen and oxygen atoms carrying a hydrogen: an NH2 counts once. */
  donorCount: number;
  /** Stereocentres, configured or not. */
  stereoCenterCount: number;
  /** Single bonds that are not terminal, not in a ring and not amide. */
  rotatableBondCount: number;
  /** The drug-likeness, positive is drug-like; `null` when no fragment matched. */
  druglikeness: number | null;
  /** The drug score, 0 to 1; `null` when any of its inputs is unknown. */
  drugScore: number | null;
  /** The four risks; `unknown` for a risk the tables could not assess. */
  risks: Record<OsirisRiskType, OsirisRiskLevel>;
}

/**
 * Predict everything OSIRIS says about a molecule.
 * @param molecule - The molecule. It is copied before anything touches it.
 * @param predictors - OpenChemLib's predictors, proved by `proveOsirisTables`.
 * @returns The prediction.
 */
export function predictOsiris<TMolecule extends OsirisMolecule<TMolecule>>(
  molecule: TMolecule,
  predictors: OsirisPredictorSet<TMolecule>,
): OsirisPrediction {
  const working = molecule.getCompactCopy();
  const molecularWeight = working.getMolecularFormula().relativeWeight;
  const properties = new predictors.MoleculeProperties(working);
  const logP = real(properties.logP, OSIRIS_UNKNOWN_NUMBER);
  const logS = real(properties.logS, OSIRIS_UNKNOWN_NUMBER);
  const polarSurfaceArea = real(
    properties.polarSurfaceArea,
    OSIRIS_UNKNOWN_SURFACE_AREA,
  );
  const acceptorCount = properties.acceptorCount;
  const donorCount = properties.donorCount;
  const stereoCenterCount = properties.stereoCenterCount;
  const rotatableBondCount = properties.rotatableBondCount;

  const assessed = predictors.druglikeness.assessDruglikeness(working);
  const druglikeness =
    assessed === OSIRIS_UNKNOWN_NUMBER ||
    assessed === OSIRIS_NO_FRAGMENT_MATCHED
      ? null
      : assessed;

  const risks = {} as Record<OsirisRiskType, OsirisRiskLevel>;
  for (const risk of OSIRIS_RISK_TYPES) {
    risks[risk] = osirisRiskLevelOf(
      predictors.toxicity.assessRisk(working, OSIRIS_RISK_TYPE_CODES[risk]),
    );
  }

  return {
    molecularWeight,
    logP,
    logS,
    polarSurfaceArea,
    acceptorCount,
    donorCount,
    stereoCenterCount,
    rotatableBondCount,
    druglikeness,
    drugScore: drugScoreOf(predictors, {
      logP,
      logS,
      molecularWeight,
      druglikeness,
      risks,
    }),
    risks,
  };
}

interface DrugScoreInputs {
  logP: number | null;
  logS: number | null;
  molecularWeight: number;
  druglikeness: number | null;
  risks: Record<OsirisRiskType, OsirisRiskLevel>;
}

/**
 * The drug score, or `null` when an input is unknown: the calculator never
 * refuses, and an unassessed risk applies no penalty where a high one applies
 * 0.6, so both would read as good news. Its second argument is the
 * solubility, not the polar surface area.
 * @param predictors - The predictors, for the calculator.
 * @param inputs - The five inputs.
 * @returns The score, 0 to 1, or `null`.
 */
function drugScoreOf<TMolecule>(
  predictors: OsirisPredictorSet<TMolecule>,
  inputs: DrugScoreInputs,
): number | null {
  const { logP, logS, molecularWeight, druglikeness, risks } = inputs;
  if (logP === null || logS === null || druglikeness === null) return null;
  const codes: number[] = [];
  for (const risk of OSIRIS_RISK_TYPES) {
    const level = risks[risk];
    if (level === 'unknown') return null;
    codes.push(osirisRiskCodeOf(level));
  }
  return predictors.DrugScoreCalculator.calculate(
    logP,
    logS,
    molecularWeight,
    druglikeness,
    codes,
  );
}

function real(value: number, sentinel: number): number | null {
  if (value === sentinel || !Number.isFinite(value)) return null;
  return value;
}
