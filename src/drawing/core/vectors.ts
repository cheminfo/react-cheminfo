/**
 * Directions and the moves made along them: a unit direction, the one a
 * quarter turn to its left, a step along one, and a turn about a pivot.
 */

import type { Point } from './types.ts';

/** The direction of the x axis. */
const X_AXIS: Point = { x: 1, y: 0 };

/**
 * Where a point goes once turned about a pivot, and scaled from it.
 * @param pivot - The point that stays put.
 * @param degrees - How far, clockwise on the page.
 * @param scale - How much farther from the pivot every point ends up.
 * @returns The map; the identity when nothing turns or scales.
 */
export function turnAbout(
  pivot: Point,
  degrees: number,
  scale = 1,
): (point: Point) => Point {
  if (degrees === 0 && scale === 1) return (point) => point;
  const angle = (degrees * Math.PI) / 180;
  const cos = Math.cos(angle) * scale;
  const sin = Math.sin(angle) * scale;
  return (point) => {
    const dx = point.x - pivot.x;
    const dy = point.y - pivot.y;
    return {
      x: pivot.x + dx * cos - dy * sin,
      y: pivot.y + dx * sin + dy * cos,
    };
  };
}

/**
 * A point moved along a direction.
 * @param point - Where to start.
 * @param direction - A unit direction.
 * @param distance - How far, in points; negative goes back.
 * @returns The point reached.
 */
export function along(point: Point, direction: Point, distance: number): Point {
  return {
    x: point.x + direction.x * distance,
    y: point.y + direction.y * distance,
  };
}

/**
 * The unit direction from one point to another.
 * @param from - The start.
 * @param to - The end.
 * @param fallback - The direction given for two equal points.
 * @returns The direction.
 */
export function unit(from: Point, to: Point, fallback = X_AXIS): Point {
  const length = Math.hypot(to.x - from.x, to.y - from.y);
  if (length === 0) return fallback;
  return { x: (to.x - from.x) / length, y: (to.y - from.y) / length };
}

/**
 * The direction to the left of another, as the page shows it.
 * @param direction - A unit direction.
 * @returns The unit direction a quarter turn to its left.
 */
export function leftOf(direction: Point): Point {
  return { x: direction.y, y: -direction.x };
}
