import {
  DrugScoreCalculator,
  DruglikenessPredictor,
  Molecule,
  MoleculeProperties,
  Resources,
  ToxicityPredictor,
} from 'openchemlib';
import { expect, test } from 'vitest';

import {
  lipinskiViolations,
  passesLipinski,
  passesVeber,
} from '../drugRules.ts';
import {
  osirisAssessedRiskOf,
  osirisRiskCodeOf,
  osirisRiskLevelOf,
} from '../osirisRisks.ts';
import type { OsirisPredictorSet } from '../predictOsiris.ts';
import { predictOsiris } from '../predictOsiris.ts';
import {
  OSIRIS_PROBE_ID_CODE,
  OsirisUnavailableError,
  proveOsirisTables,
} from '../proveOsirisTables.ts';

const predictors = registeredPredictors();

/**
 * OpenChemLib's predictors, their tables registered from the installed package.
 * @returns The predictors.
 */
function registeredPredictors(): OsirisPredictorSet<Molecule> {
  Resources.registerFromNodejs();
  return {
    MoleculeProperties,
    toxicity: new ToxicityPredictor(),
    druglikeness: new DruglikenessPredictor(),
    DrugScoreCalculator,
  };
}

function predict(smiles: string) {
  return predictOsiris(Molecule.fromSmiles(smiles), predictors);
}

/**
 * The real predictors, with the named answers replaced by a sentinel.
 * @param overrides - What answers a sentinel instead.
 * @param overrides.logP - cLogP's answer.
 * @param overrides.logS - The solubility's answer.
 * @param overrides.polarSurfaceArea - The polar surface area's answer.
 * @param overrides.druglikeness - The drug-likeness's answer.
 * @param overrides.risk - Every risk's answer.
 * @returns The predictors.
 */
function sentinels(overrides: {
  logP?: number;
  logS?: number;
  polarSurfaceArea?: number;
  druglikeness?: number;
  risk?: number;
}): OsirisPredictorSet<Molecule> {
  return {
    MoleculeProperties: class {
      logP: number;
      logS: number;
      polarSurfaceArea: number;
      acceptorCount: number;
      donorCount: number;
      stereoCenterCount: number;
      rotatableBondCount: number;

      constructor(molecule: Molecule) {
        const actual = new MoleculeProperties(molecule);
        this.logP = overrides.logP ?? actual.logP;
        this.logS = overrides.logS ?? actual.logS;
        this.polarSurfaceArea =
          overrides.polarSurfaceArea ?? actual.polarSurfaceArea;
        this.acceptorCount = actual.acceptorCount;
        this.donorCount = actual.donorCount;
        this.stereoCenterCount = actual.stereoCenterCount;
        this.rotatableBondCount = actual.rotatableBondCount;
      }
    },
    toxicity: {
      assessRisk: (molecule, type) =>
        overrides.risk ?? predictors.toxicity.assessRisk(molecule, type),
    },
    druglikeness: {
      assessDruglikeness: (molecule) =>
        overrides.druglikeness ??
        predictors.druglikeness.assessDruglikeness(molecule),
    },
    DrugScoreCalculator,
  };
}

test('benzene reproduces the OSIRIS screenshot at the displayed precision', () => {
  const benzene = predict('c1ccccc1');

  expect(benzene.logP?.toFixed(2)).toBe('1.66');
  expect(benzene.logS?.toFixed(2)).toBe('-1.62');
  expect(benzene.molecularWeight.toFixed(2)).toBe('78.11');
  expect(benzene.polarSurfaceArea?.toFixed(2)).toBe('0.00');
  expect(benzene.druglikeness?.toFixed(2)).toBe('-4.84');
  expect(benzene.drugScore?.toFixed(2)).toBe('0.06');
  expect(benzene.risks).toStrictEqual({
    mutagenic: 'high',
    tumorigenic: 'high',
    irritant: 'high',
    reproductive: 'high',
  });
});

test('the molecular weight is the relative one, never the monoisotopic mass', () => {
  expect(predict('c1ccccc1').molecularWeight).toBeCloseTo(78.11364, 5);
});

test('the drug score takes the solubility, not the polar surface area', () => {
  const aspirin = predict('CC(=O)Oc1ccccc1C(=O)O');

  expect(aspirin.drugScore?.toFixed(4)).toBe('0.1430');

  const legacy = DrugScoreCalculator.calculate(
    aspirin.logP as number,
    aspirin.polarSurfaceArea as number,
    aspirin.molecularWeight,
    aspirin.druglikeness as number,
    [3, 3, 1, 3],
  );

  expect(legacy.toFixed(4)).toBe('0.1463');
});

test('sucrose and eicosane keep the counts the rules read', () => {
  const sucrose = predict(
    'OC[C@H]1O[C@@](CO)(O[C@H]2O[C@H](CO)[C@@H](O)[C@H](O)[C@H]2O)[C@@H](O)[C@@H]1O',
  );

  expect(sucrose.acceptorCount).toBe(11);
  expect(sucrose.polarSurfaceArea).toBeCloseTo(189.53, 2);
  expect(sucrose.risks.reproductive).toBe('high');
  expect(sucrose.drugScore).toBeCloseTo(0.2802, 4);

  const eicosane = predict('CCCCCCCCCCCCCCCCCCCC');

  expect(eicosane.logP).toBeCloseTo(9.1564, 4);
  expect(eicosane.rotatableBondCount).toBe(17);
});

test('the molecule the caller owns is left exactly as it was', () => {
  const benzene = Molecule.fromSmiles('c1ccccc1');
  const before = benzene.getIDCode();
  predictOsiris(benzene, predictors);

  expect(benzene.getIDCode()).toBe(before);
});

test('a drug-likeness of -1 means no fragment matched, so no drug score', () => {
  const methane = predict('C');

  expect(methane.druglikeness).toBeNull();
  expect(methane.drugScore).toBeNull();
  expect(methane.logP).toBe(0);
});

test('every sentinel becomes null, and a sentinel refuses the drug score', () => {
  const benzene = Molecule.fromSmiles('c1ccccc1');

  const logP = predictOsiris(benzene, sentinels({ logP: -999 }));

  expect([logP.logP, logP.drugScore]).toStrictEqual([null, null]);

  const logS = predictOsiris(benzene, sentinels({ logS: -999 }));

  expect([logS.logS, logS.drugScore]).toStrictEqual([null, null]);

  const likeness = predictOsiris(benzene, sentinels({ druglikeness: -999 }));

  expect([likeness.druglikeness, likeness.drugScore]).toStrictEqual([
    null,
    null,
  ]);

  const risk = predictOsiris(benzene, sentinels({ risk: 0 }));

  expect(risk.risks.mutagenic).toBe('unknown');
  expect(risk.drugScore).toBeNull();
});

test('an unknown polar surface area is -1, and does not refuse the drug score', () => {
  const properties = predictOsiris(
    Molecule.fromSmiles('c1ccccc1'),
    sentinels({ polarSurfaceArea: -1 }),
  );

  expect(properties.polarSurfaceArea).toBeNull();
  expect(properties.drugScore?.toFixed(2)).toBe('0.06');
});

test('the tables are proved on benzidine, and a table answering nothing is refused', () => {
  const probe = Molecule.fromIDCode(OSIRIS_PROBE_ID_CODE);

  expect(() => {
    proveOsirisTables({ ...predictors, probe });
  }).not.toThrow();
  expect(predictors.druglikeness.assessDruglikeness(probe)).toBeCloseTo(
    -7.134903320081218,
    12,
  );
  expect(() => {
    proveOsirisTables({
      toxicity: { assessRisk: () => 0 },
      druglikeness: predictors.druglikeness,
      probe,
      message: 'Reload the page.',
    });
  }).toThrow(new OsirisUnavailableError('Reload the page.'));
  expect(() => {
    proveOsirisTables({
      toxicity: predictors.toxicity,
      druglikeness: { assessDruglikeness: () => -999 },
      probe,
    });
  }).toThrow(OsirisUnavailableError);
});

test('a risk code reads as a word and back', () => {
  expect(osirisRiskLevelOf(3)).toBe('high');
  expect(osirisRiskLevelOf(7)).toBe('unknown');
  expect(osirisRiskCodeOf('low')).toBe(2);
  expect(osirisAssessedRiskOf(1)).toBe('none');
  expect(osirisAssessedRiskOf(0)).toBeNull();
  expect(osirisAssessedRiskOf(null)).toBeNull();
});

test('Lipinski raises one violation per limit exceeded', () => {
  expect(
    lipinskiViolations({ mw: 342.3, logP: -2, donors: 8, acceptors: 11 }),
  ).toBe(2);
  expect(
    lipinskiViolations({ mw: 500, logP: 5, donors: 5, acceptors: 10 }),
  ).toBe(0);
  expect(
    lipinskiViolations({ mw: 500.1, logP: 5.1, donors: 6, acceptors: 11 }),
  ).toBe(4);
  expect(
    passesLipinski({ mw: 342.3, logP: -2, donors: 8, acceptors: 11 }),
  ).toBe(false);
  expect(passesLipinski({ mw: 600, logP: 2, donors: 1, acceptors: 3 })).toBe(
    true,
  );
});

test('Veber holds to 10 rotatable bonds and 140 Å² of polar surface', () => {
  expect(passesVeber({ rotatableBondCount: 10, polarSurfaceArea: 140 })).toBe(
    true,
  );
  expect(passesVeber({ rotatableBondCount: 17, polarSurfaceArea: 0 })).toBe(
    false,
  );
  expect(passesVeber({ rotatableBondCount: 2, polarSurfaceArea: 189.53 })).toBe(
    false,
  );
});
