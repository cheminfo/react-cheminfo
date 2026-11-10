/**
 * What one line of the composition says, and how much of the bar it fills.
 *
 * The arithmetic is `quantifyComponents`' and is not repeated here: the areas,
 * the sensitivity factors and the labels are all the file's, and the atomic
 * fractions are the corrected areas over their sum. What this adds is the one
 * thing a table needs and a composition does not have — how wide to draw the bar
 * — and one count the panel is obliged to say out loud.
 *
 * That count is the assumed sensitivity factors. A composition computed from
 * factors nobody stated is arithmetic rather than chemistry: the numbers add to
 * a hundred per cent and mean nothing, and they look exactly like numbers that
 * mean something. So the rows carry the flag, the panel reads the count off
 * them, and neither of them prints a confident percentage over a fit that was
 * never quantified.
 */

import type {
  CompositionEntry,
  QuantifyComponentsOptions,
} from './quantify.ts';
import { quantifyComponents } from './quantify.ts';
import type { XpsSpectrum } from './xpsSpectrum.ts';

/** One line of the composition, with the width of its bar. */
export interface CompositionRow extends CompositionEntry {
  /**
   * How much of the bar to fill, `0` to `1`: the row's corrected area against
   * the largest of them, rather than its atomic fraction.
   *
   * A composition of eleven components has a largest share of perhaps 30%, and
   * bars drawn against a hundred would then all be stubs a third of the track —
   * which shows the reader nothing about how the eleven compare, which is the
   * only thing a bar is for. Against the largest, the biggest row fills the
   * track and every other one is read against it at a glance.
   */
  share: number;
}

/**
 * The composition of everything the given spectra were fitted with.
 * @param spectra - The spectra to quantify, fitted or not.
 * @param options - Whether to add the components of one element together.
 * @returns One row per component, or per element, largest share first; empty
 * when nothing carries a fit at all.
 */
export function buildCompositionRows(
  spectra: readonly XpsSpectrum[],
  options: QuantifyComponentsOptions = {},
): CompositionRow[] {
  const entries = quantifyComponents(spectra, options);
  if (entries.length === 0) return [];

  let largest = 0;
  for (const { correctedArea } of entries) {
    if (correctedArea > largest) largest = correctedArea;
  }

  const rows = new Array<CompositionRow>(entries.length);
  for (let index = 0; index < entries.length; index++) {
    const entry = entries[index] as CompositionEntry;
    rows[index] = {
      ...entry,
      share: largest > 0 ? entry.correctedArea / largest : 0,
    };
  }
  return rows;
}

/**
 * How many lines of the composition were quantified against nothing.
 * @param rows - The lines of the composition.
 * @returns How many carry a sensitivity factor the file never stated.
 */
export function countAssumed(rows: readonly CompositionRow[]): number {
  let assumed = 0;
  for (const { assumedSensitivity } of rows) {
    if (assumedSensitivity) assumed++;
  }
  return assumed;
}

/**
 * What the panel says about the factors the numbers above it were computed from.
 *
 * A sentence rather than a flag on each row alone, because the warning is about
 * the *composition* and not about any one line of it: a single assumed factor
 * rescales every other percentage in the table, so the reader has to be told
 * before reading any of them rather than after finding the marked row.
 * @param rows - The lines of the composition.
 * @returns The warning, `null` when every factor came from the file.
 */
export function assumedWarning(rows: readonly CompositionRow[]): string | null {
  const assumed = countAssumed(rows);
  if (assumed === 0) return null;
  if (assumed === rows.length) {
    return 'No component states a sensitivity factor, so these are areas expressed as percentages rather than a composition. Quantify the fit in the software that made it, or read the shares against each other and not as atomic per cent.';
  }
  if (assumed === 1) {
    return 'One line of this table carries a sensitivity factor of 1 that the file never stated, which rescales every percentage beside it. Treat the numbers as a ranking rather than as a composition.';
  }
  return `${assumed} lines of this table carry a sensitivity factor of 1 that the file never stated, which rescales every percentage beside them. Treat the numbers as a ranking rather than as a composition.`;
}
