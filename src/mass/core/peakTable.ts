/**
 * The rows the peak table lists, and the text they are copied out as.
 *
 * The rows are the centroid's own peaks, read through `selectCentroidPeaks` —
 * the same windowing the chart is read through — so the table and the chart
 * can never disagree about which peaks exist.
 */

import type { MassPeakObject } from './centroidPeaks.ts';
import { selectCentroidPeaks } from './centroidPeaks.ts';
import { formatIntensity, formatMz } from './massFormat.ts';
import type { MassDomain, MassSpectrum } from './massSpectrum.ts';

/**
 * How many rows the table lists at most, the most intense kept.
 *
 * Far more than anybody reads, and few enough that a centroid of fifty
 * thousand peaks does not lay out fifty thousand rows under a pointer move.
 */
export const PEAK_TABLE_LIMIT = 1000;

/**
 * The floor the table starts at, as a fraction of the base peak: where a
 * chemist's own peak list starts, and where everything under it is the
 * baseline the compound sits on.
 */
export const PEAK_TABLE_THRESHOLD = 0.01;

/** Which peaks the table lists. */
export interface PeakTableOptions {
  /**
   * The window the chart shows, when the table is to follow it; `null` for the
   * whole spectrum.
   * @default null
   */
  domain?: MassDomain | null;
  /**
   * The floor, as a fraction of the base peak; `0` lists every peak.
   * @default PEAK_TABLE_THRESHOLD
   */
  threshold?: number;
}

/**
 * The peaks the table lists for one spectrum, in increasing m/z.
 * @param spectrum - The spectrum the table is about.
 * @param options - The window, and the floor.
 * @returns The peaks, shared with the centroid's cache — read, never written.
 */
export function peakTableRows(
  spectrum: MassSpectrum,
  options: PeakTableOptions = {},
): MassPeakObject[] {
  const { domain = null, threshold = PEAK_TABLE_THRESHOLD } = options;
  return selectCentroidPeaks(spectrum.centroid, {
    ...(domain === null ? {} : { from: domain.x[0], to: domain.x[1] }),
    threshold,
    limit: PEAK_TABLE_LIMIT,
  });
}

/**
 * The rows as tab-separated text, the way a spreadsheet takes a paste.
 *
 * Written to the decimals the table shows rather than as the doubles are held,
 * so what is pasted is what was read on screen.
 * @param peaks - The rows, in the order they are listed.
 * @param mzDecimals - How many decimals the masses are written with.
 * @returns A header line and one line per peak.
 */
export function peakTableToTsv(
  peaks: readonly MassPeakObject[],
  mzDecimals: number,
): string {
  const lines = ['m/z\tintensity\tcharge'];
  for (const peak of peaks) {
    lines.push(
      `${formatMz(peak.x, mzDecimals)}\t${formatIntensity(peak.y, mzDecimals)}\t${peak.charge === 0 ? '' : peak.charge}`,
    );
  }
  return `${lines.join('\n')}\n`;
}
