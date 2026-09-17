/**
 * Which order the axes stand in, when the reader is the one deciding.
 *
 * A parallel-coordinates figure only shows a relationship between two columns
 * that stand next to each other, so the order is not decoration: moving an
 * axis is how a reader asks a different question of the same data. The
 * arithmetic of the move is here, away from the pointer that starts it, so
 * that dragging a name and pressing an arrow key are the same operation.
 */

import type { ParallelAxisLayout } from './parallelAxes.ts';

/**
 * The same ids with one of them moved.
 * @param ids - The axes, from left to right.
 * @param from - Which one is moving.
 * @param to - The place it lands in, counted in the list it left.
 * @returns The new order. The list comes back unchanged when either place is
 * outside it or when nothing moves, so a caller can report without comparing.
 */
export function parallelMoveAxis(
  ids: readonly string[],
  from: number,
  to: number,
): string[] {
  const order = [...ids];
  if (from < 0 || from >= order.length) return order;
  if (to < 0 || to >= order.length || to === from) return order;
  const [moved] = order.splice(from, 1);
  if (moved === undefined) return [...ids];
  order.splice(to, 0, moved);
  return order;
}

/**
 * Where an axis dragged to that position would land.
 * @param x - Where the pointer is, in pixels from the left of the drawing area.
 * @param layouts - The axes, from left to right.
 * @returns The index of the axis whose place it would take, or `-1` when there
 * is nowhere to land. Nearest axis rather than nearest gap: a reader dragging
 * a name over its neighbour means the two to swap, and the neighbour's own
 * name is the thing they are aiming at.
 */
export function parallelDropIndex(
  x: number,
  layouts: readonly ParallelAxisLayout[],
): number {
  let nearest = -1;
  let nearestDistance = Number.POSITIVE_INFINITY;
  for (let index = 0; index < layouts.length; index++) {
    const layout = layouts[index];
    if (layout === undefined) continue;
    const distance = Math.abs(x - layout.x);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearest = index;
    }
  }
  return nearest;
}

/**
 * The ids of the axes, from left to right.
 * @param layouts - The axes, already placed.
 * @returns Their ids, which is what an order is reported as.
 */
export function parallelAxisOrder(
  layouts: readonly ParallelAxisLayout[],
): string[] {
  const ids: string[] = [];
  for (const layout of layouts) ids.push(layout.id);
  return ids;
}
