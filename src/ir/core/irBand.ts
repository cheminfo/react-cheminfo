/**
 * One band picked out of a spectrum.
 *
 * A band is the infrared analogue of a mass spectrum's peak: the thing a chemist
 * points at, names, and reads a functional group off. It carries both value axes
 * for the same reason the spectrum does — the band a reader sees at 30 percent
 * transmittance and the one a table calls strongly absorbing are one band, and
 * making the caller convert to find out would be the conversion this package
 * does not do.
 */

/**
 * How strong a band is, in the letters a correlation table uses.
 *
 * `w` weak, `m` medium, `S` strong — `ir-spectrum` decides which from where the
 * band sits between the spectrum's own extremes, so the letters are relative to
 * the spectrum in hand rather than to an absolute absorbance. That is what a
 * printed table means by them too.
 */
export type IrBandStrength = 'w' | 'm' | 'S';

/** One band picked out of one spectrum. */
export interface IrBand {
  /** Identity of the spectrum it was picked from. */
  spectrumId: string;
  /** Where it sits, in cm⁻¹. */
  wavenumber: number;
  /** Its absorbance, which is what it was picked as a maximum of. */
  absorbance: number;
  /** Its percent transmittance, the same band read the other way up. */
  transmittance: number;
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
