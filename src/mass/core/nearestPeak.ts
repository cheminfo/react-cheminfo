/**
 * Which peak the pointer is asking about.
 *
 * One question, asked by the crosshair, by the click that frames a peak and by
 * the hover that lights a row of the peak table — so it is answered once, here,
 * and all three agree about what is under the pointer.
 */

import { xFindClosestIndex } from 'ml-spectra-processing';

import type { ChartScale } from '../../chart/core/chartScale.ts';
import { chartPixel, chartValue } from '../../chart/core/chartScale.ts';

import type { MassSpectrum } from './massSpectrum.ts';
import { isSpectrumDrawn } from './massSpectrum.ts';

/**
 * How far from a stick the pointer may be and still be on it, in screen pixels.
 *
 * A screen distance, not a mass one: it is the size of a pointing gesture and
 * has nothing to say about how close two m/z values are. Six pixels is about the
 * jitter of a hand resting on a trackpad, and narrow enough that two sticks a
 * few tenths apart on a zoomed axis stay separately reachable.
 */
export const PEAK_HIT_RADIUS = 6;

/** The peak under the pointer, and which spectrum it belongs to. */
export interface NearestPeak {
  /** The spectrum whose centroid holds it. */
  spectrumId: string;
  /** Where it sits in that centroid, for looking its charge up. */
  index: number;
  /** Its m/z, exactly as the centroid records it. */
  mz: number;
  /** Its intensity. */
  intensity: number;
}

/**
 * The peak the pointer is on, tested on m/z alone.
 *
 * Only the horizontal distance is measured, so the whole column above a stick is
 * within reach up to the top of the plot. Matching in two dimensions instead
 * sounds more precise and is unusable: the target for a peak at one percent of
 * the base peak would be the few pixels around its tip, so the smallest peaks —
 * the ones worth interrogating — become the hardest to reach.
 * @param spectra - What the chart draws; those with neither trace drawn are
 * skipped. A spectrum drawn as its profile answers with its picked peaks all the
 * same — they are what the pointer is really asking after.
 * @param xScale - The m/z axis as it is currently zoomed.
 * @param pixelX - Where the pointer is, in the same pixels the scale speaks.
 * @param maxDistance - How far away a stick may be, in pixels; a stick exactly
 * that far away misses. Defaults to `PEAK_HIT_RADIUS`.
 * @returns The closest peak within that distance, `null` when there is none.
 */
export function nearestPeakMz(
  spectra: readonly MassSpectrum[],
  xScale: ChartScale,
  pixelX: number,
  maxDistance = PEAK_HIT_RADIUS,
): NearestPeak | null {
  const target = chartValue(xScale, pixelX);
  let best: NearestPeak | null = null;
  let bestDistance = maxDistance;
  for (const spectrum of spectra) {
    if (!isSpectrumDrawn(spectrum)) continue;
    const { x, y } = spectrum.centroid;
    if (x.length === 0) continue;
    const index = xFindClosestIndex(x, target);
    const mz = x[index] as number;
    const distance = Math.abs(chartPixel(xScale, mz) - pixelX);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = {
        spectrumId: spectrum.id,
        index,
        mz,
        intensity: y[index] as number,
      };
    }
  }
  return best;
}

/**
 * The peak a gesture landed on, given where it landed in m/z.
 *
 * A gesture is reported in the units the chart is measured in, while how near a
 * stick has to be to be the one meant is a distance on the screen — so the mass
 * goes back through the scale rather than the radius being turned into a mass,
 * which would be a different tolerance at every zoom.
 * @param spectra - What the chart draws.
 * @param xScale - The m/z axis as it is currently zoomed.
 * @param mz - Where the gesture landed, in m/z.
 * @param maxDistance - How far away a stick may be, in pixels. Defaults to
 * `PEAK_HIT_RADIUS`.
 * @returns The closest peak within that distance, `null` when there is none.
 */
export function peakAtMz(
  spectra: readonly MassSpectrum[],
  xScale: ChartScale,
  mz: number,
  maxDistance = PEAK_HIT_RADIUS,
): NearestPeak | null {
  return nearestPeakMz(spectra, xScale, chartPixel(xScale, mz), maxDistance);
}

/**
 * Whether two answers about the peak under the pointer say the same thing.
 *
 * The m/z is compared exactly, and that is not an oversight: both numbers were
 * read out of the same centroid by the same index, so either they are the very
 * same measurement or they are two different peaks. A tolerance here would
 * declare an isotopologue pair a millimass unit apart to be one peak.
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
    current.spectrumId === next.spectrumId &&
    current.index === next.index &&
    current.mz === next.mz
  );
}
