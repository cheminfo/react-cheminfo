/**
 * The band table as text, for pasting into a notebook.
 */

import type { AssignedBand } from '../core/assignBands.ts';
import { bandValue } from '../core/irBand.ts';
import { formatIrValue, formatWavenumber } from '../core/irFormat.ts';
import type { IrMode } from '../core/irSpectrum.ts';

/**
 * The table as tab separated text.
 *
 * Every candidate is on its band's row, because the reason to copy a band table
 * is to put it beside a structure and argue about it — and the argument is over
 * the candidates rather than over the wavenumbers. A technique the correlation
 * table does not cover has no such column.
 * @param rows - The bands, as they are shown.
 * @param mode - Which value axis is being read.
 * @param assignments - Whether the table has a column for the candidates.
 * @returns The table, one line per band, with a heading.
 */
export function bandsToTsv(
  rows: readonly AssignedBand[],
  mode: IrMode,
  assignments: boolean,
): string {
  const heading = ['wavenumber', 'strength', mode];
  if (assignments) heading.push('could be');
  const lines = [heading.join('\t')];
  for (const { band, candidates } of rows) {
    const cells = [
      formatWavenumber(band.wavenumber),
      band.strength,
      formatIrValue(bandValue(band, mode) ?? Number.NaN, mode),
    ];
    if (assignments) {
      cells.push(
        candidates
          .map((candidate) => `${candidate.group} ${candidate.vibration}`)
          .join('; '),
      );
    }
    lines.push(cells.join('\t'));
  }
  return lines.join('\n');
}
