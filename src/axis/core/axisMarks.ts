/**
 * Where a figure's marks land inside its box, so something else can count them.
 *
 * `emptiestCorner` picks the corner a floating card can sit in without covering
 * the cluster the reader came for, and it needs screen positions to do it. A
 * chart drawn by a library builds its scales during its own render, where a
 * caller cannot reach them, so the positions are worked out here from the same
 * values and the same two transforms the axes use.
 *
 * It is an estimate, which is all a corner needs: the plot area is inset from
 * the box by the margins, and a mark a few pixels from a corner counts for that
 * corner either way.
 */

import type { AxisScale } from './axisScale.ts';

/** A point of the figure, in the quantities its axes carry. */
export interface AxisPoint {
  x: number;
  y: number;
}

/** Pixel positions of every mark, as `emptiestCorner` reads them. */
export interface AxisMarkPositions {
  x: Float64Array;
  y: Float64Array;
}

/** What {@link axisMarkPositions} needs beyond the points and the box. */
export interface AxisMarkPositionsOptions {
  /**
   * Width of the linear region of a logarithmic axis — d3's symmetric-log
   * `constant`. Pass `0` for a true logarithmic axis.
   * @default 1
   */
  constant?: number;
}

/**
 * Place every point in the box the figure is drawn in.
 * @param points - The points the figure draws.
 * @param box - Its size, in pixels, normally from `useContainerSize`.
 * @param box.width - How wide the figure is drawn.
 * @param box.height - How tall it is drawn.
 * @param scale - The scale each axis is drawn on, which the positions have to
 *   follow to land where the marks do.
 * @param scale.y - How the vertical axis is read.
 * @param scale.x - How the horizontal axis is read.
 * @param options - See {@link AxisMarkPositionsOptions}.
 * @returns One position per point, in the order they were given.
 */
export function axisMarkPositions(
  points: readonly AxisPoint[],
  box: { width: number; height: number },
  scale: { x: AxisScale; y: AxisScale },
  options: AxisMarkPositionsOptions = {},
): AxisMarkPositions {
  const { constant = 1 } = options;
  const x = new Float64Array(points.length);
  const y = new Float64Array(points.length);

  place(points, 'x', scale.x === 'log', constant, box.width, x);
  place(points, 'y', scale.y === 'log', constant, box.height, y);
  // The vertical axis grows upwards while the box is measured from its top.
  for (let index = 0; index < y.length; index++) {
    y[index] = box.height - (y[index] as number);
  }
  return { x, y };
}

function place(
  points: readonly AxisPoint[],
  axis: 'x' | 'y',
  logarithmic: boolean,
  constant: number,
  extent: number,
  into: Float64Array,
): void {
  let min = Infinity;
  let max = -Infinity;
  for (let index = 0; index < points.length; index++) {
    const value = transform(
      (points[index] as AxisPoint)[axis],
      logarithmic,
      constant,
    );
    into[index] = value;
    if (value < min) min = value;
    if (value > max) max = value;
  }

  const span = max - min;
  for (let index = 0; index < into.length; index++) {
    const value = (into[index] as number) - min;
    into[index] = span === 0 ? extent / 2 : (value / span) * extent;
  }
}

/**
 * d3's symmetric log, which is the one a genuine zero survives.
 * @param value - The value to place.
 * @param logarithmic - Whether the axis is read logarithmically at all.
 * @param constant - Width of its linear region.
 * @returns The value in the units the axis is spaced in.
 */
function transform(
  value: number,
  logarithmic: boolean,
  constant: number,
): number {
  if (!logarithmic) return value;
  const width = constant > 0 ? constant : 1;
  return Math.sign(value) * Math.log1p(Math.abs(value) / width);
}
