/**
 * Finding the bands of a Raman spectrum, with the picker infrared bands are
 * found with.
 *
 * `autoPeakPicking` from `ir-spectrum` is `common-spectrum`'s, which runs
 * `ml-gsd` over whichever variable it is pointed at — the picker
 * `raman-spectrum` itself exports — and converts each peak to absorbance and
 * transmittance on top. A Raman band is a maximum of intensity, so the picker is
 * pointed at the intensity and only where each peak sits is read back: the
 * conversion speaks two axes a Raman spectrum does not have.
 *
 * The strength letter follows the rule `ir-spectrum` applies to transmittance,
 * applied to intensity: where the band's top sits between the spectrum's own
 * lowest and highest intensity — below a third weak, below two thirds medium,
 * strong above.
 */

import type { MeasurementXY } from 'cheminfo-types';
import { autoPeakPicking } from 'ir-spectrum';
import { xFindClosestIndex, xMinMaxValues } from 'ml-spectra-processing';

import type { IrBand, IrBandStrength } from './irBand.ts';
import type { IrSpectrum } from './irSpectrum.ts';

/** What the picker is asked, whichever technique it picks for. */
export type PeakPickingOptions = NonNullable<
  Parameters<typeof autoPeakPicking>[1]
>;

/**
 * The bands of a Raman spectrum, picked on its intensity.
 * @param spectrum - The spectrum to pick from.
 * @param intensity - Its intensity, which the bands are maxima of.
 * @param picking - Where to pick, and how finely.
 * @returns The bands, in the order they were found.
 */
export function ramanBands(
  spectrum: IrSpectrum,
  intensity: Float64Array,
  picking: PeakPickingOptions,
): IrBand[] {
  const { id, wavenumber } = spectrum;
  const picked = autoPeakPicking(measurementOf(wavenumber, intensity), {
    ...picking,
    yVariable: 'y',
  });
  const { min, max } = xMinMaxValues(intensity);

  const bands: IrBand[] = [];
  for (const peak of picked) {
    if (!Number.isFinite(peak.wavenumber)) continue;
    // The peak sits on a sample, so its intensity is read off that sample.
    const value = intensity[xFindClosestIndex(wavenumber, peak.wavenumber)];
    if (value === undefined) continue;
    bands.push({
      spectrumId: id,
      wavenumber: peak.wavenumber,
      intensity: value,
      strength: intensityStrength(value, min, max),
    });
  }
  return bands;
}

/**
 * How strong a band is, from where its top sits in the spectrum's range.
 * @param value - The band's intensity.
 * @param lowest - The spectrum's lowest intensity.
 * @param highest - Its highest.
 * @returns The letter a correlation table would use.
 */
export function intensityStrength(
  value: number,
  lowest: number,
  highest: number,
): IrBandStrength {
  const position = (value - lowest) / (highest - lowest);
  if (position < WEAK_BELOW) return 'w';
  if (position < MEDIUM_BELOW) return 'm';
  return 'S';
}

/** Below this fraction of the spectrum's range a band is weak. */
const WEAK_BELOW = 0.33;

/** Below this one it is medium, and strong from here up. */
const MEDIUM_BELOW = 0.66;

/**
 * The spectrum as `ir-spectrum` wants it: the shifts, and the intensity as `y`.
 * @param shift - The Raman shifts, ascending.
 * @param intensity - The intensity at each.
 * @returns The measurement.
 */
function measurementOf(
  shift: Float64Array,
  intensity: Float64Array,
): MeasurementXY {
  return {
    variables: {
      x: { label: 'Raman shift', units: '1/cm', symbol: 'x', data: shift },
      y: { label: 'Intensity', units: '', symbol: 'y', data: intensity },
    },
  };
}
