/**
 * Which peak the pointer is asking about.
 *
 * One question, asked by the crosshair, by the click that hands a panel an
 * energy to look up and by the hover that lights the matching row of the peak
 * table — so it is answered once, here, and all three agree about what is under
 * the pointer.
 */

import type { ChartScale } from '../../chart/core/chartScale.ts';
import { chartPixel } from '../../chart/core/chartScale.ts';

import { axisEnergy } from './energyAxis.ts';
import type { XpsPeak, XpsSpectrum } from './xpsSpectrum.ts';
import type { EnergyAxis } from './xpsState.ts';

/**
 * How far from a peak the pointer may be and still be on it, in screen pixels.
 *
 * A screen distance, not an energy one: it is the size of a pointing gesture and
 * has nothing to say about how close two binding energies are. Six pixels is
 * about the jitter of a hand resting on a trackpad, and narrow enough that the
 * two lines of a 3d doublet a zoomed axis has pulled apart stay separately
 * reachable.
 */
export const PEAK_HIT_RADIUS = 6;

/** The peak under the pointer, and which spectrum it belongs to. */
export interface NearestPeak {
  /** The spectrum whose detection found it. */
  spectrumId: string;
  /** The peak itself, exactly as that spectrum records it. */
  peak: XpsPeak;
  /** Where it sits on the axis being drawn, in eV. */
  energy: number;
}

/**
 * The peak the pointer is on, tested on energy alone.
 *
 * Only the horizontal distance is measured, so the whole column above a peak is
 * reachable up to the top of the plot. Matching in two dimensions instead sounds
 * more precise and is unusable: the target for a satellite at one percent of the
 * main line would be the few pixels around its tip, so the smallest features —
 * the ones worth interrogating — become the hardest to reach, and anywhere near
 * the top of a tall peak two neighbours are both within the radius, so the
 * answer flickers between them as the hand moves vertically by a pixel.
 *
 * Peaks kept out of the automatic window are still hit-tested: `excludeFromDomain`
 * says a trace must not move the axes, not that it may not be interrogated. A
 * hidden spectrum is skipped, since a trace that is not on screen cannot be
 * pointed at.
 * @param spectra - Everything the chart holds.
 * @param axis - The axis the chart is drawn against, which the peaks — recorded
 * in binding energy — are placed on.
 * @param xScale - The energy axis as it is currently zoomed.
 * @param pixelX - Where the pointer is, in the same pixels the scale speaks.
 * @param maxDistance - How far away a peak may be, in pixels; one exactly that
 *   far away misses. Defaults to `PEAK_HIT_RADIUS`.
 * @returns The closest peak within that distance, `null` when there is none.
 */
export function nearestPeakEnergy(
  spectra: readonly XpsSpectrum[],
  axis: EnergyAxis,
  xScale: ChartScale,
  pixelX: number,
  maxDistance = PEAK_HIT_RADIUS,
): NearestPeak | null {
  let best: NearestPeak | null = null;
  let bestDistance = maxDistance;
  for (const spectrum of spectra) {
    if (!spectrum.visible) continue;
    for (const peak of spectrum.peaks) {
      const energy = axisEnergy(
        peak.bindingEnergy,
        spectrum.sourceEnergy,
        axis,
      );
      const distance = Math.abs(chartPixel(xScale, energy) - pixelX);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = { spectrumId: spectrum.id, peak, energy };
      }
    }
  }
  return best;
}

/**
 * Whether two answers about the peak under the pointer say the same thing.
 *
 * Compared by identity of the peak rather than by its energy: two peaks of two
 * spectra can sit at the very same binding energy — the same transition of two
 * samples is the commonest case of all — and a comparison on energy alone would
 * declare them one, so the highlight would light the wrong table row.
 * @param current - What was last reported.
 * @param next - What would be reported now.
 * @returns Whether the report can be skipped.
 */
export function sameNearestPeak(
  current: NearestPeak | null,
  next: NearestPeak | null,
): boolean {
  if (current === next) return true;
  if (current === null || next === null) return false;
  return (
    current.spectrumId === next.spectrumId && current.peak.id === next.peak.id
  );
}
