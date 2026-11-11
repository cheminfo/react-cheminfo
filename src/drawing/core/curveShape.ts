/**
 * A curve as a drawing edits it, a curve graphic and an arrow alike: the
 * points it passes through and, where set, the control points at each. A
 * point added on the line leaves the curve's shape as it was — the piece is
 * split there — and a point taken out joins its two pieces into one, its
 * neighbours keeping the control points they had.
 */

import type { CurveControl } from './curves.ts';
import { bezierOf, curveControls, curvePieces } from './curves.ts';
import type { Point } from './types.ts';

/** A curve, in points. */
export interface CurveShape {
  /** The points it passes through, in order. */
  points: Point[];
  /** The control points set at each point, null where the curve picks its own. */
  controls: Array<CurveControl | null>;
  /** Whether the last point joins the first. */
  closed: boolean;
}

/** A place on a curve: a piece, and how far along it. */
export interface CurveSpot {
  /** The piece, by its place: piece 0 runs from point 0 to point 1. */
  piece: number;
  /** How far along the piece, 0 at its start and 1 at its end. */
  t: number;
}

/**
 * The place on a curve nearest a point, when it is within reach.
 * @param shape - The curve.
 * @param point - The point, in points.
 * @param reach - How far off the line still counts, in points.
 * @returns The place, or undefined when the line is further than that.
 */
export function curveSpotAt(
  shape: CurveShape,
  point: Point,
  reach: number,
): CurveSpot | undefined {
  const pieces = curvePieces(shape.points, shape.closed, shape.controls);
  let best: CurveSpot | undefined;
  let nearest = reach;
  for (const [index, piece] of pieces.entries()) {
    const projected = bezierOf(piece).project(point);
    const away = Math.hypot(projected.x - point.x, projected.y - point.y);
    if (away <= nearest) {
      nearest = away;
      best = { piece: index, t: projected.t ?? 0 };
    }
  }
  return best;
}

/**
 * The curve with a point added at a place on its line, its shape unchanged.
 * @param shape - The curve.
 * @param spot - Where the point goes.
 * @returns The curve; the point added is the one after the piece's start.
 */
export function withPointAt(shape: CurveShape, spot: CurveSpot): CurveShape {
  const { points, closed } = shape;
  const count = points.length;
  const pieces = curvePieces(points, closed, shape.controls);
  const piece = pieces[spot.piece];
  if (!piece) return shape;
  const resolved = curveControls(points, closed, shape.controls);
  const { left, right } = bezierOf(piece).split(spot.t);
  const [, toLeft, intoPoint, point] = left.points as [
    Point,
    Point,
    Point,
    Point,
  ];
  const [, outOfPoint, intoNext] = right.points as [Point, Point, Point];
  const from = spot.piece;
  const next = (from + 1) % count;
  const controls = handSet(shape);
  // The points either side keep what they showed on their other side.
  controls[from] = {
    before: resolved[from]?.before ?? (points[from] as Point),
    after: toLeft,
  };
  controls[next] = {
    before: intoNext,
    after: resolved[next]?.after ?? (points[next] as Point),
  };
  const nextPoints = [...points];
  nextPoints.splice(from + 1, 0, plain(point));
  controls.splice(from + 1, 0, {
    before: plain(intoPoint),
    after: plain(outOfPoint),
  });
  keepTangents(resolved, { points: nextPoints, controls, closed }, from);
  return { points: nextPoints, controls, closed };
}

/**
 * The curve with one of its points taken out: the pieces either side become
 * one, shaped by the control points leading into and out of them.
 * @param shape - The curve.
 * @param vertex - The point, by its place.
 * @returns The curve, or undefined when too few points would be left: two
 * for an open curve, three for a closed one.
 */
export function withoutPoint(
  shape: CurveShape,
  vertex: number,
): CurveShape | undefined {
  const minimum = shape.closed ? 3 : 2;
  if (shape.points.length <= minimum) return undefined;
  if (vertex < 0 || vertex >= shape.points.length) return undefined;
  const points = [...shape.points];
  const controls = handSet(shape);
  points.splice(vertex, 1);
  controls.splice(vertex, 1);
  return { points, controls, closed: shape.closed };
}

/**
 * The control points set at each point of a curve, one entry per point.
 * @param shape - The curve.
 * @returns A fresh list, null where the curve picks its own.
 */
export function handSet(shape: CurveShape): Array<CurveControl | null> {
  const controls: Array<CurveControl | null> = [];
  for (let index = 0; index < shape.points.length; index++) {
    controls.push(shape.controls[index] ?? null);
  }
  return controls;
}

// Set by hand the control points of every point the curve picks its own for
// that a point added after `from` would move — an open curve's end takes its
// tangent from beyond its neighbour — so the curve keeps its shape.
function keepTangents(
  was: ReturnType<typeof curveControls>,
  shape: CurveShape,
  from: number,
): void {
  const now = curveControls(shape.points, shape.closed, shape.controls);
  for (let old = 0; old < was.length; old++) {
    const index = old > from ? old + 1 : old;
    if (shape.controls[index]) continue;
    const before = was[old];
    const after = now[index];
    const kept =
      samePoint(before?.before, after?.before) &&
      samePoint(before?.after, after?.after);
    if (kept) continue;
    const point = shape.points[index] as Point;
    shape.controls[index] = {
      before: before?.before ?? point,
      after: before?.after ?? point,
    };
  }
}

function samePoint(a: Point | undefined, b: Point | undefined): boolean {
  if (!a || !b) return a === b;
  return Math.abs(a.x - b.x) < 1e-9 && Math.abs(a.y - b.y) < 1e-9;
}

function plain(point: Point): Point {
  return { x: point.x, y: point.y };
}
