/**
 * The numbers OpenChemLib's OSIRIS predictors speak, read as words.
 *
 * Three 0–3 scales meet here and are easy to confuse: the risk *type* handed
 * to `assessRisk` (mutagenic 0 … reproductive 3, also the order of the drug
 * score's `toxRisks`), the risk *level* it returns (unknown 0, none 1, low 2,
 * high 3), and `ToxicityPredictor.RISK_NAMES`, which is indexed by type, never
 * by level. None of the predictors fails loudly: each answers a sentinel
 * instead, and none of them is `NaN`.
 */

/** The four risks OSIRIS assesses, in the order OpenChemLib numbers them. */
export const OSIRIS_RISK_TYPES = [
  'mutagenic',
  'tumorigenic',
  'irritant',
  'reproductive',
] as const;

/** One of the four risks. */
export type OsirisRiskType = (typeof OSIRIS_RISK_TYPES)[number];

/**
 * How a risk came back. `unknown` is OpenChemLib's `RISK_UNKNOWN`, answered
 * when its tables did not load: never "nothing was found", which is `none`.
 * `low` is what OSIRIS shows as a medium risk.
 */
export type OsirisRiskLevel = 'unknown' | 'none' | 'low' | 'high';

/** A risk that was assessed. */
export type OsirisAssessedRisk = Exclude<OsirisRiskLevel, 'unknown'>;

/** Where each risk sits in OpenChemLib's numbering of types. */
export const OSIRIS_RISK_TYPE_CODES: Readonly<Record<OsirisRiskType, number>> =
  {
    mutagenic: 0,
    tumorigenic: 1,
    irritant: 2,
    reproductive: 3,
  };

/** What `assessRisk` returns, as a word, indexed by the number it returns. */
export const OSIRIS_RISK_LEVELS: readonly OsirisRiskLevel[] = [
  'unknown',
  'none',
  'low',
  'high',
];

/**
 * What cLogP, the solubility and the drug-likeness answer when they could not
 * be computed: `SolubilityPredictor.cSolubilityUnknown` and
 * `DruglikenessPredictor.DRUGLIKENESS_UNKNOWN` are this value.
 */
export const OSIRIS_UNKNOWN_NUMBER = -999;

/** What the polar surface area answers when it is unknown — not `-999`. */
export const OSIRIS_UNKNOWN_SURFACE_AREA = -1;

/**
 * What the drug-likeness answers when none of its 5294 fragments matched, as
 * for methane: indistinguishable from a real -1, and read as unknown, as
 * OSIRIS does.
 */
export const OSIRIS_NO_FRAGMENT_MATCHED = -1;

/**
 * The word for the number `assessRisk` returned.
 * @param code - 0 to 3.
 * @returns The level, `unknown` for anything outside the four OpenChemLib defines.
 */
export function osirisRiskLevelOf(code: number): OsirisRiskLevel {
  return OSIRIS_RISK_LEVELS[code] ?? 'unknown';
}

/**
 * The number OpenChemLib uses for a level: what the drug score's `toxRisks`
 * takes, and what a database stores.
 * @param level - The level.
 * @returns 0 to 3.
 */
export function osirisRiskCodeOf(level: OsirisRiskLevel): number {
  const code = OSIRIS_RISK_LEVELS.indexOf(level);
  return code === -1 ? 0 : code;
}

/**
 * The assessed risk a stored level code stands for.
 * @param code - 1, 2 or 3 as stored, or `null` when the risk was not assessed.
 * @returns The risk, or `null` for one that was not assessed.
 */
export function osirisAssessedRiskOf(
  code: number | null,
): OsirisAssessedRisk | null {
  if (code === null) return null;
  const level = osirisRiskLevelOf(code);
  return level === 'unknown' ? null : level;
}
