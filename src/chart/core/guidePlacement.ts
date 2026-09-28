/**
 * Where the guide for one value is drawn when that value is not on screen.
 *
 * A chart zoomed onto a single feature is the normal way of reading a spectrum
 * — one isotopologue cluster two millimass units wide, one chromatographic peak
 * four seconds wide — and most of what a panel beside it can point at then lies
 * outside the window. Drawing nothing in that case answers the only question
 * the guide exists for — where is it? — with silence, and the reader is left
 * unable to tell a fragment the spectrum does not carry from one that is simply
 * off to the left. So the guide is parked on the edge it went out of instead,
 * dashed and carrying an arrow, which says both that it is elsewhere and which
 * way.
 *
 * Nothing here reads the domain: the value is put through the scale, and the
 * pixel that comes back is compared against the two pixel edges of the plot.
 * That is what lets `left` and `right` mean what they say on an axis that runs
 * backwards, as an infrared chart's wavenumbers do — they are the edges of the
 * screen, not the ends of the window, and a descending axis parks a value below
 * its window on the right, which is exactly where the reader must look for it.
 */

import type { PlotRect } from './chartGeometry.ts';
import type { ChartScale } from './chartScale.ts';
import { chartPixel, chartRoundPixel } from './chartScale.ts';

/** Where a guide ended up, and whether that is where its value actually is. */
export interface GuidePlacement {
  /** Where the guide is drawn, in pixels. */
  x: number;
  /**
   * Which side of the window the value lies on, `null` when it is inside it and
   * the guide is therefore standing on the value itself.
   */
  direction: 'left' | 'right' | null;
}

/**
 * Work out where the guide for a value goes.
 *
 * The test is made in pixels rather than against the domain, so the guide can
 * never disagree with the axis it is drawn over: both are read off the same
 * scale, and a rounding that puts a value a hundredth of a unit inside the
 * window puts the guide a hundredth of a pixel inside the plot rather than
 * parking it on an edge it is standing beside.
 * @param value - The place on the horizontal axis being pointed at, in whatever
 * that axis measures — an m/z, a retention time, a wavenumber.
 * @param plot - The plotting area the guide is confined to.
 * @param xScale - The horizontal axis as it is currently zoomed.
 * The pixel is rounded for the markup, to the hundredth: that is under a tenth
 * of a device pixel at any zoom a browser offers, and it keeps the last digits
 * of a multiply-add out of the `d` a reader has to look at in a failing test.
 * @returns Where to draw it, or `null` for a value no scale maps anywhere — an
 * empty chart's degenerate axis, or a `NaN` out of an unparsed field.
 */
export function guidePlacement(
  value: number,
  plot: PlotRect,
  xScale: ChartScale,
): GuidePlacement | null {
  if (!Number.isFinite(value)) return null;
  const pixel = chartPixel(xScale, value);
  if (!Number.isFinite(pixel)) return null;
  if (pixel < plot.left) return { x: plot.left, direction: 'left' };
  if (pixel > plot.right) return { x: plot.right, direction: 'right' };
  return { x: chartRoundPixel(pixel), direction: null };
}
