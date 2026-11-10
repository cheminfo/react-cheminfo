/**
 * The one place a trace meets `ml-gsd`.
 *
 * Peak picking is asked for twice — once when a spectrum is read, and again
 * whenever the reader changes how hard it should look — and both answers are
 * the `XpsPeak[]` the spectrum carries, so the table, the chart labels and the
 * element assignment are always reading the same maxima. Nothing downstream
 * ever sees a `GSDPeak`: it carries a second derivative and a pair of
 * inflection points that only the detection cares about, and an index into an
 * array that will not be the array anybody still holds once the axis has been
 * converted.
 *
 * A picked peak is a feature of the data and says nothing about chemistry. What
 * element it belongs to is asked separately, against the reference table, in
 * `assignElements.ts`.
 */

import type { GSDPeakID } from 'ml-gsd';
import { gsd } from 'ml-gsd';

import { intensitySpan, peakProminence } from './peakProminence.ts';
import type { XpsPeak, XpsTrace } from './xpsSpectrum.ts';

/** How hard the detection looks, where the defaults are not what is wanted. */
export interface PickPeaksOptions {
  /**
   * Counts under which a maximum is not a peak.
   *
   * No floor at all unless one is asked for, which is deliberate: a survey scan
   * carries an inelastic background rising from tens of counts to thousands
   * across the same scan, so any single number is above the real lines at one
   * end and below the noise at the other. What separates a line from a ripple
   * here is `minProminenceRatio`, which is measured locally. A floor is still
   * worth setting by hand on a narrow scan, where the background is flat and a
   * reader can see where the noise sits.
   * @default 0
   */
  noiseLevel?: number;
  /**
   * Smallest height a peak may have, as a fraction of the tallest one.
   *
   * Kept low, because it is the wrong question to ask of a spectrum whose
   * background rises: a real line at high binding energy stands on that
   * background and so is "tall" for reasons that have nothing to do with it.
   * It is here to keep the candidate list finite, and the prominence below is
   * what actually decides.
   * @default 0.001
   */
  minMaxRatio?: number;
  /**
   * How far a maximum must rise above its own surroundings before it counts as
   * a peak, as a fraction of the full height of the trace.
   *
   * Two per cent is what tells the lines of a survey scan from the structure of
   * its background: it answers a poly(ethylene glycol) survey with its C 1s,
   * its O 1s and the oxygen Auger group, and a narrow scan with the one line it
   * was taken of. Lower it to chase a weak satellite; raise it to keep only
   * what a reader would point at.
   * @default 0.02
   */
  minProminenceRatio?: number;
  /**
   * How many peaks at most, the most **prominent** kept — not the tallest,
   * which on a rising background is a ranking by binding energy in disguise.
   * @default 50
   */
  maxPeaks?: number;
  /**
   * Whether the intensity is read off a smoothed trace rather than off the
   * measured counts. A narrow scan is noisy enough that the tallest sample of a
   * peak usually sits on a noise spike, so the smoothed height is the better
   * estimate of the line — and the worse one if what is wanted is the count
   * that was actually recorded.
   * @default true
   */
  smoothing?: boolean;
}

/**
 * How many points the detection needs before it can run at all.
 *
 * `ml-gsd` takes its derivatives with a nine-point Savitzky-Golay window and
 * raises a `RangeError` on anything shorter, which a two-column paste of half a
 * dozen lines would otherwise walk straight into.
 */
export const MINIMUM_PICKING_POINTS = 9;

/**
 * Find the maxima of a trace.
 *
 * The position is the fitted top rather than the tallest sample: a narrow scan
 * is acquired at 0.05 eV a point and a charge correction is quoted to 0.1 eV,
 * so rounding every peak onto the acquisition grid throws away exactly the
 * precision the number is read to.
 * @param trace - The measurement, x ascending in binding energy.
 * @param options - How hard to look, and how many peaks to keep.
 * @returns The peaks, by ascending binding energy, each with its own identity.
 */
export function pickPeaks(
  trace: XpsTrace,
  options: PickPeaksOptions = {},
): XpsPeak[] {
  const {
    noiseLevel = 0,
    minMaxRatio = DEFAULT_MINIMUM_RATIO,
    minProminenceRatio = DEFAULT_MINIMUM_PROMINENCE_RATIO,
    maxPeaks = DEFAULT_MAXIMUM_PEAKS,
    smoothing = true,
  } = options;
  const { x, y } = trace;
  if (x.length < MINIMUM_PICKING_POINTS || y.length !== x.length) return [];
  if (!(maxPeaks > 0)) return [];

  const detected = gsd(trace, {
    noiseLevel,
    minMaxRatio,
    smoothY: smoothing,
    realTopDetection: true,
  });

  const floor = minProminenceRatio * intensitySpan(y);
  const standing: Array<{ peak: GSDPeakID; prominence: number }> = [];
  for (const peak of detected) {
    const prominence = peakProminence(y, peak.index);
    if (prominence < floor) continue;
    standing.push({ peak, prominence });
  }

  const kept =
    standing.length > maxPeaks
      ? standing
          .toSorted((left, right) => right.prominence - left.prominence)
          .slice(0, maxPeaks)
          .toSorted((left, right) => left.peak.x - right.peak.x)
      : standing;

  const peaks = new Array<XpsPeak>(kept.length);
  for (let index = 0; index < kept.length; index++) {
    const { peak } = kept[index] as { peak: GSDPeakID };
    peaks[index] = {
      id: crypto.randomUUID(),
      bindingEnergy: peak.x,
      intensity: peak.y,
      width: peak.width,
    };
  }
  return peaks;
}

/** How many peaks a detection keeps unless it is told another number. */
const DEFAULT_MAXIMUM_PEAKS = 50;

/** How small a maximum may be against the tallest and still be a candidate. */
const DEFAULT_MINIMUM_RATIO = 0.001;

/** How far a maximum must stand out from its surroundings to be a peak. */
const DEFAULT_MINIMUM_PROMINENCE_RATIO = 0.02;
