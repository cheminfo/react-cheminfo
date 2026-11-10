/**
 * What one line of the peak table says, and what it copies as.
 *
 * A picked peak is five answers rather than two — where it sits on each of the
 * two axes, how many counts are there, how wide it is, and what element could
 * account for it — and all five are settled here rather than inside the
 * component, so that what is on screen and what lands on the clipboard can never
 * disagree about any of them.
 *
 * The element is the one answer that is not a property of the peak. It is a
 * lookup against the published levels through a window the reader widens when a
 * sample is charging, so it is computed here, per render, rather than written
 * onto the spectrum — and the row carries how many candidates were found beside
 * the best one, because a peak three elements can equally claim is a peak none
 * of them identifies.
 */

import { assignElements } from './assignElements.ts';
import { isUsableSourceEnergy, toKineticEnergy } from './energy.ts';
import { levelText, signedEnergy } from './panelFormat.ts';
import { formatCounts, formatEnergy } from './peakFormat.ts';
import type { XpsPeak, XpsSpectrum } from './xpsSpectrum.ts';

/** One picked peak, and the best published level offered for it. */
export interface PeakRow {
  /** Identity of the peak, which is what a hover reports. */
  peakId: string;
  /** Where the maximum sits, in eV of binding energy. */
  bindingEnergy: number;
  /**
   * Where it sits in kinetic energy, `null` when the file states no photon
   * energy — and then `bindingEnergy` is already the kinetic one.
   */
  kineticEnergy: number | null;
  /** Counts at the maximum. */
  intensity: number;
  /** Width at half maximum in eV, as the detection estimated it. */
  width: number;
  /** Element of the closest published level, `null` when none is near enough. */
  element: string | null;
  /** That level, as a chemist writes it: `1s`, `2p3/2`. `null` for none. */
  orbital: string | null;
  /** How far the peak sits from it in eV, signed. `null` for none. */
  delta: number | null;
  /**
   * How many published levels fall in the window. Anything above one is worth
   * saying: Ru 3d and C 1s sit two eV apart, and a peak both can claim is a
   * peak neither assigns.
   */
  candidates: number;
}

/** How wide a window the elements are looked up in. */
export interface PeakRowsOptions {
  /**
   * How far in eV a published level may sit from the measurement.
   * @default the default of `assignElements`
   */
  tolerance?: number;
}

/**
 * Turn the peaks of a spectrum into the rows a table draws.
 * @param spectrum - The spectrum whose peaks are listed.
 * @param options - How wide a window to identify them in.
 * @returns One row per peak, in the order the detection listed them.
 */
export function buildPeakRows(
  spectrum: XpsSpectrum,
  options: PeakRowsOptions = {},
): PeakRow[] {
  const { tolerance } = options;
  const { peaks, sourceEnergy } = spectrum;
  const convertible = isUsableSourceEnergy(sourceEnergy);

  const rows = new Array<PeakRow>(peaks.length);
  for (let index = 0; index < peaks.length; index++) {
    const peak = peaks[index] as XpsPeak;
    const candidates = assignElements(peak.bindingEnergy, { tolerance });
    const best = candidates[0];
    rows[index] = {
      peakId: peak.id,
      bindingEnergy: peak.bindingEnergy,
      kineticEnergy: convertible
        ? toKineticEnergy(peak.bindingEnergy, sourceEnergy)
        : null,
      intensity: peak.intensity,
      width: peak.width,
      element: best === undefined ? null : best.element,
      orbital: best === undefined ? null : best.orbital,
      delta: best === undefined ? null : best.delta,
      candidates: candidates.length,
    };
  }
  return rows;
}

/**
 * The rows as a spreadsheet takes them.
 *
 * Tab-separated rather than comma-separated because the numbers are what is
 * being carried: a locale that writes `284,60` turns a CSV into gibberish, while
 * a tab survives every spreadsheet and every chat window. Only the rows on
 * screen are written, filter and order included — what is copied is what was
 * being looked at, which is the only rule that needs no explaining.
 * @param rows - The rows as the table shows them, in the order it shows them.
 * @returns The header line and one line per row, separated by newlines.
 */
export function peakRowsToTsv(rows: readonly PeakRow[]): string {
  const lines = new Array<string>(rows.length + 1);
  lines[0] = TSV_COLUMNS.join('\t');
  for (let index = 0; index < rows.length; index++) {
    const row = rows[index] as PeakRow;
    lines[index + 1] = [
      formatEnergy(row.bindingEnergy),
      row.kineticEnergy === null ? '' : formatEnergy(row.kineticEnergy),
      formatCounts(row.intensity),
      formatEnergy(row.width),
      row.element ?? '',
      row.orbital ?? '',
      row.delta === null ? '' : signedEnergy(row.delta),
    ].join('\t');
  }
  return lines.join('\n');
}

/**
 * What a row says its best candidate is, in the one narrow column a table has
 * room for.
 * @param row - The row.
 * @returns The level, with how many others also reach the peak.
 * @example
 * peakElementText(row); // 'C 1s +2'
 */
export function peakElementText(row: PeakRow): string {
  if (row.element === null) return '—';
  const level = levelText(row.element, row.orbital);
  return row.candidates > 1 ? `${level} +${row.candidates - 1}` : level;
}

/** What the copied table says its columns are, in the order it writes them. */
const TSV_COLUMNS = [
  'binding energy (eV)',
  'kinetic energy (eV)',
  'counts',
  'width (eV)',
  'element',
  'level',
  'delta (eV)',
];
