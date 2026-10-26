/**
 * The centroid as `ms-spectrum` wants to see it, and the windowing built on it.
 *
 * Everything that package does to a peak table — filtering it to a window,
 * keeping the most intense, ranking the best — takes and returns an array of
 * `{ x, y }` objects, while this package holds peaks as three parallel typed
 * arrays. The translation is therefore paid on every zoom and every pointer
 * move unless it is paid once, which is what this file is for.
 */

import { getPeaks } from 'ms-spectrum';

import type { MassPeaks } from './massSpectrum.ts';

/**
 * One peak in the shape `ms-spectrum` speaks.
 *
 * `charge` is always present and `0` stands for "none was established", where
 * `ms-spectrum` leaves the property off entirely — the column it comes from is
 * dense, and a consumer reading `peak.charge > 1` should not have to remember
 * which of the two conventions it is holding.
 */
export interface MassPeakObject {
  /** Where the peak sits, in m/z. */
  x: number;
  /** Its intensity, on the 0–100 scale the analysis normalised to. */
  y: number;
  /** The charge of the series it belongs to, `0` where none was established. */
  charge: number;
}

/** Which peaks of a centroid a window is interested in. */
export interface SelectCentroidPeaksOptions {
  /**
   * Lowest m/z considered.
   * @default the m/z of the first peak
   */
  from?: number;
  /**
   * Highest m/z considered.
   * @default the m/z of the last peak
   */
  to?: number;
  /**
   * Smallest intensity kept, as a fraction of the base peak of the whole
   * spectrum rather than of the window — zooming into the baseline shows the
   * baseline, not peaks promoted by their neighbours scrolling off.
   * @default 0.01
   */
  threshold?: number;
  /**
   * How many peaks at most, keeping the most intense. `0` is read as no limit.
   * @default undefined
   */
  limit?: number;
}

/**
 * The peaks of a centroid as objects, built once and handed out again.
 *
 * Kept in a `WeakMap` on the centroid itself rather than recomputed: a spectrum
 * is windowed on every zoom and every pointer move, and a hundred thousand
 * short-lived objects a gesture is what makes a viewer stutter. The centroid is
 * replaced on a change and never written into, so its identity is a sound key,
 * and the entry goes when the spectrum does. The objects are shared with every
 * caller and with the cache — read them, never write into them.
 * @param centroid - The picked peaks.
 * @returns The same peaks as objects, in increasing m/z.
 * @throws {RangeError} When the three columns are not the same length.
 */
export function centroidPeakObjects(centroid: MassPeaks): MassPeakObject[] {
  const cached = peakObjectCache.get(centroid);
  if (cached !== undefined) return cached;

  const count = centroid.x.length;
  if (centroid.y.length !== count || centroid.charge.length !== count) {
    throw new RangeError(
      `The centroid carries ${count} masses, ${centroid.y.length} intensities and ${centroid.charge.length} charges; every peak needs one of each`,
    );
  }
  const objects = new Array<MassPeakObject>(count);
  for (let index = 0; index < count; index++) {
    objects[index] = {
      x: centroid.x[index] as number,
      y: centroid.y[index] as number,
      charge: centroid.charge[index] as number,
    };
  }
  peakObjectCache.set(centroid, objects);
  return objects;
}

/**
 * The peaks of a window, at most so many of them and the most intense kept.
 *
 * What a peak table asks for on every zoom: a centroid has far more peaks than
 * anybody reads, and which ones are worth a row changes with the window. It
 * reads the cached objects, so a zoom costs the filtering alone.
 * @param centroid - The picked peaks.
 * @param options - The window, and how many peaks it has room for.
 * @returns The selected peaks, in increasing m/z, sharing the cached objects.
 */
export function selectCentroidPeaks(
  centroid: MassPeaks,
  options: SelectCentroidPeaksOptions = {},
): MassPeakObject[] {
  const objects = centroidPeakObjects(centroid);
  // `getPeaks` reads the window it was given no bounds for off the first and
  // last peak, which it cannot do when there are none.
  if (objects.length === 0) return [];
  return getPeaks(objects, options) as MassPeakObject[];
}

const peakObjectCache = new WeakMap<MassPeaks, MassPeakObject[]>();
