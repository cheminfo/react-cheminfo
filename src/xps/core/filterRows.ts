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

import { filterNeedle, matchesNeedle } from '../../panel/core/textFilter.ts';

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
  return keepMatching(rows, query, peakFields);
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
  return keepMatching(rows, query, componentFields);
}

function keepMatching<Row>(
  rows: readonly Row[],
  query: string,
  fieldsOf: (row: Row) => ReadonlyArray<string | undefined>,
): readonly Row[] {
  const needle = filterNeedle(query);
  if (needle === '') return rows;

  const kept: Row[] = [];
  for (const row of rows) {
    if (matchesNeedle(needle, ...fieldsOf(row))) kept.push(row);
  }
  return kept;
}

/**
 * What a peak row is found by: either energy as written, the element and the
 * level.
 * @param row - The row.
 * @returns The fields, an absent one as `undefined`.
 */
function peakFields(row: PeakRow): Array<string | undefined> {
  return [
    formatEnergy(row.bindingEnergy),
    row.kineticEnergy === null ? undefined : formatEnergy(row.kineticEnergy),
    row.element ?? undefined,
    row.orbital ?? undefined,
  ];
}

/**
 * What a fit row is found by: the label, the energy as written, the shape and
 * the region.
 * @param row - The row.
 * @returns The fields, an absent one as `undefined`.
 */
function componentFields(row: ComponentRow): Array<string | undefined> {
  return [
    row.label,
    formatEnergy(row.bindingEnergy),
    row.shape,
    row.regionLabel ?? undefined,
  ];
}
