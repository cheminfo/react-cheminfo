/**
 * The molecular formulas whose atomic ratio matches a composition.
 *
 * XPS measures ratios and nothing else: a polymer of C₂H₄O and its dimer give
 * the same survey, and hydrogen gives none at all. So a formula proposed from a
 * survey is an empirical formula of the elements that were measured, and the
 * search runs over those elements only — never hydrogen — each from one atom,
 * since an element that was measured is in the sample. Formulas that are a
 * multiple of a smaller one say nothing the smaller one does not, and only the
 * smallest of them is kept.
 *
 * The search itself is `mfFromAtomicRatio` from mass-tools, which enumerates
 * every formula in the ranges and keeps those within the error allowed.
 */

import { mfFromAtomicRatio } from 'mf-from-atomic-ratio';

/** One element of a proposed formula, against what was measured. */
export interface FormulaElement {
  /** Element symbol. */
  element: string;
  /** How many atoms of it the formula holds. */
  count: number;
  /** Its measured atomic fraction, `0` to `1`. */
  measured: number;
  /** Its atomic fraction in the formula, `0` to `1`. */
  formula: number;
}

/** A formula whose ratio matches the composition. */
export interface FormulaProposal {
  /** The formula, as `mf-parser` writes it. */
  mf: string;
  /** Each measured element, in the order of the composition. */
  elements: FormulaElement[];
  /** The sum of the absolute differences between formula and measurement. */
  error: number;
  /** How many atoms the formula holds. */
  atoms: number;
}

/** How wide the search is, and how many answers come back. */
export interface ProposeFormulasOptions {
  /**
   * The ranges searched, as mass-tools writes them: `C1-10 O1-10`.
   * @default defaultFormulaRanges of the measured elements
   */
  ranges?: string;
  /**
   * How many formulas come back at most, the closest first.
   * @default 20
   */
  limit?: number;
  /**
   * How far one element's fraction may sit from the measurement, `0` to `1`.
   * @default DEFAULT_ELEMENT_ERROR
   */
  maxElementError?: number;
  /**
   * How far all of them together may sit from it, `0` to `1`.
   * @default 0.1
   */
  maxTotalError?: number;
}

/**
 * The formulas whose ratio of the measured elements matches the composition.
 * @param composition - Each measured element and its atomic fraction.
 * @param options - The ranges searched and the error allowed.
 * @returns The formulas, the closest first and the smallest among equals.
 */
export async function proposeFormulas(
  composition: ReadonlyArray<{ element: string; fraction: number }>,
  options: ProposeFormulasOptions = {},
): Promise<FormulaProposal[]> {
  const measured = normalisedComposition(composition);
  if (measured.size === 0) return [];
  const {
    limit = 20,
    maxElementError = DEFAULT_ELEMENT_ERROR,
    maxTotalError = 0.1,
  } = options;
  const entries: Array<{ element: string; fraction: number }> = [];
  for (const [element, fraction] of measured) {
    entries.push({ element, fraction });
  }
  const { ranges = defaultFormulaRanges(entries, maxElementError) } = options;

  const ratios: Record<string, number> = {};
  for (const [element, fraction] of measured) ratios[element] = fraction;
  const found = await mfFromAtomicRatio(ratios, {
    ranges,
    maxElementError,
    maxTotalError,
  });

  const smallest = new Map<string, FormulaProposal>();
  for (const result of found) {
    const proposal = toProposal(result, measured);
    const key = ratioKey(proposal.elements);
    const kept = smallest.get(key);
    if (kept === undefined || proposal.atoms < kept.atoms) {
      smallest.set(key, proposal);
    }
  }

  const proposals = [...smallest.values()].toSorted(
    (left, right) =>
      left.error - right.error ||
      left.atoms - right.atoms ||
      (left.mf < right.mf ? -1 : 1),
  );
  return proposals.slice(0, limit);
}

/** How far one element's fraction may sit from the measurement by default. */
export const DEFAULT_ELEMENT_ERROR = 0.05;

/** How many formulas a default search enumerates at most. */
const MAXIMUM_COMBINATIONS = 100_000;

/**
 * The ranges a search runs over when nobody chose any: every measured element
 * up to ten atoms, fewer when there are so many elements that ten each would
 * take more than a moment to enumerate.
 *
 * Ten is about what a survey can tell apart: its percentages are good to a few
 * points, and C₁₉O₉ is closer than C₂O to a measured 67.5 % of carbon only
 * because it has enough atoms to follow the noise. An element starts from one
 * atom, since it was measured — unless it was measured under the error one
 * element is allowed, which a formula without it already meets: a trace of
 * silicone on a polymer is not part of the polymer.
 * @param composition - Each measured element and its fraction, summing to one.
 * @param maxElementError - The error one element is allowed.
 * @returns The ranges, as mass-tools writes them.
 */
export function defaultFormulaRanges(
  composition: ReadonlyArray<{ element: string; fraction: number }>,
  maxElementError = DEFAULT_ELEMENT_ERROR,
): string {
  if (composition.length === 0) return '';
  const most = Math.floor(MAXIMUM_COMBINATIONS ** (1 / composition.length));
  const maximum = Math.max(2, Math.min(10, most));
  return composition
    .map(
      ({ element, fraction }) =>
        `${element}${fraction < maxElementError ? 0 : 1}-${maximum}`,
    )
    .join(' ');
}

/**
 * The composition with the fractions summing to one, elements without a
 * positive fraction left out.
 * @param composition - Each measured element and its fraction.
 * @returns The fractions by element, in the order given.
 */
function normalisedComposition(
  composition: ReadonlyArray<{ element: string; fraction: number }>,
): Map<string, number> {
  let total = 0;
  for (const { fraction } of composition) {
    if (fraction > 0) total += fraction;
  }
  const measured = new Map<string, number>();
  if (!(total > 0)) return measured;
  for (const { element, fraction } of composition) {
    if (fraction > 0) measured.set(element, fraction / total);
  }
  return measured;
}

/** What the search answers with, as far as it is read here. */
interface FoundFormula {
  mf: string;
  atomicRatios: ReadonlyArray<{ element: string; count: number }>;
  mfAtomicComposition: ReadonlyArray<{ element: string; count: number }>;
}

/**
 * One formula the search found, compared with the measurement.
 * @param found - The formula.
 * @param measured - The measured fractions by element.
 * @returns The proposal.
 */
function toProposal(
  found: FoundFormula,
  measured: ReadonlyMap<string, number>,
): FormulaProposal {
  const counts = new Map<string, number>();
  for (const { element, count } of found.atomicRatios) {
    counts.set(element, count);
  }
  let measuredAtoms = 0;
  for (const element of measured.keys()) {
    measuredAtoms += counts.get(element) ?? 0;
  }

  const elements: FormulaElement[] = [];
  let error = 0;
  for (const [element, fraction] of measured) {
    const count = counts.get(element) ?? 0;
    const formula = measuredAtoms > 0 ? count / measuredAtoms : 0;
    error += Math.abs(formula - fraction);
    elements.push({ element, count, measured: fraction, formula });
  }

  let atoms = 0;
  for (const { count } of found.mfAtomicComposition) atoms += count;
  return { mf: found.mf, elements, error, atoms };
}

/**
 * What every multiple of one ratio shares: the counts divided by their
 * greatest common divisor.
 * @param elements - The measured elements of a formula.
 * @returns The ratio, as a key.
 */
function ratioKey(elements: readonly FormulaElement[]): string {
  let divisor = 0;
  for (const { count } of elements) {
    divisor = greatestCommonDivisor(divisor, count);
  }
  if (divisor === 0) divisor = 1;
  return elements.map(({ count }) => count / divisor).join(':');
}

/**
 * Euclid's algorithm.
 * @param left - A non-negative integer.
 * @param right - Another.
 * @returns Their greatest common divisor, `0` when both are `0`.
 */
function greatestCommonDivisor(left: number, right: number): number {
  let dividend = left;
  let divisor = right;
  while (divisor !== 0) {
    [dividend, divisor] = [divisor, dividend % divisor];
  }
  return dividend;
}
