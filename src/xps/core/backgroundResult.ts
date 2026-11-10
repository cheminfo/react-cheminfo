/**
 * What every background answers with, and the level its ends are pinned to.
 *
 * The three backgrounds disagree about what happens between the ends of a
 * window and agree about everything else: each returns the curve it drew and
 * the window with that curve taken off, in arrays as long as the window, so a
 * chart can draw the one and an integration can read the other without knowing
 * which background produced them.
 *
 * The ends are where they all start. A background is a claim about what the
 * signal would have been with no peak in it, and the only evidence for that
 * claim is the trace on either side of the peak, so every one of them is
 * anchored at those two levels and differs only in the path it takes between.
 */

import { xMean } from 'ml-spectra-processing';

import type { XpsTrace } from './xpsSpectrum.ts';

/** A background under a window, and the window with it taken off. */
export interface BackgroundResult {
  /** The background, one value per point of the window. */
  background: Float64Array;
  /** The window less the background, one value per point. */
  corrected: Float64Array;
}

/** What every background is told, whichever one it is. */
export interface BackgroundOptions {
  /**
   * How many points at each end of the window are averaged into the level the
   * background is anchored there. One is what a fit does when the window ends
   * on quiet baseline; a few more are worth averaging when it ends on a noisy
   * one, since a single count taken as the anchor carries its own noise into
   * every area computed under it.
   * @default 1
   */
  averageWidth?: number;
}

/** The counts a background is pinned to at each end of a window. */
export interface EndpointLevels {
  /** Mean counts over the first points: the low-binding-energy end. */
  low: number;
  /** Mean counts over the last points: the high-binding-energy end. */
  high: number;
}

/**
 * The level at each end of a window, averaged over as many points as asked for.
 *
 * `low` and `high` are the ends of the *binding-energy* axis and never of the
 * counts: on a photoemission line the second is the larger of the two, because
 * the electrons scattered out of the peak are recorded above it in binding
 * energy and pile up on that side. A caller reading `low` expecting the smaller
 * number has the axis and the intensity confused.
 * @param trace - The window, x ascending in binding energy.
 * @param averageWidth - How many points at each end are averaged, at least one.
 * @returns The level at the low- and at the high-binding-energy end.
 */
export function endpointLevels(
  trace: XpsTrace,
  averageWidth = 1,
): EndpointLevels {
  const length = trace.y.length;
  if (length === 0) return { low: 0, high: 0 };

  const asked = Number.isFinite(averageWidth) ? Math.round(averageWidth) : 1;
  const width = Math.min(length, Math.max(1, asked));
  return {
    low: xMean(trace.y, { fromIndex: 0, toIndex: width - 1 }),
    high: xMean(trace.y, { fromIndex: length - width, toIndex: length - 1 }),
  };
}
