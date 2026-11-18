/**
 * Drawing one spectrum taller or shorter than the others on a shared axis.
 *
 * The axis stays the measurement's, so a spectrum scaled up is a picture of
 * the measurement and not a new one: every number written on the chart — the
 * labels, the peak under the pointer — is still read off the measured trace.
 * Only where a sample is drawn moves.
 */

import type { ChartScale } from '../../chart/core/chartScale.ts';

import type { MassSpectrum } from './massSpectrum.ts';

/**
 * How many times taller than measured a spectrum is drawn.
 * @param spectrum - The spectrum.
 * @returns Its `verticalScale`, `1` when that is not a positive finite number.
 */
export function verticalScaleOf(spectrum: MassSpectrum): number {
  const { verticalScale } = spectrum;
  return verticalScale !== undefined &&
    Number.isFinite(verticalScale) &&
    verticalScale > 0
    ? verticalScale
    : 1;
}

/**
 * The intensity axis one spectrum is drawn against: the chart's, stretched by
 * the spectrum's own scale about the baseline, so zero stays where every stick
 * stands.
 *
 * A spectrum drawn as measured gets the chart's scale itself back rather than
 * an equal copy, because the traces memoise their paths on the scale's
 * identity and a copy per render would rebuild every path on every render.
 * @param yScale - The chart's intensity axis.
 * @param spectrum - The spectrum.
 * @returns The axis to draw it against.
 */
export function spectrumYScale(
  yScale: ChartScale,
  spectrum: MassSpectrum,
): ChartScale {
  const scale = verticalScaleOf(spectrum);
  return scale === 1
    ? yScale
    : { offset: yScale.offset, factor: yScale.factor * scale };
}
