/**
 * The band table as cells, for the table a visitor takes away.
 */

import type { AssignedBand } from '../core/assignBands.ts';
import { bandValue } from '../core/irBand.ts';
import { formatIrValue, formatWavenumber } from '../core/irFormat.ts';
import type { IrMode } from '../core/irSpectrum.ts';

/**
 * What the band table says its columns are.
 * @param mode - Which value axis is being read.
 * @param assignments - Whether the table has a column for the candidates.
 * @returns The column titles.
 */
export function bandTableHeader(mode: IrMode, assignments: boolean): string[] {
  const header = ['wavenumber', 'strength', mode];
  if (assignments) header.push('could be');
  return header;
}

/**
 * The bands as the cells of the table, under {@link bandTableHeader}.
 *
 * Every candidate is on its band's row, because the reason to take a band table
 * away is to put it beside a structure and argue about it — and the argument is
 * over the candidates rather than over the wavenumbers. A technique the
 * correlation table does not cover has no such column.
 * @param rows - The bands, as they are shown.
 * @param mode - Which value axis is being read.
 * @param assignments - Whether the table has a column for the candidates.
 * @returns One line of cells per band.
 */
export function bandCells(
  rows: readonly AssignedBand[],
  mode: IrMode,
  assignments: boolean,
): string[][] {
  const cells: string[][] = [];
  for (const { band, candidates } of rows) {
    const line = [
      formatWavenumber(band.wavenumber),
      band.strength,
      formatIrValue(bandValue(band, mode) ?? Number.NaN, mode),
    ];
    if (assignments) {
      const named: string[] = [];
      for (const candidate of candidates) {
        named.push(`${candidate.group} ${candidate.vibration}`);
      }
      line.push(named.join('; '));
    }
    cells.push(line);
  }
  return cells;
}
