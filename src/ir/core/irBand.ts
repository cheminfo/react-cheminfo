/**
 * One band picked out of a spectrum.
 *
 * A band is the vibrational analogue of a mass spectrum's peak: the thing a
 * chemist points at, names, and reads a functional group off. An infrared band
 * carries both value axes for the same reason its spectrum does — the band a
 * reader sees at 30 percent transmittance and the one a table calls strongly
 * absorbing are one band, and making the caller convert to find out would be the
 * conversion this package does not do. A Raman band carries its intensity.
 */

import type { IrMode } from './irSpectrum.ts';

/**
 * How strong a band is, in the letters a correlation table uses.
 *
 * `w` weak, `m` medium, `S` strong — decided from where the band sits between
 * the spectrum's own extremes, so the letters are relative to the spectrum in
 * hand rather than to an absolute value. That is what a printed table means by
 * them too. `ir-spectrum` decides it for an infrared band from its
 * transmittance, and the same rule is applied to a Raman band's intensity.
 */
export type IrBandStrength = 'w' | 'm' | 'S';

/** One band picked out of one spectrum. */
export interface IrBand {
  /** Identity of the spectrum it was picked from. */
  spectrumId: string;
  /** Where it sits, in cm⁻¹. */
  wavenumber: number;
  /**
   * Its absorbance, which an infrared band is picked as a maximum of.
   * @default undefined
   */
  absorbance?: number;
  /**
   * Its percent transmittance, the same infrared band read the other way up.
   * @default undefined
   */
  transmittance?: number;
  /**
   * Its intensity, which a Raman band is picked as a maximum of.
   * @default undefined
   */
  intensity?: number;
  /** How strong it is, relative to the spectrum it came from. */
  strength: IrBandStrength;
}

/**
 * Whether two bands are the same band.
 *
 * The wavenumber is compared exactly, and that is not an oversight: both numbers
 * were read out of the same picked band, so either they are the very same
 * measurement or they are two different bands. A tolerance here would declare a
 * carbonyl pair thirty wavenumbers apart to be one band.
 * @param current - What was last reported.
 * @param next - What would be reported now.
 * @returns Whether the report can be skipped.
 */
export function sameIrBand(
  current: IrBand | null,
  next: IrBand | null,
): boolean {
  if (current === next) return true;
  if (current === null || next === null) return false;
  return (
    current.spectrumId === next.spectrumId &&
    current.wavenumber === next.wavenumber
  );
}

/**
 * A band's value on the axis being read.
 * @param band - The band.
 * @param mode - Which value axis is being read.
 * @returns The value, or `undefined` when its spectrum carries no such axis.
 */
export function bandValue(band: IrBand, mode: IrMode): number | undefined {
  return band[mode];
}

/**
 * How tall a band stands, which is what a cut to the strongest bands ranks by.
 *
 * The value it was picked as a maximum of: its absorbance for an infrared band,
 * its intensity for a Raman one. Never its transmittance, in which a stronger
 * band is a smaller number.
 * @param band - The band.
 * @returns The height, or negative infinity for a band carrying neither, so it
 * ranks last.
 */
export function bandHeight(band: IrBand): number {
  return band.absorbance ?? band.intensity ?? Number.NEGATIVE_INFINITY;
}
