/**
 * Small pieces of plane geometry every editor writes around its boxes and
 * outlines: a box grown on every side, a point rounded as a file keeps it, and
 * the `points` attribute of an SVG polygon.
 */

import { roundCoordinate } from './geometry.ts';
import type { Box, Point } from './types.ts';

/**
 * A box grown by the same distance on every side.
 * @param box - The box.
 * @param by - How far each side moves out; a negative distance shrinks it.
 * @returns The grown box.
 */
export function grownBox(box: Box, by: number): Box {
  return {
    x: box.x - by,
    y: box.y - by,
    width: box.width + 2 * by,
    height: box.height + 2 * by,
  };
}

/**
 * A point with both coordinates rounded as a saved figure keeps them.
 * @param point - The point.
 * @returns The rounded point.
 */
export function roundPoint(point: Point): Point {
  return { x: roundCoordinate(point.x), y: roundCoordinate(point.y) };
}

/**
 * The `points` attribute of an SVG polygon or polyline.
 * @param points - Its corners, in order.
 * @returns `x,y` pairs separated by spaces.
 */
export function pointsAttribute(points: readonly Point[]): string {
  let written = '';
  for (let i = 0; i < points.length; i++) {
    const point = points[i] as Point;
    written += `${i === 0 ? '' : ' '}${point.x},${point.y}`;
  }
  return written;
}
