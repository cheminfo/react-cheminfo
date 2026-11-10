/**
 * The window a chart opens on, worked out from the spectra it was handed.
 *
 * This is what "zoom to fit" and the first render both come down to, so it has
 * to be right for a survey scan of twelve hundred points, for a narrow scan of a
 * single doublet, and for the file holding fifty of each — and it has to say so
 * plainly when it is handed nothing it can draw, because a chart with no data is
 * still mounted, still measured, and still builds its scales.
 *
 * The window is in the units of the axis actually being drawn, which is not
 * always the one the settings asked for: see `chartEnergyAxis`.
 */

import { xMinMaxValues } from 'ml-spectra-processing';

import { axisTrace, chartEnergyAxis } from './energyAxis.ts';
import { NORMALISED_MAXIMUM } from './normalise.ts';
import type { XpsDomain, XpsSpectrum, XpsTrace } from './xpsSpectrum.ts';
import { boundsDomain } from './xpsSpectrum.ts';
import type { EnergyAxis, XpsSettings } from './xpsState.ts';

/**
 * How far above the tallest count the axis runs, as a factor.
 *
 * The tallest peak is the one most worth naming and its label is written above
 * it, so a window ending exactly on the base peak writes that label over the
 * plot edge. Ten percent is the room one line of type takes at the top of a
 * chart of any usual height.
 */
export const Y_DOMAIN_HEADROOM = 1.1;

/**
 * The window that shows everything currently drawn.
 *
 * The energy axis runs edge to edge with no air either side, which is how a
 * spectrum is published: the ends of the trace are the ends of the acquisition,
 * and padding them would suggest the instrument kept measuring past where it
 * stopped. A spectrum of a single point is the one exception — there is no width
 * to draw — and is given an eV either side to sit in.
 *
 * A spectrum marked `excludeFromDomain` is left out of the extents, because it
 * is a preview rather than data: a reference line shown under the pointer
 * appears and disappears with the pointer, and letting it move the axes would
 * throw away the zoom the reader set every time they ran down a table of
 * candidate elements. The exclusion is dropped when it would leave nothing at
 * all — previewing a reference into an empty chart has to show the reference.
 *
 * When the counts are normalised the vertical window is fixed rather than
 * measured. Each trace is drawn against its own maximum **in the window on
 * screen**, so every one of them reaches `NORMALISED_MAXIMUM` by construction
 * and there is nothing left to fit to.
 * @param spectra - Everything the chart holds, drawn or not.
 * @param settings - How the spectra are drawn: which axis, and whether the
 *   counts are normalised.
 * @returns The window, or `null` when nothing is drawn — which the chart shows
 * as an empty frame rather than as an invented axis from 0 to 1.
 */
export function fullDomain(
  spectra: readonly XpsSpectrum[],
  settings: XpsSettings,
): XpsDomain | null {
  const axis = chartEnergyAxis(spectra, settings);
  const extent =
    traceExtent(spectra, axis, false) ?? traceExtent(spectra, axis, true);
  if (extent === null) return null;

  const { xMinimum, xMaximum, yMinimum, yMaximum } = extent;
  const x: [number, number] =
    xMaximum > xMinimum ? [xMinimum, xMaximum] : [xMinimum - 1, xMaximum + 1];
  if (settings.normalise) {
    return { x, y: [0, NORMALISED_MAXIMUM * Y_DOMAIN_HEADROOM] };
  }
  // Counts are positive, so the floor is zero rather than the lowest count
  // drawn: a window starting at the baseline of a survey scan would cut every
  // peak off at the ankles. A background-subtracted trace that dips below zero
  // is the one case where its own floor is lower, and then that is what is used.
  const bottom = Math.min(0, yMinimum);
  const height = yMaximum - bottom;
  const top = height > 0 ? bottom + height * Y_DOMAIN_HEADROOM : bottom + 1;
  return { x, y: [bottom, top] };
}

/** The extremes of a set of traces, before any headroom is added. */
interface TraceExtent {
  /** The lowest energy drawn, on the axis being drawn. */
  xMinimum: number;
  /** The highest energy drawn. */
  xMaximum: number;
  /** The lowest count drawn. */
  yMinimum: number;
  /** The tallest count drawn. */
  yMaximum: number;
}

/**
 * The extremes over every trace that is currently drawn.
 * @param spectra - Everything the chart holds.
 * @param axis - The axis the chart is drawn against.
 * @param includeExcluded - Whether to count the spectra kept out of the window.
 * @returns The extremes, or `null` when nothing is drawn.
 */
function traceExtent(
  spectra: readonly XpsSpectrum[],
  axis: EnergyAxis,
  includeExcluded: boolean,
): TraceExtent | null {
  let extent: TraceExtent | null = null;
  for (const spectrum of spectra) {
    const drawn = includeExcluded ? spectrum.visible : boundsDomain(spectrum);
    if (!drawn) continue;
    extent = widen(extent, axisTrace(spectrum, axis));
  }
  return extent;
}

/**
 * Grow an extent to cover one more trace.
 *
 * The energy ends are read off the first and last sample rather than searched
 * for: a trace is monotonic in x by construction, so a scan would walk twelve
 * hundred points of a survey to learn what two indices already say. Which of the
 * two ends is the lower depends on the axis — a kinetic trace runs the other way
 * — so both are compared rather than assumed.
 * @param extent - What has been covered so far, `null` for nothing.
 * @param trace - The trace to cover as well.
 * @returns The grown extent, unchanged when the trace holds no point.
 */
function widen(
  extent: TraceExtent | null,
  trace: XpsTrace,
): TraceExtent | null {
  const { x, y } = trace;
  if (x.length === 0 || y.length === 0) return extent;
  const first = x[0] as number;
  const last = x.at(-1) as number;
  const counts = xMinMaxValues(y);
  if (extent === null) {
    return {
      xMinimum: Math.min(first, last),
      xMaximum: Math.max(first, last),
      yMinimum: counts.min,
      yMaximum: counts.max,
    };
  }
  return {
    xMinimum: Math.min(extent.xMinimum, first, last),
    xMaximum: Math.max(extent.xMaximum, first, last),
    yMinimum: Math.min(extent.yMinimum, counts.min),
    yMaximum: Math.max(extent.yMaximum, counts.max),
  };
}
