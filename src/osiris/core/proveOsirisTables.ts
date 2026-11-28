/**
 * The proof that OpenChemLib's OSIRIS tables answer, before anything is
 * predicted with them.
 *
 * With nothing registered both predictors throw; with the wrong resources
 * registered they construct, then answer every risk as unknown and every
 * drug-likeness as -999, which the drug score reads as good news. So the tables
 * are proved on benzidine, whose mutagenicity comes from a fragment match and
 * whose drug-likeness is a real number: the two families of tables at once.
 */

import {
  OSIRIS_NO_FRAGMENT_MATCHED,
  OSIRIS_RISK_TYPE_CODES,
  OSIRIS_UNKNOWN_NUMBER,
} from './osirisRisks.ts';

/** Benzidine, as an idCode: the molecule the tables are proved on. */
export const OSIRIS_PROBE_ID_CODE = 'dg}@@@mIe]e^ftx@H@H@@';

/** `assessRisk`'s `RISK_HIGH`. */
const RISK_HIGH = 3;

/** The OSIRIS tables did not load, so nothing may be predicted. */
export class OsirisUnavailableError extends Error {
  override name = 'OsirisUnavailableError';
}

/** What {@link proveOsirisTables} is given. */
export interface ProveOsirisTablesOptions<TMolecule> {
  /** A `ToxicityPredictor`. */
  toxicity: { assessRisk: (molecule: TMolecule, riskType: number) => number };
  /** A `DruglikenessPredictor`. */
  druglikeness: { assessDruglikeness: (molecule: TMolecule) => number };
  /** Benzidine, read from {@link OSIRIS_PROBE_ID_CODE}. */
  probe: TMolecule;
  /**
   * What the error says, in the words the site's reader can act on (reload
   * the page, or reinstall the dependencies).
   * @default a sentence saying the tables did not load
   */
  message?: string;
}

/**
 * Prove that the tables answer: benzidine must be a high mutagenic risk and
 * have a real drug-likeness.
 * @param options - The predictors, benzidine, and what to say otherwise.
 * @throws {OsirisUnavailableError} When either answer is not the known one.
 */
export function proveOsirisTables<TMolecule>(
  options: ProveOsirisTablesOptions<TMolecule>,
): void {
  const { toxicity, druglikeness, probe, message } = options;
  const risk = toxicity.assessRisk(probe, OSIRIS_RISK_TYPE_CODES.mutagenic);
  const likeness = druglikeness.assessDruglikeness(probe);
  if (
    risk !== RISK_HIGH ||
    likeness === OSIRIS_UNKNOWN_NUMBER ||
    likeness === OSIRIS_NO_FRAGMENT_MATCHED
  ) {
    throw new OsirisUnavailableError(
      message ??
        'The OSIRIS prediction tables did not load, so no risk or drug-likeness can be computed.',
    );
  }
}
