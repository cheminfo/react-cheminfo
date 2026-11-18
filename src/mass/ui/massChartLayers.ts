/**
 * Which spectrum a mass chart writes its labels on, in what order it paints
 * them, and against which intensity axis each one is drawn.
 */

import type { ChartScale } from '../../chart/core/chartScale.ts';
import type { MassSpectrum } from '../core/massSpectrum.ts';
import { spectrumYScale } from '../core/verticalScale.ts';

/**
 * The one spectrum whose peaks are labelled.
 * @param spectra - What the chart draws.
 * @param labelledId - The identity asked for, `null` for none, absent to let the
 * chart take the first.
 * @returns The spectrum, or `null` when none answers.
 */
export function labelledSpectrum(
  spectra: readonly MassSpectrum[],
  labelledId: string | null | undefined,
): MassSpectrum | null {
  if (labelledId === undefined) return spectra[0] ?? null;
  if (labelledId === null) return null;
  for (const spectrum of spectra) {
    if (spectrum.id === labelledId) return spectrum;
  }
  return null;
}

/**
 * The traces in painting order, with the emphasised one last — last is in
 * front, and in front is what lets a trace crossing a dozen others be followed.
 * @param spectra - The traces, in the order they were opened.
 * @param emphasisedId - Identity of the one to raise, `null` for none.
 * @returns The order to paint in — the array itself when nothing moves.
 */
export function emphasisedLast(
  spectra: readonly MassSpectrum[],
  emphasisedId: string | null,
): readonly MassSpectrum[] {
  if (emphasisedId === null) return spectra;
  const at = spectra.findIndex((spectrum) => spectrum.id === emphasisedId);
  if (at === -1 || at === spectra.length - 1) return spectra;
  return [
    ...spectra.slice(0, at),
    ...spectra.slice(at + 1),
    spectra[at] as MassSpectrum,
  ];
}

/**
 * The intensity axis each spectrum is drawn against, by identity.
 * @param spectra - What the chart draws.
 * @param yScale - The chart's intensity axis as it is currently zoomed.
 * @returns The axis of each spectrum — the chart's own for every spectrum drawn
 * as measured.
 */
export function spectrumYScales(
  spectra: readonly MassSpectrum[],
  yScale: ChartScale,
): Map<string, ChartScale> {
  const scales = new Map<string, ChartScale>();
  for (const spectrum of spectra) {
    scales.set(spectrum.id, spectrumYScale(yScale, spectrum));
  }
  return scales;
}
