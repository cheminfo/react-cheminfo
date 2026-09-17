/**
 * Which row the pointer is over.
 *
 * Only the segment between the two axes the pointer sits between is tested, so
 * the cost is one distance per row whatever the number of axes. The vertical
 * gap to the segment is projected onto its normal, so a steep line is no
 * harder to pick than a flat one — without which the only rows a reader can
 * ever point at are the uninteresting ones.
 */

import type { ParallelAxisLayout } from './parallelAxes.ts';
import { parallelPixelAt } from './parallelAxes.ts';

/** How far the pointer may sit from a line and still pick it, in pixels. */
export const PARALLEL_HOVER_TOLERANCE = 6;

/** A pointer position, relative to the top left of the drawing area. */
export interface ParallelPoint {
  /** Pixels from the left of the drawing area. */
  x: number;
  /** Pixels from its top. */
  y: number;
}

/** The pair of axes a pointer sits between, as indices into the layouts. */
export interface ParallelSegment {
  /** The axis to the left of the pointer. */
  left: number;
  /** The axis to its right. */
  right: number;
}

/**
 * The pair of axes a horizontal position sits between.
 * @param x - Pixels from the left of the drawing area.
 * @param axes - The axes, from left to right.
 * @param tolerance - How far past the first and the last axis still counts. Defaults to {@link PARALLEL_HOVER_TOLERANCE}.
 * @returns The pair, or `null` when there are fewer than two axes or the
 * position is past either end of the figure.
 */
export function parallelSegmentAt(
  x: number,
  axes: readonly ParallelAxisLayout[],
  tolerance: number = PARALLEL_HOVER_TOLERANCE,
): ParallelSegment | null {
  const first = axes[0];
  const last = axes.at(-1);
  if (first === undefined || last === undefined || axes.length < 2) return null;
  if (x < first.x - tolerance || x > last.x + tolerance) return null;
  for (let index = 1; index < axes.length; index++) {
    const right = axes[index];
    if (right === undefined) continue;
    if (x <= right.x || index === axes.length - 1) {
      return { left: index - 1, right: index };
    }
  }
  return null;
}

/**
 * The row whose line runs closest to the pointer.
 * @param point - Where the pointer is, relative to the drawing area.
 * @param axes - The axes, from left to right.
 * @param values - Each axis's column, in the same order.
 * @param count - How many rows are drawn.
 * @param included - Which rows a brush keeps, a zero meaning the row is not pickable. Defaults to every row.
 * @param tolerance - How far the pointer may sit from a line. Defaults to {@link PARALLEL_HOVER_TOLERANCE}.
 * @returns The row, or `-1` when the pointer is over no line.
 */
export function parallelNearestRow(
  point: ParallelPoint,
  axes: readonly ParallelAxisLayout[],
  values: ReadonlyArray<ArrayLike<number>>,
  count: number,
  included?: Uint8Array,
  tolerance: number = PARALLEL_HOVER_TOLERANCE,
): number {
  const segment = parallelSegmentAt(point.x, axes, tolerance);
  if (segment === null) return -1;
  const left = axes[segment.left];
  const right = axes[segment.right];
  const leftColumn = values[segment.left];
  const rightColumn = values[segment.right];
  if (left === undefined || right === undefined) return -1;
  if (leftColumn === undefined || rightColumn === undefined) return -1;

  const width = right.x - left.x;
  if (width <= 0) return -1;
  const ratio = (point.x - left.x) / width;
  const rows = Math.min(count, leftColumn.length, rightColumn.length);

  let nearest = -1;
  let nearestDistance = tolerance;
  for (let row = 0; row < rows; row++) {
    if (included?.[row] === 0) continue;
    const leftY = parallelPixelAt(left.pixels, leftColumn[row] as number);
    const rightY = parallelPixelAt(right.pixels, rightColumn[row] as number);
    const gap = Math.abs(leftY + (rightY - leftY) * ratio - point.y);
    const distance = (gap * width) / Math.hypot(width, rightY - leftY);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearest = row;
    }
  }
  return nearest;
}
