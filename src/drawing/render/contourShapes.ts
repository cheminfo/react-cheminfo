/**
 * Ready-made outlines the benches and the glassware draw with: a segment, a
 * circle, the round-bottomed wall of a tube, a smooth curve through points,
 * and the crescents and streaks of light drawn on shaded glass.
 */

import { clamp } from '../../format/core/clamp.ts';
import type { Point } from '../core/types.ts';

import type { Contour } from './contour.ts';
import { Pen } from './pen.ts';

/**
 * A straight line as an open outline.
 * @param from - One end.
 * @param to - The other.
 * @returns The outline.
 */
export function segmentContour(from: Point, to: Point): Contour {
  return new Pen(from.x, from.y).line(to.x, to.y).open();
}

/**
 * A circle.
 * @param cx - The x of its centre.
 * @param cy - The y of its centre.
 * @param radius - Its radius.
 * @returns The outline, closed.
 */
export function circleContour(cx: number, cy: number, radius: number): Contour {
  return new Pen(cx + radius, cy).arc(cx, cy, radius, 0, 2 * Math.PI).close();
}

/**
 * The wall of a tube with a round bottom, from a height down and round its
 * bottom to the axis.
 * @param radius - The radius of the wall.
 * @param top - The height it starts at.
 * @param centre - The height of the centre of its bottom.
 * @returns The outline, open.
 */
export function roundBottomSide(
  radius: number,
  top: number,
  centre: number,
): Contour {
  return new Pen(radius, top)
    .line(radius, centre)
    .arc(0, centre, radius, 0, Math.PI / 2)
    .open();
}

/**
 * A smooth outline through points, as Catmull–Rom splines written as cubics.
 * @param points - The points it passes through, at least two.
 * @param closed - Whether it joins back to the first point.
 * @returns The outline.
 */
export function smoothContour(
  points: readonly Point[],
  closed: boolean,
): Contour {
  const count = points.length;
  const at = (index: number): Point =>
    closed
      ? (points[(index + count) % count] as Point)
      : (points[clamp(index, 0, count - 1)] as Point);
  const first = at(0);
  const pen = new Pen(first.x, first.y);
  const last = closed ? count : count - 1;
  for (let index = 0; index < last; index++) {
    const before = at(index - 1);
    const from = at(index);
    const to = at(index + 1);
    const after = at(index + 2);
    pen.curve(
      from.x + (to.x - before.x) / 6,
      from.y + (to.y - before.y) / 6,
      to.x - (after.x - from.x) / 6,
      to.y - (after.y - from.y) / 6,
      to.x,
      to.y,
    );
  }
  return closed ? pen.close() : pen.open();
}

/**
 * A crescent of light along an arc: thickest in its middle, tapering to
 * points at both ends.
 * @param cx - The x of the centre of the arc.
 * @param cy - The y of the centre of the arc.
 * @param radius - The radius of its outer edge.
 * @param from - Where it starts, in radians.
 * @param to - Where it ends, in radians.
 * @param thickness - How thick it is in the middle.
 * @returns The closed outline.
 */
export function crescent(
  cx: number,
  cy: number,
  radius: number,
  from: number,
  to: number,
  thickness: number,
): Contour {
  const steps = 8;
  const points: Point[] = [];
  for (let index = 0; index <= steps; index++) {
    const angle = from + ((to - from) * index) / steps;
    points.push({
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    });
  }
  for (let index = steps - 1; index > 0; index--) {
    const angle = from + ((to - from) * index) / steps;
    const inner = radius - thickness * Math.sin((Math.PI * index) / steps);
    points.push({
      x: cx + inner * Math.cos(angle),
      y: cy + inner * Math.sin(angle),
    });
  }
  return smoothContour(points, true);
}

/**
 * A streak of light along a straight wall, tapering at both ends.
 * @param from - Where it starts.
 * @param to - Where it ends.
 * @param thickness - How thick it is in the middle.
 * @returns The closed outline.
 */
export function streak(from: Point, to: Point, thickness: number): Contour {
  const length = Math.hypot(to.x - from.x, to.y - from.y);
  const nx = (-(to.y - from.y) / length) * (thickness / 2);
  const ny = ((to.x - from.x) / length) * (thickness / 2);
  const along = (share: number, side: number): Point => ({
    x: from.x + (to.x - from.x) * share + nx * side,
    y: from.y + (to.y - from.y) * share + ny * side,
  });
  return smoothContour(
    [from, along(0.3, 1), along(0.7, 1), to, along(0.7, -1), along(0.3, -1)],
    true,
  );
}
