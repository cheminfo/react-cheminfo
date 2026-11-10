/**
 * The order the two tables of a spectrum are read in.
 *
 * A peak table is read up the binding-energy axis by default, because that is
 * how a spectrum is read — but the questions asked of it are "which is the
 * strongest line", "which of these is broad enough to be two", "what did the
 * lookup actually identify", and each of those is a different order. The fit
 * table is the same story with different columns.
 *
 * Every tie falls back to binding energy ascending — ascending whichever way the
 * column itself was turned, since the fallback is not part of what was asked
 * for. Two orderings therefore never disagree about rows the sorted column
 * cannot separate, and a spectrum whose peaks are all the same height still
 * reads up its own axis rather than backwards.
 */

import type { ComponentRow } from './componentRows.ts';
import type { PeakRow } from './peakRows.ts';

/** What a peak table can be put in order of. */
export type PeakSortKey = 'bindingEnergy' | 'intensity' | 'width' | 'element';

/** What a fit table can be put in order of. */
export type ComponentSortKey = 'label' | 'bindingEnergy' | 'fwhm' | 'area';

/**
 * Put the rows of a peak table in the order asked for.
 *
 * A peak nothing identified sinks to the bottom of the `element` order whichever
 * way the column is turned, since it has no name to be at either end of: sorting
 * by element is asking to see the identifications, and turning it round asks to
 * see them from the other end rather than to see the peaks that have none.
 * @param rows - The rows.
 * @param key - What to order them by.
 * @param ascending - Whether the smallest comes first.
 * @returns A sorted copy.
 */
export function sortPeakRows(
  rows: readonly PeakRow[],
  key: PeakSortKey,
  ascending: boolean,
): PeakRow[] {
  const direction = ascending ? 1 : -1;
  return rows.toSorted((first, second) => {
    if (key === 'element') {
      const identified = identifiedFirst(first.element, second.element);
      if (identified !== 0) return identified;
    }
    const order = comparePeaks(first, second, key);
    if (order !== 0) return direction * order;
    return first.bindingEnergy - second.bindingEnergy;
  });
}

/**
 * Put the rows of a fit table in the order asked for.
 * @param rows - The rows.
 * @param key - What to order them by.
 * @param ascending - Whether the smallest comes first.
 * @returns A sorted copy.
 */
export function sortComponentRows(
  rows: readonly ComponentRow[],
  key: ComponentSortKey,
  ascending: boolean,
): ComponentRow[] {
  const direction = ascending ? 1 : -1;
  return rows.toSorted((first, second) => {
    const order = compareComponents(first, second, key);
    if (order !== 0) return direction * order;
    return first.bindingEnergy - second.bindingEnergy;
  });
}

/**
 * Which of two peaks was identified, when only one of them was.
 * @param first - The element of one row, `null` when nothing accounted for it.
 * @param second - The element of the other.
 * @returns Negative when only the first is identified, positive when only the
 * second is, zero when both are or neither is.
 */
function identifiedFirst(first: string | null, second: string | null): number {
  if (first === null) return second === null ? 0 : 1;
  return second === null ? -1 : 0;
}

/**
 * How two peak rows compare on one column.
 * @param first - One row.
 * @param second - The other.
 * @param key - What to compare them on.
 * @returns Negative, zero or positive.
 */
function comparePeaks(
  first: PeakRow,
  second: PeakRow,
  key: PeakSortKey,
): number {
  switch (key) {
    case 'bindingEnergy':
      return first.bindingEnergy - second.bindingEnergy;
    case 'intensity':
      return first.intensity - second.intensity;
    case 'width':
      return first.width - second.width;
    case 'element':
      return (first.element ?? '').localeCompare(second.element ?? '');
    // no default
  }
}

/**
 * How two fit rows compare on one column.
 * @param first - One row.
 * @param second - The other.
 * @param key - What to compare them on.
 * @returns Negative, zero or positive.
 */
function compareComponents(
  first: ComponentRow,
  second: ComponentRow,
  key: ComponentSortKey,
): number {
  switch (key) {
    case 'label':
      return first.label.localeCompare(second.label);
    case 'bindingEnergy':
      return first.bindingEnergy - second.bindingEnergy;
    case 'fwhm':
      return first.fwhm - second.fwhm;
    case 'area':
      return first.area - second.area;
    // no default
  }
}

/**
 * What a header tells a screen reader about the order it is in.
 * @param sorted - Whether the table is ordered by this column.
 * @param ascending - Whether the smallest comes first.
 * @returns The `aria-sort` value.
 */
export function sortDirection(
  sorted: boolean,
  ascending: boolean,
): 'ascending' | 'descending' | 'none' {
  if (!sorted) return 'none';
  return ascending ? 'ascending' : 'descending';
}
