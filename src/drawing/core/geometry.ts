import { clamp } from '../../format/core/clamp.ts';

import type { Box, Point } from './types.ts';

/**
 * The distance between two points.
 * @param a - First point.
 * @param b - Second point.
 * @returns The Euclidean distance.
 */
export function distance(a: Point, b: Point): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

/**
 * The direction from one point to another.
 * @param from - Where the direction starts.
 * @param to - Where it points.
 * @returns The angle in radians, clockwise on screen since y grows downwards.
 */
export function angleTo(from: Point, to: Point): number {
  return Math.atan2(to.y - from.y, to.x - from.x);
}

/**
 * The point at a given angle and distance from another.
 * @param origin - Where to start.
 * @param angle - Direction, in radians.
 * @param length - How far.
 * @returns The point reached.
 */
export function polar(origin: Point, angle: number, length: number): Point {
  return {
    x: origin.x + Math.cos(angle) * length,
    y: origin.y + Math.sin(angle) * length,
  };
}

/**
 * An angle brought into [0, 2π).
 * @param angle - Any angle, in radians.
 * @returns The same direction, in [0, 2π).
 */
export function normalizeAngle(angle: number): number {
  const turn = 2 * Math.PI;
  const value = angle % turn;
  return value < 0 ? value + turn : value;
}

/**
 * An angle rounded to the nearest multiple of a step.
 * @param angle - Any angle, in radians.
 * @param step - The step, in radians.
 * @returns The snapped angle.
 */
export function snapAngle(angle: number, step: number): number {
  return Math.round(angle / step) * step;
}

/**
 * The smallest box holding every point, grown by a margin.
 * @param points - The points; none gives an empty box at the origin.
 * @param margin - How much to grow each side by, in points.
 * @returns The box.
 */
export function boundsOf(points: readonly Point[], margin = 0): Box {
  if (points.length === 0) return { x: 0, y: 0, width: 0, height: 0 };
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const point of points) {
    if (point.x < minX) minX = point.x;
    if (point.y < minY) minY = point.y;
    if (point.x > maxX) maxX = point.x;
    if (point.y > maxY) maxY = point.y;
  }
  return {
    x: minX - margin,
    y: minY - margin,
    width: maxX - minX + 2 * margin,
    height: maxY - minY + 2 * margin,
  };
}

/**
 * Whether a point lies inside a box, edges included.
 * @param box - The box.
 * @param point - The point.
 * @returns True when inside.
 */
export function boxContains(box: Box, point: Point): boolean {
  return (
    point.x >= box.x &&
    point.x <= box.x + box.width &&
    point.y >= box.y &&
    point.y <= box.y + box.height
  );
}

/**
 * The point of a box closest to a point.
 * @param box - The box.
 * @param point - The point.
 * @returns The point itself when it lies in the box, or on the box's edge.
 */
export function clampToBox(box: Box, point: Point): Point {
  return {
    x: Math.min(box.x + box.width, Math.max(box.x, point.x)),
    y: Math.min(box.y + box.height, Math.max(box.y, point.y)),
  };
}

/**
 * Whether a point lies inside a polygon, by the even–odd rule, so a loop
 * drawn across itself leaves its doubly wound part out.
 * @param polygon - The vertices, the last joined back to the first.
 * @param point - The point.
 * @returns True when inside.
 */
export function polygonContains(
  polygon: readonly Point[],
  point: Point,
): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[i] as Point;
    const b = polygon[j] as Point;
    if (
      a.y > point.y !== b.y > point.y &&
      point.x < ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y) + a.x
    ) {
      inside = !inside;
    }
  }
  return inside;
}

/**
 * The box spanned by two corners, in either order.
 * @param a - One corner.
 * @param b - The opposite corner.
 * @returns The box.
 */
export function boxFromCorners(a: Point, b: Point): Box {
  return {
    x: Math.min(a.x, b.x),
    y: Math.min(a.y, b.y),
    width: Math.abs(b.x - a.x),
    height: Math.abs(b.y - a.y),
  };
}

/**
 * The four corners of a box.
 * @param box - The box.
 * @returns Top left, top right, bottom right, bottom left.
 */
export function boxCorners(box: Box): Point[] {
  const { x, y, width, height } = box;
  return [
    { x, y },
    { x: x + width, y },
    { x: x + width, y: y + height },
    { x, y: y + height },
  ];
}

/**
 * The area of a polygon, by the shoelace formula.
 * @param polygon - The vertices, the last joined back to the first.
 * @returns The area, positive when the vertices run clockwise on the page.
 */
export function signedArea(polygon: readonly Point[]): number {
  let area = 0;
  for (let index = 0; index < polygon.length; index++) {
    const a = polygon[index] as Point;
    const b = polygon[(index + 1) % polygon.length] as Point;
    area += a.x * b.y - b.x * a.y;
  }
  return area / 2;
}

/**
 * The distance from a point to a segment.
 * @param point - The point.
 * @param a - One end of the segment.
 * @param b - The other end.
 * @returns The shortest distance.
 */
export function distanceToSegment(point: Point, a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lengthSquared = dx * dx + dy * dy;
  if (lengthSquared === 0) return distance(point, a);
  const t = clamp(
    ((point.x - a.x) * dx + (point.y - a.y) * dy) / lengthSquared,
    0,
    1,
  );
  return Math.hypot(point.x - (a.x + t * dx), point.y - (a.y + t * dy));
}

/**
 * A coordinate kept to a hundredth of a point, which is what a file stores.
 * Never −0, which prints as 0 but would compare unequal to the 0 read back.
 * @param value - A coordinate, in points.
 * @returns The coordinate, rounded.
 */
export function roundCoordinate(value: number): number {
  return Math.round(value * 100) / 100 + 0;
}
