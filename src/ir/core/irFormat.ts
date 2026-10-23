/**
 * How a wavenumber and a value are written, wherever they are written.
 *
 * One module for it because the chart labels, the crosshair readout and any
 * table beside them must agree to the digit: a band the chart calls 1715 and a
 * row that calls it 1714.6 read as two bands.
 */

import { formatTrimmed } from '../../format/core/numbers.ts';

import type { IrMode } from './irSpectrum.ts';

/** How many decimals an absorbance is written to. */
export const ABSORBANCE_DECIMALS = 3;

/** How many a percent transmittance is written to. */
export const TRANSMITTANCE_DECIMALS = 1;

/** How many significant digits an intensity is written to. */
export const INTENSITY_DIGITS = 4;

/**
 * Write a wavenumber the way a chemist quotes one.
 *
 * As a whole number, because that is the precision the measurement actually
 * carries: a bench instrument samples every 2 or 4 cm⁻¹ and a printed
 * assignment is never quoted to a decimal. Writing 1714.6 would claim a
 * resolution the spectrum does not have.
 * @param wavenumber - The wavenumber, in cm⁻¹.
 * @returns The number as a string, or an empty string when there is no number.
 */
export function formatWavenumber(wavenumber: number): string {
  if (!Number.isFinite(wavenumber)) return '';
  return Math.round(wavenumber).toString();
}

/**
 * Write a value in whichever axis it belongs to.
 *
 * Three decimals for an absorbance and one for a percent transmittance, which is
 * roughly the same precision expressed two ways — an absorbance of 0.001 and a
 * transmittance of 0.2 percent are both about where a real spectrum's noise
 * sits. An intensity is counts from one instrument and a fraction of the
 * strongest band from another, so no count of decimals suits it: it keeps
 * `INTENSITY_DIGITS` significant digits instead.
 * @param value - The value.
 * @param mode - Which axis it is in.
 * @returns The number as a string, without its unit.
 */
export function formatIrValue(value: number, mode: IrMode): string {
  if (!Number.isFinite(value)) return '';
  const { decimals } = VALUE_FORMATS[mode];
  return decimals === undefined
    ? formatTrimmed(value, { significant: INTENSITY_DIGITS })
    : value.toFixed(decimals);
}

/**
 * What the value axis is called where there is room for one word.
 * @param mode - Which axis is being drawn.
 * @returns `A`, `%T` or `I`, as a spectrum is annotated by hand.
 */
export function shortModeLabel(mode: IrMode): string {
  return VALUE_FORMATS[mode].symbol;
}

/**
 * The range a spectrum covers, written in the order its axis is read.
 * @param wavenumbers - Its wavenumbers, ascending.
 * @param reversed - Whether the axis runs from high to low, as infrared's does.
 * @returns `4000–400 cm⁻¹` on a reversed axis, `100–3200 cm⁻¹` on one that is
 * not, and an empty string for a spectrum with no point.
 */
export function formatWavenumberRange(
  wavenumbers: Float64Array,
  reversed: boolean,
): string {
  const lowest = wavenumbers[0];
  const highest = wavenumbers.at(-1);
  if (lowest === undefined || highest === undefined) return '';
  const [first, last] = reversed ? [highest, lowest] : [lowest, highest];
  return `${formatWavenumber(first)}–${formatWavenumber(last)} cm⁻¹`;
}

/** How each value axis is written: its symbol, and its count of decimals. */
const VALUE_FORMATS: Record<IrMode, { symbol: string; decimals?: number }> = {
  transmittance: { symbol: '%T', decimals: TRANSMITTANCE_DECIMALS },
  absorbance: { symbol: 'A', decimals: ABSORBANCE_DECIMALS },
  intensity: { symbol: 'I' },
};
