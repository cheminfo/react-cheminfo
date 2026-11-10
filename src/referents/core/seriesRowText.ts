/**
 * The values of a row of a series as a legend writes them: the generic
 * positions taking one value named together, in the order of the columns —
 * R1 = I, R2 = R3 = R4 = H.
 */

import type { SeriesRow } from './types.ts';

/**
 * A row of a series, as one line of a legend.
 * @param row - The row.
 * @param columns - The generic positions, in the order shown.
 * @returns Its values, each one once after the positions taking it, `R1 = I,
 * R2 = R3 = H`; empty for a row with no value.
 */
export function seriesRowText(
  row: SeriesRow,
  columns: readonly string[],
): string {
  const byValue = new Map<string, string[]>();
  for (const column of columns) {
    const value = row.values[column];
    if (value === undefined || value === '') continue;
    const named = byValue.get(value);
    if (named) named.push(column);
    else byValue.set(value, [column]);
  }
  return [...byValue]
    .map(([value, named]) => `${named.join(' = ')} = ${value}`)
    .join(', ');
}
