/**
 * The rows a typed query leaves on screen.
 *
 * Deliberately one box over every column rather than a field per column: what is
 * typed at a peak table is an energy or an element symbol, and what is typed at
 * a fit table is a label, a shape or a region — and which of them it is is
 * obvious from what was typed. Asking the reader to say so first would cost a
 * click on every question.
 *
 * The energies are matched as they are *written* rather than as they are stored,
 * so typing `284.6` finds the peak the table shows as `284.60`, and typing `284`
 * finds every peak of that eV. Matching the stored number instead would make the
 * box disagree with the column beside it, which is the one thing a filter must
 * never do.
 */

import type { ComponentRow } from './componentRows.ts';
import { formatEnergy } from './peakFormat.ts';
import type { PeakRow } from './peakRows.ts';

/**
 * The peak rows a query leaves.
 * @param rows - Every row of the spectrum.
 * @param query - What was typed in the filter box, empty for all of them.
 * @returns The rows that match, in the order they came in; the same array when
 * nothing was typed, so an unfiltered table costs no allocation at all.
 */
export function filterPeakRows(
  rows: readonly PeakRow[],
  query: string,
): readonly PeakRow[] {
  const needle = query.trim().toLowerCase();
  if (needle === '') return rows;

  const kept: PeakRow[] = [];
  for (const row of rows) {
    if (matchesPeak(row, needle)) kept.push(row);
  }
  return kept;
}

/**
 * The fit rows a query leaves.
 * @param rows - Every row of the fit.
 * @param query - What was typed in the filter box, empty for all of them.
 * @returns The rows that match, in the order they came in; the same array when
 * nothing was typed.
 */
export function filterComponentRows(
  rows: readonly ComponentRow[],
  query: string,
): readonly ComponentRow[] {
  const needle = query.trim().toLowerCase();
  if (needle === '') return rows;

  const kept: ComponentRow[] = [];
  for (const row of rows) {
    if (matchesComponent(row, needle)) kept.push(row);
  }
  return kept;
}

/**
 * Whether one peak row answers a query.
 * @param row - The row.
 * @param needle - What was typed, trimmed and lowercased.
 * @returns Whether either energy as written, the element or the level holds it.
 */
function matchesPeak(row: PeakRow, needle: string): boolean {
  if (formatEnergy(row.bindingEnergy).includes(needle)) return true;
  if (
    row.kineticEnergy !== null &&
    formatEnergy(row.kineticEnergy).includes(needle)
  ) {
    return true;
  }
  if (row.element?.toLowerCase().includes(needle)) return true;
  return row.orbital?.toLowerCase().includes(needle) ?? false;
}

/**
 * Whether one fit row answers a query.
 * @param row - The row.
 * @param needle - What was typed, trimmed and lowercased.
 * @returns Whether the label, the energy as written, the shape or the region
 * holds it.
 */
function matchesComponent(row: ComponentRow, needle: string): boolean {
  if (row.label.toLowerCase().includes(needle)) return true;
  if (formatEnergy(row.bindingEnergy).includes(needle)) return true;
  if (row.shape.toLowerCase().includes(needle)) return true;
  return row.regionLabel?.toLowerCase().includes(needle) ?? false;
}
