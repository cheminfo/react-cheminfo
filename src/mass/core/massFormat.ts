/**
 * How every number about a mass spectrum is written, wherever it is written.
 *
 * An m/z is written to the decimals the spectra on screen resolve — four for a
 * high-resolution measurement, none for a nominal-mass table, as
 * `mzDecimalsOf` settles it for all of them at once — and an intensity follows
 * it. Settled once here, so a table, an axis label and a tooltip never disagree
 * about how wide one number is.
 */

import {
  SCIENTIFIC_ABOVE,
  formatScientific,
} from '../../chart/core/axisLabels.ts';
import { formatInteger } from '../../format/core/numbers.ts';

import type { MassResolution } from './massResolution.ts';
import { MZ_DECIMALS } from './massResolution.ts';
import type { MassFormat } from './massSpectrum.ts';

/** Decimals an intensity is written with, on the 0–100 scale. */
export const INTENSITY_DECIMALS = 2;

/**
 * An m/z as every table, axis label and tooltip writes it.
 *
 * Always a fixed number of decimals, never `toPrecision` and never the shortest
 * form that round-trips: a column of masses is read by running an eye down it,
 * and `163` above `162.9871` above `164.1` is unreadable in a way that
 * `163.0000` above `162.9871` above `164.1000` is not.
 * @param mz - The mass-to-charge ratio.
 * @param decimals - How many decimals the spectra on screen resolve, as
 * `mzDecimalsOf` decides. Defaults to the high-resolution four.
 * @returns The number as it is written.
 */
export function formatMz(mz: number, decimals = MZ_DECIMALS.high): string {
  return mz.toFixed(decimals);
}

/**
 * An intensity as every table and tooltip writes it, on the 0–100 scale.
 *
 * It follows the m/z rather than being decided on its own: a nominal-mass peak
 * table quotes relative intensities as whole percentages too, and one column of
 * the same table rounded and the other not looks like a bug. Past the chart's
 * own `SCIENTIFIC_ABOVE`, and under a hundredth — where two decimals would write
 * a zero that is not one — the intensity is written as a power of ten, which is
 * how the axis beside it spells such numbers too.
 * @param intensity - The intensity, normalised to a base peak of 100, or the
 * counts themselves for a spectrum that kept them.
 * @param mzDecimals - How many decimals the masses beside it are written with.
 * Defaults to the high-resolution four.
 * @returns The number as it is written.
 */
export function formatIntensity(
  intensity: number,
  mzDecimals = MZ_DECIMALS.high,
): string {
  const decimals = mzDecimals === 0 ? 0 : INTENSITY_DECIMALS;
  if (intensity === 0) return (0).toFixed(decimals);
  const size = Math.abs(intensity);
  if (size >= SCIENTIFIC_ABOVE || size < PLAIN_BELOW) {
    return formatScientific(intensity, INTENSITY_DECIMALS);
  }
  return intensity.toFixed(decimals);
}

/**
 * A range of masses, low end first, as the list and the table write it.
 * @param masses - The m/z of every peak, ascending.
 * @param decimals - How many decimals to write them with.
 * @returns `43.8490 – 223.6762`, or `''` for a spectrum holding no peak.
 */
export function formatMzRange(masses: Float64Array, decimals: number): string {
  if (masses.length === 0) return '';
  const first = masses[0] as number;
  const last = masses.at(-1) as number;
  return `${formatMz(first, decimals)} – ${formatMz(last, decimals)}`;
}

/**
 * A format as a chemist writes it rather than as the code spells it.
 * @param format - The format the spectrum was read from.
 * @returns Its name; a format this package does not read, as it was given.
 */
export function massFormatLabel(format: MassFormat): string {
  return FORMAT_LABELS.get(format) ?? format;
}

/**
 * What a resolution verdict is called, in the words a status line uses.
 * @param resolution - The verdict.
 * @returns `high resolution`, `low resolution` or `nominal mass`.
 */
export function resolutionLabel(resolution: MassResolution): string {
  return RESOLUTION_LABELS[resolution.kind];
}

/**
 * A resolving power as it is quoted: approximately, and to two figures.
 *
 * Two significant figures because that is all a median over a score of peaks
 * can claim, and because `R ≈ 47,000` is how an instrument's resolution is
 * quoted on its data sheet.
 * @param resolvingPower - The resolving power `m / Δm`.
 * @returns `R ≈ 47,000`.
 */
export function resolvingPowerLabel(resolvingPower: number): string {
  return `R ≈ ${formatInteger(Number(resolvingPower.toPrecision(2)))}`;
}

/**
 * How a verdict was reached, said as a reader would want it said.
 * @param resolution - The verdict.
 * @returns The sentence fragment, e.g. `measured on the peak widths`.
 */
export function resolutionBasisLabel(resolution: MassResolution): string {
  return BASIS_LABELS[resolution.basis];
}

/**
 * The intensity below which two decimals have nothing left to say it in.
 *
 * A hundredth, which is exactly where `INTENSITY_DECIMALS` runs out: `0.01` is
 * the smallest number two decimals can write, and everything under it rounds to
 * a zero that is not one.
 */
const PLAIN_BELOW = 1e-2;

/**
 * How each format is spelled where it is shown: `mzML` and `netCDF` are the
 * names of the standards, capitals and all, and a table that showed `mzml`
 * would read as a typo in a panel whose whole purpose is to quote the file
 * faithfully. Every format a reader of the family hands spectra over in, the
 * vendor ones included, since a host reading them hands the format over too.
 */
const FORMAT_LABELS = new Map<MassFormat, string>([
  ['jcamp', 'JCAMP-DX'],
  ['text', 'Text, two columns'],
  ['calculated', 'Calculated'],
  ['mzml', 'mzML'],
  ['mzxml', 'mzXML'],
  ['mzdata', 'mzData'],
  ['imzml', 'imzML'],
  ['mzmlb', 'mzMLb'],
  ['netcdf', 'netCDF'],
  ['mgf', 'MGF'],
  ['msp', 'MSP library'],
  ['msn', 'MS1/MS2 text'],
  ['dta', 'Sequest DTA'],
  ['pkl', 'Micromass peak list'],
  ['asm', 'Allotrope ASM'],
  ['thermo', 'Thermo RAW'],
  ['uep', 'Waters UNIFI package'],
  ['watersraw', 'Waters RAW'],
  ['wiff', 'SCIEX WIFF'],
  ['wiff2', 'SCIEX WIFF2'],
  ['wiffscan', 'SCIEX WIFF scan file'],
  ['shimadzu', 'Shimadzu'],
  ['chemstationms', 'Agilent ChemStation MS'],
  ['chemstationch', 'Agilent ChemStation trace'],
  ['chemstationuv', 'Agilent ChemStation UV'],
  ['agilentdad', 'Agilent MassHunter device'],
  ['masshunter', 'Agilent MassHunter'],
  ['brukerflex', 'Bruker flex'],
  ['brukertsf', 'Bruker timsTOF (TSF)'],
  ['brukertdf', 'Bruker timsTOF (TDF)'],
  ['penx', 'PerkinElmer TotalChrom'],
  ['varian', 'Varian Saturn'],
  ['spc', 'Galactic SPC'],
  ['wdf', 'Renishaw WDF'],
  ['targetraster', 'AP-MALDI target raster'],
]);

/** How each kind of resolution is named. */
const RESOLUTION_LABELS: Record<MassResolution['kind'], string> = {
  high: 'high resolution',
  low: 'low resolution',
  nominal: 'nominal mass',
};

/** How each basis of a verdict is said. */
const BASIS_LABELS: Record<MassResolution['basis'], string> = {
  peakWidth: 'measured on the peak widths',
  instrument: 'stated by the file',
  decimals: 'read off the decimals written',
};
