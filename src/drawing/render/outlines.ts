/**
 * Ready-made outlines a shape is drawn as — a polygon, a rectangle with
 * rounded corners — and an outline with every point moved.
 */

import type { Point } from '../core/types.ts';

import type { Contour } from './contour.ts';
import { Pen, isCubic } from './contour.ts';

/**
 * A closed polygon.
 * @param points - Its corners, at least one.
 * @returns The outline.
 */
export function polygonContour(points: readonly Point[]): Contour {
  const [first, ...rest] = points as [Point, ...Point[]];
  const pen = new Pen(first.x, first.y);
  for (const point of rest) pen.line(point.x, point.y);
  return pen.close();
}

/**
 * A rectangle with rounded corners.
 * @param x - Its left edge.
 * @param y - Its top edge.
 * @param width - Its width.
 * @param height - Its height.
 * @param radius - The radius of its corners, kept to half its shorter side.
 * @returns The outline, closed.
 */
export function roundedRect(
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): Contour {
  const r = Math.min(radius, width / 2, height / 2);
  const right = x + width;
  const bottom = y + height;
  const half = Math.PI / 2;
  return new Pen(x + r, y)
    .line(right - r, y)
    .arc(right - r, y + r, r, -half, 0)
    .line(right, bottom - r)
    .arc(right - r, bottom - r, r, 0, half)
    .line(x + r, bottom)
    .arc(x + r, bottom - r, r, half, 2 * half)
    .line(x, y + r)
    .arc(x + r, y + r, r, 2 * half, 3 * half)
    .close();
}

/**
 * An outline with every point moved.
 * @param contour - The outline.
 * @param move - Where a point goes.
 * @returns The moved outline.
 */
export function mapContour(
  contour: Contour,
  move: (point: Point) => Point,
): Contour {
  return {
    start: move(contour.start),
    segments: contour.segments.map((segment) =>
      isCubic(segment)
        ? { c1: move(segment.c1), c2: move(segment.c2), to: move(segment.to) }
        : { to: move(segment.to) },
    ),
    closed: contour.closed,
  };
}
