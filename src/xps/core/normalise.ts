/**
 * Drawing every trace against its own maximum, without ever copying one.
 *
 * Two XPS spectra are compared by shape and never by counts: the same C 1s line
 * acquired for one second and for ten differs tenfold in height and not at all
 * in chemistry, so a chart that drew them as measured would say the second
 * sample held ten times the carbon. Normalising answers that, and it is deliberately
 * computed **over the window on screen** rather than over the whole spectrum —
 * zooming onto a weak satellite is precisely the moment its shape matters, and a
 * factor taken from a survey scan's O 1s peak would leave that satellite a pixel
 * tall.
 *
 * Nothing here builds a scaled copy of a trace. A survey scan is twelve hundred
 * points and a stacked file fifty of them, redrawn on every pointer move; the
 * factor is folded into the counts scale instead, so a normalised chart costs
 * one multiplication per drawn point and no allocation at all.
 */

import type { NumberArray } from 'cheminfo-types';

import type { ChartScale } from '../../chart/core/chartScale.ts';

/** The height every normalised trace is drawn to at its own maximum. */
export const NORMALISED_MAXIMUM = 100;

/**
 * The tallest count a trace reaches inside a window.
 *
 * The window is tested per sample rather than by seeking its two ends, because
 * a kinetic-energy trace runs the other way — converting an ascending binding
 * axis subtracts it from the photon energy — and a bounded scan written for
 * ascending x would silently return nothing for every such spectrum. One pass,
 * no copy, no assumption about direction.
 * @param x - The energies of the trace, in the units the window is given in.
 * @param y - The counts, one per energy.
 * @param from - The lower end of the window in eV.
 * @param to - The upper end.
 * @returns The tallest count inside it, `0` when the window holds no sample.
 */
export function windowMaximum(
  x: NumberArray,
  y: NumberArray,
  from: number,
  to: number,
): number {
  const count = Math.min(x.length, y.length);
  let maximum = 0;
  for (let index = 0; index < count; index++) {
    const energy = x[index] as number;
    if (energy < from || energy > to) continue;
    const value = y[index] as number;
    if (value > maximum) maximum = value;
  }
  return maximum;
}

/**
 * What a trace's counts are multiplied by to be drawn against its own maximum.
 *
 * A window holding nothing, or holding nothing but zeros, is worth `1` rather
 * than an infinity: a trace scrolled off the edge of the chart is drawn where it
 * was measured for the one frame before it leaves, which is invisible, where a
 * division by zero would send every one of its points to the same impossible
 * pixel and take the path with it.
 * @param x - The energies of the trace, in the units the window is given in.
 * @param y - The counts, one per energy.
 * @param from - The lower end of the window in eV.
 * @param to - The upper end.
 * @returns The factor, `1` when there is nothing to normalise against.
 */
export function normalisationFactor(
  x: NumberArray,
  y: NumberArray,
  from: number,
  to: number,
): number {
  const maximum = windowMaximum(x, y, from, to);
  return maximum > 0 ? NORMALISED_MAXIMUM / maximum : 1;
}

/**
 * The counts axis as one trace is drawn against it.
 *
 * A factor of exactly one hands back the scale it was given rather than a
 * wrapper around it, so a chart that is not normalising allocates nothing and
 * every memo keyed on the scale keeps holding.
 * @param yScale - The counts axis as it is currently zoomed.
 * @param factor - What this trace's counts are multiplied by.
 * @returns The scale to draw this trace with: the same offset, its pixels per
 * count multiplied by the factor.
 */
export function normalisedScale(
  yScale: ChartScale,
  factor: number,
): ChartScale {
  if (factor === 1) return yScale;
  return { offset: yScale.offset, factor: yScale.factor * factor };
}
