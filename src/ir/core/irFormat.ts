/**
 * How a wavenumber and a value are written, wherever they are written.
 *
 * One module for it because the chart labels, the crosshair readout and any
 * table beside them must agree to the digit: a band the chart calls 1715 and a
 * row that calls it 1714.6 read as two bands.
 */

import type { IrMode } from './irSpectrum.ts';

/** How many decimals an absorbance is written to. */
export const ABSORBANCE_DECIMALS = 3;

/** How many a percent transmittance is written to. */
export const TRANSMITTANCE_DECIMALS = 1;

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
 * sits.
 * @param value - The value.
 * @param mode - Which axis it is in.
 * @returns The number as a string, without its unit.
 */
export function formatIrValue(value: number, mode: IrMode): string {
  if (!Number.isFinite(value)) return '';
  return value.toFixed(
    mode === 'absorbance' ? ABSORBANCE_DECIMALS : TRANSMITTANCE_DECIMALS,
  );
}

/**
 * What the value axis is called where there is room for one word.
 * @param mode - Which axis is being drawn.
 * @returns `A` or `%T`, as a spectrum is annotated by hand.
 */
export function shortModeLabel(mode: IrMode): string {
  return mode === 'absorbance' ? 'A' : '%T';
}
