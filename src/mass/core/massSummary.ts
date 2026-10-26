/**
 * What a spectrum can be said to be, when the file said little or nothing.
 *
 * A two-column paste is most pastes, and it carries no acquisition metadata at
 * all: no instrument, no polarity, no collision energy. A panel that answered
 * that with an empty table would be saying "this file is a mystery" when the
 * truth is far more useful — it is this file, read as that format, holding so
 * many peaks between these two masses. So the facts the viewer knows about
 * every spectrum, whatever it came from, are gathered here as rows of the same
 * two-column table the metadata itself fills, and a panel renders one table
 * either way.
 *
 * Everything here is a pure function of one spectrum, so what the panels say
 * can be tested without mounting them.
 */

import {
  formatMz,
  formatMzRange,
  massFormatLabel,
  resolutionBasisLabel,
  resolutionLabel,
  resolvingPowerLabel,
} from './massFormat.ts';
import { MZ_DECIMALS } from './massResolution.ts';
import type { MassMetaField, MassSpectrum } from './massSpectrum.ts';
import { resolutionOf } from './resolutionOf.ts';

/**
 * The rows the acquisition table shows for a spectrum.
 *
 * The file's own records win whenever it wrote any, in the order
 * `buildMassMeta` fixed — that order is how a method is read, from what the
 * sample was measured on down to who measured it, and re-sorting it here would
 * scatter a method across the table. A file that wrote none falls back to what
 * the viewer knows regardless.
 * @param spectrum - The spectrum the panel is about.
 * @param mzDecimals - How many decimals its masses are written with. Defaults
 * to four.
 * @returns The rows, in display order, never empty.
 */
export function spectrumMetaRows(
  spectrum: MassSpectrum,
  mzDecimals = MZ_DECIMALS.high,
): MassMetaField[] {
  const fields = spectrum.meta?.fields ?? [];
  return fields.length > 0 ? fields : spectrumFileFields(spectrum, mzDecimals);
}

/**
 * What the viewer knows about a spectrum without the file's help.
 *
 * Every row is read off the spectrum as it was loaded — where it came from,
 * which acquisition of it, and how many points survived the peak picking — so
 * this answers for a pasted peak list exactly as well as for a scan of a run.
 * @param spectrum - The spectrum the panel is about.
 * @param mzDecimals - How many decimals its masses are written with. Defaults
 * to four.
 * @returns The rows, in display order.
 */
export function spectrumFileFields(
  spectrum: MassSpectrum,
  mzDecimals = MZ_DECIMALS.high,
): MassMetaField[] {
  const { origin, centroid, profile } = spectrum;
  const rows: MassMetaField[] = [{ label: 'Name', value: spectrum.name }];

  if (origin.fileName === undefined) {
    rows.push({
      label: 'Source',
      value:
        origin.format === 'calculated'
          ? 'Calculated in the viewer'
          : 'Pasted, not read from a file',
    });
  } else {
    rows.push({ label: 'File', value: origin.fileName });
  }
  rows.push({ label: 'Format', value: massFormatLabel(origin.format) });

  if (origin.scanIndex !== undefined) {
    rows.push({ label: 'Scan', value: scanNumber(origin.scanIndex) });
  }
  if (origin.msLevel !== undefined) {
    rows.push({ label: 'MS level', value: String(origin.msLevel) });
  }
  if (origin.polarity !== undefined) {
    rows.push({ label: 'Polarity', value: origin.polarity });
  }
  if (origin.precursorMz !== undefined) {
    rows.push({ label: 'Precursor m/z', value: formatMz(origin.precursorMz) });
  }
  // Only where it differs from the row above. Listed always, it would repeat
  // the precursor on nearly every Thermo scan and say nothing; listed here, it
  // is the one place a reader learns that the instrument was after a molecule
  // the window it cut does not contain.
  if (
    origin.precursorMonoisotopicMz !== undefined &&
    origin.precursorMonoisotopicMz !== origin.precursorMz
  ) {
    rows.push({
      label: 'Monoisotopic m/z',
      value: formatMz(origin.precursorMonoisotopicMz),
    });
  }
  if (origin.retentionTime !== undefined) {
    rows.push({
      label: 'Retention time',
      value: `${origin.retentionTime.toFixed(2)} min`,
    });
  }

  rows.push({ label: 'Peaks', value: String(centroid.x.length) });
  if (profile !== null) {
    rows.push({ label: 'Profile points', value: String(profile.x.length) });
  }
  const range = formatMzRange(centroid.x, mzDecimals);
  if (range !== '') rows.push({ label: 'm/z range', value: range });
  return rows;
}

/**
 * The rows that say how finely a spectrum resolves masses, and how that was
 * decided — the verdict read off the decimals of a peak table is a weaker claim
 * than one measured on the widths of its peaks, and the table says which.
 * @param spectrum - The spectrum the panel is about.
 * @returns One row, or two when a resolving power was measured.
 */
export function spectrumResolutionRows(
  spectrum: MassSpectrum,
): MassMetaField[] {
  const resolution = resolutionOf(spectrum);
  const rows: MassMetaField[] = [
    {
      label: 'Resolution',
      value: `${resolutionLabel(resolution)}, ${resolutionBasisLabel(resolution)}`,
    },
  ];
  if (resolution.resolvingPower !== null) {
    rows.push({
      label: 'Resolving power',
      value: `${resolvingPowerLabel(resolution.resolvingPower)} at half height`,
    });
  }
  return rows;
}

/** What the line under a spectrum's name says besides its acquisition. */
export interface SpectrumSubtitleOptions {
  /**
   * Whether the line also says what kind of spectrum it is — profile or
   * centroid first, and its resolution last. Worth it on a list of files that
   * differ in exactly that; noise on a list of scans out of one run, every one
   * of which is the same kind as the next.
   * @default false
   */
  describeKind?: boolean;
}

/**
 * The one line under a spectrum's name in the list.
 *
 * A file of a thousand scans gives a thousand rows whose names all start with
 * the same file name, so the row has to carry whatever tells one acquisition
 * from the next — which scan, which MS level, what was fragmented and when it
 * eluted. Those are exactly the facts the row is picked by.
 * @param spectrum - The spectrum the row is of.
 * @param options - See {@link SpectrumSubtitleOptions}.
 * @returns The line, the peak count alone for a spectrum with no origin facts.
 * @example
 * spectrumSubtitle(scan); // 'Scan 12 · MS2 · precursor 452.1900 · 3.42 min · 128 peaks'
 * spectrumSubtitle(file, { describeKind: true }); // 'profile · 10 peaks · high resolution'
 */
export function spectrumSubtitle(
  spectrum: MassSpectrum,
  options: SpectrumSubtitleOptions = {},
): string {
  const { describeKind = false } = options;
  const { origin, centroid, profile } = spectrum;
  const parts: string[] = [];

  if (describeKind) parts.push(profile === null ? 'centroid' : 'profile');

  if (origin.scanIndex !== undefined) {
    parts.push(`Scan ${scanNumber(origin.scanIndex)}`);
  }
  if (origin.msLevel !== undefined) parts.push(`MS${origin.msLevel}`);
  if (origin.polarity !== undefined) parts.push(origin.polarity);
  if (origin.precursorMz !== undefined) {
    parts.push(`precursor ${formatMz(origin.precursorMz)}`);
  }
  if (origin.retentionTime !== undefined) {
    parts.push(`${origin.retentionTime.toFixed(2)} min`);
  }

  const peaks = centroid.x.length;
  parts.push(`${peaks} peak${peaks === 1 ? '' : 's'}`);
  if (describeKind) parts.push(resolutionLabel(resolutionOf(spectrum)));
  return parts.join(' · ');
}

/**
 * Which acquisition of its file a scan is, counted from one as every list of
 * scans counts them — `MassOrigin.scanIndex` counts from zero, and a scan
 * listed as 23 in one table and 24 in the next reads as two scans.
 * @param scanIndex - Which acquisition of the file, counted from zero.
 * @returns Its number, counted from one.
 * @example
 * scanNumber(23); // '24'
 */
function scanNumber(scanIndex: number): string {
  return String(scanIndex + 1);
}
