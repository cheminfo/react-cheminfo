/**
 * Which peaks of a spectrum are worth writing a label beside.
 *
 * A centroid holds tens of thousands of peaks and a chart has room for a dozen
 * labels, so something has to choose — and the choice is `ms-spectrum`'s slot
 * mechanism rather than anything invented here. The window is cut into ten
 * slots, the tallest peak of each is taken, and a peak falling in a slot that is
 * already spoken for comes back marked `close`. **Dropping the marked ones is
 * the whole of the selection**; what then still collides on a narrow chart is
 * settled by `planPeakLabels`, which gives the room to the taller peak.
 *
 * The slots are cut from the *window* and not from the spectrum, which is what
 * makes the choice follow the zoom: a survey scan has room to name its base peak
 * and a handful of others, and the same spectrum zoomed onto one isotopologue
 * cluster has room to name every line of it.
 */

import { xFindClosestIndex } from 'ml-spectra-processing';
import { getBestPeaks } from 'ms-spectrum';

import type { MassPeakObject } from './centroidPeaks.ts';
import { centroidPeakObjects } from './centroidPeaks.ts';
import type { MassSpectrum } from './massSpectrum.ts';
import { DEFAULT_LABEL_LIMIT } from './massState.ts';

/**
 * How many slots the window is cut into.
 *
 * Ten is `ms-spectrum`'s own default and is kept rather than exposed: it is the
 * number of labels a chart of any usual width can carry across it without one
 * sitting on the next.
 */
export const LABEL_SLOTS = 10;

/** How faint a peak may be, against the tallest one in the window, and still be labelled. */
export const LABEL_THRESHOLD = 0.01;

/** One peak that has earned a label, and where it sits in its centroid. */
export interface LabelledPeak extends MassPeakObject {
  /** Its index in the centroid, which is how anything else about it is found. */
  index: number;
}

/** The window the labels are chosen for, and how many there is room for. */
export interface SelectLabelledPeaksOptions {
  /**
   * Lowest m/z on screen.
   * @default the m/z of the first peak
   */
  from?: number;
  /**
   * Highest m/z on screen.
   * @default the m/z of the last peak
   */
  to?: number;
  /**
   * The tallest intensity the window shows. A peak above it has its tip off the
   * top of the plot, so a label placed there would name a stick whose height
   * cannot be read anyway — and leaving it out is also what puts the threshold
   * back on the tallest peak that *is* on screen, which is the whole point of
   * zooming into a baseline.
   * @default Number.POSITIVE_INFINITY
   */
  maxValue?: number;
  /**
   * How many peaks are labelled at most, the most intense first.
   * @default DEFAULT_LABEL_LIMIT
   */
  limit?: number;
  /**
   * How faint a peak may be against the tallest one in the window.
   * @default LABEL_THRESHOLD
   */
  threshold?: number;
}

/**
 * The peaks of a window that have earned a label.
 *
 * The peak objects are read off the centroid's cache rather than rebuilt, so a
 * zoom costs the selection alone and not a fresh object per peak of the
 * spectrum. What comes back is a copy each time — `getBestPeaks` clones what it
 * keeps, since it writes its `close` verdict onto the peak — so nothing here can
 * scribble on the cache every other reader shares.
 * @param spectrum - The spectrum whose peaks are being labelled.
 * @param options - The window, and how many labels there is room for.
 * @returns The chosen peaks, in increasing m/z, with the crowded ones dropped.
 */
export function selectLabelledPeaks(
  spectrum: MassSpectrum,
  options: SelectLabelledPeaksOptions = {},
): LabelledPeak[] {
  const {
    from,
    to,
    maxValue,
    limit = DEFAULT_LABEL_LIMIT,
    threshold = LABEL_THRESHOLD,
  } = options;

  const { centroid } = spectrum;
  const peaks = centroidPeakObjects(centroid);
  // `getBestPeaks` reads the window it was given no bounds for off the first and
  // last peak, which it cannot do when there are none.
  if (peaks.length === 0 || limit <= 0) return [];

  const best = getBestPeaks(peaks, {
    from,
    to,
    maxValue,
    limit,
    threshold,
    numberSlots: LABEL_SLOTS,
  }) as SlottedPeak[];

  const labelled: LabelledPeak[] = [];
  for (const peak of best) {
    // A peak the slots called close stands within a slot of one already
    // labelled, so labelling it too writes one label over the other.
    if (peak.close) continue;
    labelled.push({
      x: peak.x,
      y: peak.y,
      charge: peak.charge,
      index: xFindClosestIndex(centroid.x, peak.x),
    });
  }
  return labelled;
}

/** A peak as the slots hand it back: itself, and whether it is crowded. */
interface SlottedPeak extends MassPeakObject {
  /** Whether another kept peak stands within one slot of it. */
  close: boolean;
}
