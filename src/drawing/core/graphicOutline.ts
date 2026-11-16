/**
 * Where a graphic's outline runs, as a chain of points close enough to its
 * curves for the pointer: what the pointer is near, and what a click inside a
 * filled graphic lands on.
 */

import { curveOutline } from './curves.ts';
import { distanceToSegment, polygonContains } from './geometry.ts';
import type { DrawBoxGraphic, DrawGraphic } from './graphics.ts';
import { boxTurn, isBoxGraphic, isClosedGraphic } from './graphics.ts';
import type { Point } from './types.ts';

/** How many segments stand for a whole ellipse, and for a rounded corner. */
const ELLIPSE_SEGMENTS = 72;
const CORNER_SEGMENTS = 8;

/**
 * How far a point is from a graphic: from its outline, or zero inside a
 * filled one.
 * @param graphic - The graphic.
 * @param point - The point.
 * @returns The distance, in points.
 */
export function distanceToGraphic(graphic: DrawGraphic, point: Point): number {
  const outline = graphicOutline(graphic);
  if (
    graphic.fill &&
    isClosedGraphic(graphic) &&
    polygonContains(outline, point)
  ) {
    return 0;
  }
  let best = Infinity;
  for (let index = 1; index < outline.length; index++) {
    const value = distanceToSegment(
      point,
      outline[index - 1] as Point,
      outline[index] as Point,
    );
    if (value < best) best = value;
  }
  return best;
}

// The outline of a graphic as a chain of points; a closed graphic's chain
// ends where it starts.
function graphicOutline(graphic: DrawGraphic): Point[] {
  if (isBoxGraphic(graphic)) {
    const outline =
      graphic.kind === 'ellipse'
        ? ellipseOutline(graphic)
        : roundedRectangle(graphic);
    return outline.map(boxTurn(graphic));
  }
  const { kind, points, smooth, controls } = graphic;
  if (smooth) return curveOutline(points, kind === 'polygon', controls);
  return kind === 'polygon' ? [...points, points[0] as Point] : points;
}

function ellipseOutline(graphic: DrawBoxGraphic): Point[] {
  const rx = graphic.width / 2;
  const ry = graphic.height / 2;
  const cx = graphic.x + rx;
  const cy = graphic.y + ry;
  const points: Point[] = [];
  for (let index = 0; index <= ELLIPSE_SEGMENTS; index++) {
    const angle = (2 * Math.PI * index) / ELLIPSE_SEGMENTS;
    points.push({ x: cx + rx * Math.cos(angle), y: cy + ry * Math.sin(angle) });
  }
  return points;
}

function roundedRectangle(graphic: DrawBoxGraphic): Point[] {
  const { x, y, width, height } = graphic;
  const radius = Math.min(graphic.radius ?? 0, width / 2, height / 2);
  // The centre of each corner's arc, and the angle its quarter turn starts at.
  const corners: Array<[number, number, number]> = [
    [x + width - radius, y + radius, -Math.PI / 2],
    [x + width - radius, y + height - radius, 0],
    [x + radius, y + height - radius, Math.PI / 2],
    [x + radius, y + radius, Math.PI],
  ];
  const points: Point[] = [];
  for (const [cx, cy, start] of corners) {
    const steps = radius > 0 ? CORNER_SEGMENTS : 0;
    for (let step = 0; step <= steps; step++) {
      const angle = start + (Math.PI / 2) * (steps === 0 ? 0 : step / steps);
      points.push({
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle),
      });
    }
  }
  points.push(points[0] as Point);
  return points;
}
