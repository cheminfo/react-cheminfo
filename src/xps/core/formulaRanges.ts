/**
 * The ranges a formula search runs over when nobody chose any. Kept apart from
 * the search itself, which brings mass-tools, so a page can show the ranges
 * without loading the search.
 */

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
  const ranges: string[] = [];
  for (const { element, fraction } of composition) {
    ranges.push(`${element}${fraction < maxElementError ? 0 : 1}-${maximum}`);
  }
  return ranges.join(' ');
}
