/**
 * The window a chart opens on, worked out from the spectra it was handed.
 *
 * This is what "zoom to fit" and the first render both call, so it has to be
 * right for a peak table of four rows and for a profile scan of half a million
 * points alike, and it has to answer something usable when it is handed nothing
 * at all — a chart with no data is still mounted, still measured, and still
 * builds its scales.
 */

import { xMaxValue } from 'ml-spectra-processing';

import type { MassDomain, MassSpectrum, MassTrace } from './massSpectrum.ts';

/**
 * How much air is left either side of the outermost peak, as a fraction.
 *
 * A stick drawn exactly on the axis reads as a spectrum that was cut off there;
 * two percent is enough to show that it was not.
 */
export const X_DOMAIN_PADDING = 0.02;

/**
 * How far above the tallest peak the intensity axis runs.
 *
 * The base peak carries the label nobody wants to lose — its m/z and its
 * intensity, on two lines — and it is drawn above the stick. Twenty percent is
 * the room those lines take at the top of a chart of any usual height.
 */
export const Y_DOMAIN_HEADROOM = 1.2;

/**
 * The window that shows everything currently drawn.
 *
 * A spectrum marked `excludeFromDomain` is left out of the extents, because it
 * is a preview rather than data: a predicted pattern that appears and
 * disappears with the pointer would throw away the zoom the user set every
 * time it moved the axes. The exclusion is dropped when it would leave nothing
 * at all — previewing into an empty chart has to show the preview, not an empty
 * axis from 0 to 1.
 *
 * In mirror mode the negative half is the reflection of the positive one rather
 * than its own extent. Two spectra compared head-to-head are only comparable if
 * a peak of the same height means the same intensity in both halves; giving each
 * half its own scale makes the weaker spectrum look as intense as the stronger,
 * which is precisely the comparison the view exists to make.
 * @param spectra - What the chart draws.
 * @param mirror - Whether the chart reflects its spectra about zero. Defaults
 * to `false`.
 * @returns The window, in m/z and in intensity.
 */
export function fullDomain(
  spectra: readonly MassSpectrum[],
  mirror = false,
): MassDomain {
  const extent = traceExtent(spectra, false) ?? traceExtent(spectra, true);
  if (extent === null) return { x: [0, 1], y: [0, 1] };

  const { xMinimum, xMaximum, yMaximum } = extent;
  const padding = (xMaximum - xMinimum) * X_DOMAIN_PADDING;
  // A single peak, or several at one m/z, has no width to take a fraction of.
  const x: [number, number] =
    padding > 0
      ? [xMinimum - padding, xMaximum + padding]
      : [xMinimum - 1, xMaximum + 1];
  const top = yMaximum > 0 ? yMaximum * Y_DOMAIN_HEADROOM : 1;
  return { x, y: mirror ? [-top, top] : [0, top] };
}

/**
 * What a fitted window was fitted *to*, as one string two renders can compare.
 *
 * The chart puts its window back to `fullDomain` when it is handed different
 * data, and must not when the same data is merely drawn differently — so
 * something has to tell the two apart. It is the identities that are compared
 * and never the extents: a spectrum switched from its profile to its sticks
 * moves the fitted window by a hair, and refitting on a hair throws away the
 * zoom somebody set, which is the whole reason this exists. Loading a spectrum,
 * closing one and reflecting the chart about zero are the changes that have to
 * be shown, and every one of them shows up here.
 *
 * A spectrum kept out of the automatic domain is kept out of this too, for the
 * reason it is kept out of the extents: a predicted pattern previewed under the
 * pointer comes and goes with the pointer, and refitting on it would throw the
 * zoom away every time a search result is read. The identities are joined by a
 * character no identity holds, so `a b` and `a` then `b` are two fits.
 * @param spectra - What the chart draws.
 * @param mirror - Whether the chart reflects its spectra about zero. Defaults
 * to `false`.
 * @returns A string equal to itself exactly when a fit would be made to the
 * same thing.
 */
export function fittedTo(
  spectra: readonly MassSpectrum[],
  mirror = false,
): string {
  let key = mirror ? 'mirror' : 'upward';
  for (const spectrum of spectra) {
    if (spectrum.excludeFromDomain) continue;
    key += `\u0000${spectrum.id}`;
  }
  return key;
}

/**
 * The tallest intensity among the traces a set of spectra currently draws.
 *
 * What "how tall is this chart" comes to, in the units the spectra are in, with
 * the headroom `fullDomain` adds left off — so it answers a question about the
 * measurement rather than about the plot. A preview kept out of the extents is
 * kept out of this too, and a chart holding nothing but a preview is measured
 * by it rather than answering zero.
 * @param spectra - The spectra to measure, drawn or not.
 * @returns The tallest intensity drawn, or `0` when nothing is.
 */
export function basePeakOf(spectra: readonly MassSpectrum[]): number {
  const extent = traceExtent(spectra, false) ?? traceExtent(spectra, true);
  return extent === null ? 0 : extent.yMaximum;
}

/**
 * How much of the axis framing a peak shows, either side of its mass.
 *
 * Wide enough to hold the isotopologue cluster of a singly charged ion, because
 * a peak is read in its cluster and not alone: the M+1 says how much carbon it
 * holds and the spacing says what charge it carries.
 */
export const MZ_FRAME_HALF_WIDTH = 2.5;

/** How a mass is framed. */
export interface MzFrameOptions {
  /**
   * How much of the axis to show either side of the mass.
   * @default MZ_FRAME_HALF_WIDTH
   */
  halfWidth?: number;
  /**
   * Whether the chart reflects its spectra about zero, which decides the height
   * it opens on when it has no window of its own.
   * @default false
   */
  mirror?: boolean;
}

/**
 * The window that frames one mass, keeping the intensity axis where it was.
 *
 * The vertical extent is deliberately not recomputed from what falls inside the
 * new window: a click is a request to look somewhere else along the m/z axis,
 * and rescaling the height at the same time makes whatever was just clicked fill
 * the plot, so every peak looks like the base peak and the one number the eye
 * reads off a spectrum stops meaning anything. It is only worked out from the
 * spectra when the chart has no window of its own to keep.
 * @param mz - The mass to frame.
 * @param spectra - What the chart is drawing, for the height it opens on.
 * @param domain - The window the chart is showing, `null` when it is fitting.
 * @param options - How wide a window, and whether the chart is mirrored.
 * @returns The window to show.
 */
export function mzFrame(
  mz: number,
  spectra: readonly MassSpectrum[],
  domain: MassDomain | null,
  options: MzFrameOptions = {},
): MassDomain {
  const { halfWidth = MZ_FRAME_HALF_WIDTH, mirror = false } = options;
  const y = domain?.y ?? fullDomain(spectra, mirror).y;
  return { x: [mz - halfWidth, mz + halfWidth], y };
}

/** The extremes of a set of traces, before any padding is added. */
interface TraceExtent {
  /** The lowest m/z drawn. */
  xMinimum: number;
  /** The highest m/z drawn. */
  xMaximum: number;
  /** The tallest intensity drawn. */
  yMaximum: number;
}

/**
 * The extremes over every trace that is currently drawn.
 * @param spectra - What the chart draws.
 * @param includeExcluded - Whether to count the spectra kept out of the domain.
 * @returns The extremes, or `null` when nothing is drawn.
 */
function traceExtent(
  spectra: readonly MassSpectrum[],
  includeExcluded: boolean,
): TraceExtent | null {
  let extent: TraceExtent | null = null;
  for (const spectrum of spectra) {
    if (!includeExcluded && spectrum.excludeFromDomain) continue;
    if (spectrum.showProfile && spectrum.profile !== null) {
      extent = widen(extent, spectrum.profile);
    }
    if (spectrum.showCentroid) extent = widen(extent, spectrum.centroid);
  }
  return extent;
}

/**
 * Grow an extent to cover one more trace.
 *
 * The m/z ends are read off the first and last sample rather than searched for:
 * `MassTrace.x` is increasing by construction, so a scan would walk several
 * hundred thousand points of a profile to learn what index zero already says.
 * @param extent - What has been covered so far, `null` for nothing.
 * @param trace - The trace to cover as well.
 * @returns The grown extent, unchanged when the trace holds no point.
 */
function widen(
  extent: TraceExtent | null,
  trace: MassTrace,
): TraceExtent | null {
  const { x, y } = trace;
  if (x.length === 0 || y.length === 0) return extent;
  const first = x[0] as number;
  const last = x.at(-1) as number;
  const tallest = xMaxValue(y);
  if (extent === null) {
    return { xMinimum: first, xMaximum: last, yMaximum: tallest };
  }
  return {
    xMinimum: Math.min(extent.xMinimum, first),
    xMaximum: Math.max(extent.xMaximum, last),
    yMaximum: Math.max(extent.yMaximum, tallest),
  };
}
