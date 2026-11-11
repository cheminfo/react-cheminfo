/**
 * The bands of a spectrum as a host writes them, and back: the peaks of the
 * host protocol's `spectra.ir.*`, `spectra.raman.*` and `spectra.uv.*` kinds.
 *
 * A peak differs from the band the viewer holds in two ways only: a
 * transmittance is a fraction where the viewer holds a percentage, and a
 * strength is a word (`strong`) where the viewer holds a table's letter (`S`).
 * A UV-vis peak names its position `wavelength`, which the viewer holds as
 * `wavenumber` whatever the technique.
 */

import { xFindClosestIndex } from 'ml-spectra-processing';

import type { BandStrength } from '../../host/core/bandStrength.ts';
import type { IrPeakValue } from '../../host/core/irKinds.ts';
import type { RamanPeakValue } from '../../host/core/ramanKinds.ts';
import type { UvPeakValue } from '../../host/core/uvKinds.ts';

import { bandAtIndex } from './handPicking.ts';
import type { IrBand, IrBandStrength } from './irBand.ts';
import type { IrSpectrum } from './irSpectrum.ts';
import { orderedBands } from './spectrumBands.ts';

/**
 * The bands a host handed over with an infrared spectrum.
 *
 * Each stays where the host put it, with the values it gave; a value it left
 * out is read off the spectrum at the nearest sample.
 * @param spectrum - The spectrum they were picked on.
 * @param peaks - The peaks, in any order.
 * @returns The bands, ascending, one per wavenumber.
 */
export function bandsFromIrPeaks(
  spectrum: IrSpectrum,
  peaks: readonly IrPeakValue[],
): IrBand[] {
  return bandsFromPeaks(spectrum, peaks, absorptionValues);
}

/**
 * The bands a host handed over with a Raman spectrum, kept as
 * {@link bandsFromIrPeaks} keeps infrared ones.
 * @param spectrum - The spectrum they were picked on.
 * @param peaks - The peaks, in any order.
 * @returns The bands, ascending, one per shift.
 */
export function bandsFromRamanPeaks(
  spectrum: IrSpectrum,
  peaks: readonly RamanPeakValue[],
): IrBand[] {
  return bandsFromPeaks(spectrum, peaks, (peak) =>
    peak.intensity === undefined ? {} : { intensity: peak.intensity },
  );
}

/**
 * The maxima a host handed over with a UV-vis or a fluorescence spectrum, kept
 * as {@link bandsFromIrPeaks} keeps infrared bands.
 * @param spectrum - The spectrum they were picked on.
 * @param peaks - The peaks, in any order.
 * @returns The bands, ascending, one per wavelength.
 */
export function bandsFromUvPeaks(
  spectrum: IrSpectrum,
  peaks: readonly UvPeakValue[],
): IrBand[] {
  const positioned: Array<UvPeakValue & { wavenumber: number }> = [];
  for (const peak of peaks) {
    positioned.push({ ...peak, wavenumber: peak.wavelength });
  }
  return bandsFromPeaks(spectrum, positioned, (peak) => ({
    ...absorptionValues(peak),
    ...(peak.intensity === undefined ? {} : { intensity: peak.intensity }),
  }));
}

/**
 * An infrared spectrum's bands as a host keeps them: `spectra.ir.peaks`.
 * @param bands - The bands, as the viewer holds them.
 * @returns The peaks, in the same order.
 */
export function irPeaksFromBands(bands: readonly IrBand[]): IrPeakValue[] {
  const peaks: IrPeakValue[] = [];
  for (const { wavenumber, absorbance, transmittance, strength } of bands) {
    peaks.push({
      wavenumber,
      ...(absorbance === undefined ? {} : { absorbance }),
      ...(transmittance === undefined
        ? {}
        : { transmittance: transmittance / 100 }),
      strength: WORDS[strength],
    });
  }
  return peaks;
}

/**
 * A UV-vis or a fluorescence spectrum's maxima as a host keeps them:
 * `spectra.uv.peaks`.
 * @param bands - The bands, as the viewer holds them.
 * @returns The peaks, in the same order.
 */
export function uvPeaksFromBands(bands: readonly IrBand[]): UvPeakValue[] {
  const peaks: UvPeakValue[] = [];
  for (const band of bands) {
    const { wavenumber, absorbance, transmittance, intensity, strength } = band;
    peaks.push({
      wavelength: wavenumber,
      ...(absorbance === undefined ? {} : { absorbance }),
      ...(transmittance === undefined
        ? {}
        : { transmittance: transmittance / 100 }),
      ...(intensity === undefined ? {} : { intensity }),
      strength: WORDS[strength],
    });
  }
  return peaks;
}

/**
 * A Raman spectrum's bands as a host keeps them: `spectra.raman.peaks`.
 * @param bands - The bands, as the viewer holds them.
 * @returns The peaks, in the same order.
 */
export function ramanPeaksFromBands(
  bands: readonly IrBand[],
): RamanPeakValue[] {
  const peaks: RamanPeakValue[] = [];
  for (const { wavenumber, intensity, strength } of bands) {
    peaks.push({
      wavenumber,
      ...(intensity === undefined ? {} : { intensity }),
      strength: WORDS[strength],
    });
  }
  return peaks;
}

const WORDS: Record<IrBandStrength, BandStrength> = {
  w: 'weak',
  m: 'medium',
  S: 'strong',
};

const LETTERS: Record<BandStrength, IrBandStrength> = {
  weak: 'w',
  medium: 'm',
  strong: 'S',
};

/**
 * What a peak a host wrote says of the light absorbed, as the viewer holds it.
 * @param peak - The peak.
 * @returns Its absorbance and its transmittance as a percentage, where given.
 */
function absorptionValues(
  peak: Pick<IrPeakValue, 'absorbance' | 'transmittance'>,
): Partial<IrBand> {
  return {
    ...(peak.absorbance === undefined ? {} : { absorbance: peak.absorbance }),
    ...(peak.transmittance === undefined
      ? {}
      : { transmittance: peak.transmittance * 100 }),
  };
}

function bandsFromPeaks<
  Peak extends { wavenumber: number; strength?: BandStrength },
>(
  spectrum: IrSpectrum,
  peaks: readonly Peak[],
  valuesOf: (peak: Peak) => Partial<IrBand>,
): IrBand[] {
  const bands: IrBand[] = [];
  for (const peak of peaks) {
    const { wavenumber } = peak;
    if (!Number.isFinite(wavenumber)) continue;
    const read = bandAtIndex(
      spectrum,
      xFindClosestIndex(spectrum.wavenumber, wavenumber),
    );
    if (read === null) continue;
    const { strength } = peak;
    bands.push({
      ...read,
      wavenumber,
      ...valuesOf(peak),
      strength: strength === undefined ? read.strength : LETTERS[strength],
    });
  }
  return orderedBands(spectrum.id, bands);
}
