/**
 * The window a chart opens on, worked out from the spectra it was handed.
 *
 * This is what "zoom to fit" and the first render both call, so it has to answer
 * something usable when it is handed nothing at all — a chart with no data is
 * still mounted, still measured, and still builds its scales.
 *
 * The x window is in ascending wavenumbers even though the axis is drawn from
 * 4000 down to 400: which way round it is read is the chart's business, and
 * every piece of arithmetic that moves a window expects its ends in order.
 */

import { xMaxValue, xMinValue } from 'ml-spectra-processing';

import { bandsPointDown } from './irMode.ts';
import type { IrDomain, IrMode, IrSpectrum } from './irSpectrum.ts';
import { traceOf } from './irSpectrum.ts';

/**
 * How much air is left either side of the outermost point, as a fraction.
 *
 * A trace drawn hard against the axis reads as a spectrum that was cut off
 * there; two percent is enough to show that it was not.
 */
export const X_DOMAIN_PADDING = 0.02;

/** The same, on the value axis, where a trace touching an edge reads the same. */
export const Y_DOMAIN_PADDING = 0.05;

/**
 * The extra room kept on the side the band labels occupy, as a fraction.
 *
 * A named band carries its wavenumber and its assignment on two lines, stacked
 * away from the baseline — upwards from an absorbance maximum, downwards from a
 * transmittance minimum — so the room has to be on a different side in each
 * mode. Twenty percent is what those two lines take on a chart of any usual
 * height.
 */
export const LABEL_HEADROOM = 0.2;

/**
 * The window that shows everything currently drawn.
 *
 * A spectrum marked `excludeFromDomain` is left out of the extents, because it
 * is a reference held up for comparison rather than data: letting it move the
 * axes would throw away the zoom the user set every time they held one up. The
 * exclusion is dropped when it would leave nothing at all.
 * @param spectra - Everything the chart holds, drawn or not.
 * @param mode - Which value axis is being drawn, which decides both the extents
 * and the side the label room is kept on.
 * @returns The window, in wavenumbers and in the value axis.
 */
export function fullDomain(
  spectra: readonly IrSpectrum[],
  mode: IrMode,
): IrDomain {
  const extent =
    traceExtent(spectra, mode, false) ?? traceExtent(spectra, mode, true);
  if (extent === null) {
    return mode === 'absorbance'
      ? { x: [400, 4000], y: [0, 1] }
      : { x: [400, 4000], y: [0, 100] };
  }

  const { xMinimum, xMaximum, yMinimum, yMaximum } = extent;
  const xPadding = (xMaximum - xMinimum) * X_DOMAIN_PADDING;
  // A spectrum of a single point has no width to take a fraction of.
  const x: [number, number] =
    xPadding > 0
      ? [xMinimum - xPadding, xMaximum + xPadding]
      : [xMinimum - 1, xMaximum + 1];

  const ySpan = yMaximum - yMinimum;
  const yPadding = ySpan > 0 ? ySpan * Y_DOMAIN_PADDING : 1;
  const headroom = ySpan > 0 ? ySpan * LABEL_HEADROOM : 1;
  const down = bandsPointDown(mode);
  const y: [number, number] = [
    yMinimum - (down ? headroom : yPadding),
    yMaximum + (down ? yPadding : headroom),
  ];
  return { x, y };
}

/**
 * What a fitted window was fitted *to*, as one string two renders can compare.
 *
 * The chart puts its window back to `fullDomain` when it is handed different
 * data, and must not when the same data is merely redrawn — so something has to
 * tell the two apart.
 *
 * **The mode is part of it**, and that is the one place this differs from a mass
 * spectrum's fit key. Switching from transmittance to absorbance does not nudge
 * the extents, it replaces the value axis outright — a window of 25 to 100
 * percent means nothing at all in absorbance — so it has to refit, where a
 * change of colour or of name must not.
 * @param spectra - Everything the chart holds, drawn or not.
 * @param mode - Which value axis is being drawn.
 * @returns A string equal to itself exactly when a fit would be made to the
 * same thing.
 */
export function fittedTo(spectra: readonly IrSpectrum[], mode: IrMode): string {
  let key = mode;
  for (const spectrum of spectra) {
    if (spectrum.excludeFromDomain || !spectrum.visible) continue;
    key += ` ${spectrum.id}`;
  }
  return key;
}

/** The extremes of a set of traces, before any padding is added. */
interface TraceExtent {
  /** The lowest wavenumber drawn. */
  xMinimum: number;
  /** The highest wavenumber drawn. */
  xMaximum: number;
  /** The lowest value drawn. */
  yMinimum: number;
  /** The highest value drawn. */
  yMaximum: number;
}

/**
 * The extremes over every trace that is currently drawn.
 * @param spectra - Everything the chart holds.
 * @param mode - Which value axis is being drawn.
 * @param includeExcluded - Whether to count the spectra kept out of the domain.
 * @returns The extremes, or `null` when nothing is drawn.
 */
function traceExtent(
  spectra: readonly IrSpectrum[],
  mode: IrMode,
  includeExcluded: boolean,
): TraceExtent | null {
  let extent: TraceExtent | null = null;
  for (const spectrum of spectra) {
    if (!spectrum.visible) continue;
    if (!includeExcluded && spectrum.excludeFromDomain) continue;
    const { x, y } = traceOf(spectrum, mode);
    if (x.length === 0 || y.length === 0) continue;
    // The wavenumber ends are read off the first and last sample rather than
    // searched for: the array is ascending by construction, so a scan would walk
    // every point of the spectrum to learn what index zero already says.
    const first = x[0] as number;
    const last = x.at(-1) as number;
    const lowest = xMinValue(y);
    const highest = xMaxValue(y);
    extent =
      extent === null
        ? {
            xMinimum: first,
            xMaximum: last,
            yMinimum: lowest,
            yMaximum: highest,
          }
        : {
            xMinimum: Math.min(extent.xMinimum, first),
            xMaximum: Math.max(extent.xMaximum, last),
            yMinimum: Math.min(extent.yMinimum, lowest),
            yMaximum: Math.max(extent.yMaximum, highest),
          };
  }
  return extent;
}
