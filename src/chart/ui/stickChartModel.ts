/**
 * The arithmetic behind a stick chart, worked out before React sees it: the
 * one path a series becomes, the stretch of axis its peaks cover, and which
 * peak a place on that axis is asking about.
 *
 * It is here rather than in the component because none of it is a component:
 * a peak list is a pair of arrays and a scale, and every question asked of it
 * can be answered, and tested, without a renderer.
 */

import {
  EMPTY_EXTENT,
  chartPadExtent,
  chartValuesExtent,
} from '../core/chartExtent.ts';
import type { ChartScale } from '../core/chartScale.ts';

/** One set of sticks. */
export interface ChartStickSeries {
  /** A stable id, used as the React key and named in the tracking callback. */
  id: string;
  /** What the legend calls it, e.g. `PC 1`. */
  label: string;
  /** Where each stick ends, one value per measurement. */
  values: ArrayLike<number>;
  /**
   * Where each stick starts. Without it a stick stands on the zero rule, which
   * is what a loading is read from; with it the stick is the span between the
   * two, which is how far along a component a measurement is pushed.
   * @default undefined — every stick stands on zero
   */
  from?: ArrayLike<number>;
  /** Its colour, normally from `chartSeriesColor`. */
  color: string;
  /**
   * Whether it is drawn at all — what a legend entry switches.
   * @default true
   */
  visible?: boolean;
  /**
   * Whether it is drawn faintly behind the rest, which is what the average
   * sample is in a loadings panel.
   * @default false
   */
  muted?: boolean;
}
/** What the geometry needs of a drawn frame: the two scales and the rectangle. */
export interface StickFrame {
  /** The rectangle to draw in. */
  plot: { top: number; bottom: number; left: number; right: number };
  /** Data to pixels, horizontally. */
  x: ChartScale;
  /** Data to pixels, vertically; its `factor` is negative. */
  y: ChartScale;
}

/**
 * One path holding every stick of a series.
 * @param item - The series.
 * @param positions - Where each measurement sits.
 * @param frame - The rectangle and the two scales.
 * @returns The `d` attribute, empty when nothing was finite.
 */
export function stickPath(
  item: ChartStickSeries,
  positions: readonly number[],
  frame: StickFrame,
): string {
  const { x, y } = frame;
  const foot = zeroAt(frame);
  let path = '';
  for (let index = 0; index < positions.length; index++) {
    const at = positions[index];
    const value = item.values[index];
    if (at === undefined || value === undefined || !Number.isFinite(value)) {
      continue;
    }
    const pixelX = round(x.offset + at * x.factor);
    const top = round(y.offset + value * y.factor);
    const start = item.from === undefined ? foot : startOf(item, index, y);
    if (start === null || !Number.isFinite(top)) continue;
    path += `M${pixelX} ${start}V${top}`;
  }
  return path;
}

/**
 * Where a stick starts when the series says so.
 * @param item - The series.
 * @param index - Which measurement.
 * @param y - Data to pixels, vertically.
 * @returns The pixel, or `null` when the value is not a number.
 */
function startOf(
  item: ChartStickSeries,
  index: number,
  y: ChartScale,
): number | null {
  const value = item.from?.[index];
  if (value === undefined || !Number.isFinite(value)) return null;
  return round(y.offset + value * y.factor);
}

/**
 * Where zero sits, which is what a stick stands on.
 *
 * The frame rules the plot at zero itself whenever the domain crosses it, so
 * this only says where a stick's foot goes and never draws anything.
 * @param frame - The rectangle and the two scales.
 * @returns The pixel, clamped into the plot so a domain above zero still has a
 * foot to stand on.
 */
export function zeroAt(frame: StickFrame): number {
  const { plot, y } = frame;
  const at = y.offset;
  if (!Number.isFinite(at)) return plot.bottom;
  return round(Math.min(plot.bottom, Math.max(plot.top, at)));
}

/**
 * The measurement nearest a value on the axis.
 * @param positions - Where each measurement sits, in order.
 * @param value - Where the pointer is, in the axis' own units.
 * @returns Its index, or -1 when there are none.
 */
export function nearestPosition(
  positions: readonly number[],
  value: number,
): number {
  const count = positions.length;
  if (count === 0 || !Number.isFinite(value)) return -1;
  let low = 0;
  let high = count - 1;
  while (low < high) {
    const middle = (low + high) >> 1;
    if ((positions[middle] as number) < value) {
      low = middle + 1;
    } else {
      high = middle;
    }
  }
  const here = positions[low] as number;
  const previous = positions[low - 1];
  if (previous === undefined) return low;
  return Math.abs(previous - value) <= Math.abs(here - value) ? low - 1 : low;
}

/**
 * The stretch of the axis the peaks cover.
 * @param positions - Where each measurement sits.
 * @returns The domain, padded so an edge peak is not drawn on the frame.
 */
export function spanOf(
  positions: readonly number[],
): readonly [number, number] {
  const { min, max } = chartValuesExtent(positions);
  if (min > max) return [0, 1];
  // Not padded. The frame widens the domain to whole tick steps, which already
  // leaves an edge peak off the frame, and a pad on top of that can push the
  // lowest peak below a step — 206 padded to 199 nices to 0 rather than to
  // 200, and a fifth of the width goes to masses the run never measured.
  return min === max ? [min - 1, max + 1] : [min, max];
}

/**
 * The vertical stretch the sticks need, zero among it.
 * @param drawn - The visible series.
 * @param count - How many measurements there are.
 * @returns The domain.
 */
export function seriesDomain(
  drawn: readonly ChartStickSeries[],
  count: number,
): readonly [number, number] {
  let extent = EMPTY_EXTENT;
  for (const item of drawn) {
    extent = chartValuesExtent(item.values, { limit: count, into: extent });
    if (item.from !== undefined) {
      extent = chartValuesExtent(item.from, { limit: count, into: extent });
    }
  }
  const range = chartPadExtent(extent);
  // A stick is read from zero, so zero is on the chart whatever the values do.
  return [Math.min(range.min, 0), Math.max(range.max, 0)];
}

/**
 * A pixel back to the value it stands for.
 * @param scale - Data to pixels.
 * @param pixel - Where the pointer is.
 * @returns The value.
 */
export function valueAt(scale: ChartScale, pixel: number): number {
  return scale.factor === 0
    ? Number.NaN
    : (pixel - scale.offset) / scale.factor;
}

function round(pixel: number): number {
  return Math.round(pixel * 10) / 10;
}
