/**
 * Where each axis stands, how far it reaches, and how a value on it becomes a
 * pixel.
 *
 * The first axis sits flush with the left of the drawing area and the last one
 * flush with the right, rather than inset the way a two-axis chart insets its
 * plot: the axes *are* the figure here, and a reader comparing the leftmost
 * column against the rightmost must see both of them, not a margin.
 */

import { chartScale } from '../../chart/core/chartScale.ts';

import { parallelExtent } from './parallelExtent.ts';
import { parallelTicks } from './parallelTicks.ts';
import type {
  ParallelAxis,
  ParallelAxisScale,
  ParallelTick,
} from './parallelTypes.ts';

/** Room kept around the drawing area for the axis names and the tick labels. */
export const PARALLEL_MARGIN = {
  /** Above the drawing area, where the axis names are written. */
  top: 26,
  /** To the right of it, so the last axis's labels are not clipped. */
  right: 54,
  /** Below it. */
  bottom: 22,
  /** To its left, where the first axis's tick labels are written. */
  left: 54,
} as const;

/** How a value on one axis becomes a pixel, as the two numbers a multiply-add needs. */
export interface ParallelAxisPixels {
  /** The pixel the value zero lands on — or the value one, on a log axis. */
  readonly offset: number;
  /** Pixels per unit, negative because an axis grows upward. Zero when the axis is flat. */
  readonly factor: number;
  /** Whether a value is read through its base-10 logarithm first. */
  readonly logarithmic: boolean;
  /** The smallest value a log axis can place; anything at or below it is pinned there. */
  readonly floor: number;
}

/** One axis, placed and measured, ready to draw. */
export interface ParallelAxisLayout {
  /** The axis this lays out. */
  id: string;
  /** Its name. */
  label: string;
  /** The unit written after the name, or an empty string. */
  unit: string;
  /** Horizontal centre, in pixels from the left of the drawing area. */
  x: number;
  /** The value at the bottom of the axis. */
  min: number;
  /** The value at its top. */
  max: number;
  /** How values are placed between them. */
  scale: ParallelAxisScale;
  /** Its graduations, already written out, from the bottom up. */
  ticks: readonly ParallelTick[];
  /** How a value on it becomes a pixel, worked out once here. */
  pixels: ParallelAxisPixels;
}

/** A flat axis: every value lands on the top of the drawing area. */
const FLAT: ParallelAxisPixels = {
  offset: 0,
  factor: 0,
  logarithmic: false,
  floor: 1,
};

/** How far below the largest value a log axis may reach when its low end is not positive. */
const LOG_FLOOR_SHARE = 1e-12;

/**
 * Place every axis across the drawing area and work out what it reaches.
 * @param axes - The axes, from left to right.
 * @param count - How many rows the columns are read over.
 * @param innerWidth - Width between the first and the last axis, in pixels.
 * @param innerHeight - Height of the drawing area, in pixels.
 * @returns One layout per axis, in the order they were given. A single axis is
 * centred; two or more are spread evenly with the outer ones flush with the
 * edges.
 */
export function parallelAxisLayouts(
  axes: readonly ParallelAxis[],
  count: number,
  innerWidth: number,
  innerHeight: number,
): ParallelAxisLayout[] {
  const layouts: ParallelAxisLayout[] = [];
  const total = axes.length;
  for (let index = 0; index < total; index++) {
    const axis = axes[index];
    if (axis === undefined) continue;
    const extent = axisExtent(axis, count);
    const graduation = parallelTicks(axis, extent.min, extent.max);
    const [min, max] = graduation.domain;
    const scale = axis.scale ?? 'linear';
    layouts.push({
      id: axis.id,
      label: axis.label,
      unit: axis.unit ?? '',
      x: total === 1 ? innerWidth / 2 : (innerWidth * index) / (total - 1),
      min,
      max,
      scale,
      ticks: graduation.ticks,
      pixels: parallelAxisPixels(min, max, scale, innerHeight),
    });
  }
  return layouts;
}

/**
 * The mapping that puts `max` at the top of the drawing area and `min` at its
 * bottom.
 * @param min - The value at the bottom.
 * @param max - The value at the top.
 * @param scale - How values are placed between them.
 * @param innerHeight - Height of the drawing area, in pixels.
 * @returns The mapping. An axis with no span, or one drawn in no height at
 * all, comes back flat, which pins every value to the top rather than dividing
 * by zero.
 */
export function parallelAxisPixels(
  min: number,
  max: number,
  scale: ParallelAxisScale,
  innerHeight: number,
): ParallelAxisPixels {
  if (max - min <= 0 || innerHeight <= 0) return FLAT;
  if (scale !== 'log') {
    const linear = chartScale(min, max, innerHeight, 0);
    return { ...linear, logarithmic: false, floor: 1 };
  }
  const floor = min > 0 ? min : max > 0 ? max * LOG_FLOOR_SHARE : 1;
  const low = Math.log10(floor);
  const high = Math.log10(Math.max(max, floor));
  if (high - low <= 0) return FLAT;
  const mapping = chartScale(low, high, innerHeight, 0);
  return { ...mapping, logarithmic: true, floor };
}

/**
 * Where one value falls on an axis, in pixels.
 *
 * For a single conversion — a tick, a brushed edge, a highlighted crossing.
 * Inside a loop over rows, read `axis.pixels` and write the multiply-add out.
 * @param pixels - The axis's mapping.
 * @param value - The value to place.
 * @returns The pixel, measured from the top of the drawing area. A value
 * outside the axis lands outside the drawing area and is not clipped.
 */
export function parallelPixelAt(
  pixels: ParallelAxisPixels,
  value: number,
): number {
  if (pixels.factor === 0) return pixels.offset;
  const placed = pixels.logarithmic
    ? Math.log10(Math.max(value, pixels.floor))
    : value;
  return pixels.offset + placed * pixels.factor;
}

/**
 * Where one value falls on an axis, in pixels.
 * @param value - The value to place.
 * @param axis - The axis it belongs to.
 * @returns The pixel, measured from the top of the drawing area.
 */
export function parallelValueToY(
  value: number,
  axis: ParallelAxisLayout,
): number {
  return parallelPixelAt(axis.pixels, value);
}

/**
 * What value a pixel on an axis stands for — the brush's direction.
 * @param y - The pixel, measured from the top of the drawing area.
 * @param axis - The axis it belongs to.
 * @returns The value there, or the top of a flat axis. Zero comes back
 * unsigned, so an interval that reaches the end of an axis never reads `-0`.
 */
export function parallelYToValue(y: number, axis: ParallelAxisLayout): number {
  const { pixels, max } = axis;
  if (pixels.factor === 0) return max;
  const placed = (y - pixels.offset) / pixels.factor;
  if (pixels.logarithmic) return 10 ** placed;
  return placed === 0 ? 0 : placed;
}

function axisExtent(
  axis: ParallelAxis,
  count: number,
): { min: number; max: number } {
  const domain = axis.domain;
  if (domain === undefined) return parallelExtent(axis.values, count);
  return {
    min: Math.min(domain[0], domain[1]),
    max: Math.max(domain[0], domain[1]),
  };
}
