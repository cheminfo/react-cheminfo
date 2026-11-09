/**
 * A smooth curve through a run of vertices, drawn as one cubic Bézier piece
 * from each vertex to the next. Unless a vertex is given control points of its
 * own, its tangent runs parallel to the chord joining its two neighbours, and
 * each control arm is a third of the piece it shapes, so the curve passes
 * through every vertex and never loops between two of them however unevenly
 * they are spaced.
 */

import type { Point } from './types.ts';
import { along, unit } from './vectors.ts';

/** The zero vector, which a curve's tangent is where its neighbours meet. */
const ZERO: Point = { x: 0, y: 0 };

/** The two control points that set a curve's tangent at one vertex. */
export interface CurveControl {
  /** The control point the curve arrives through, on the previous side. */
  before: Point;
  /** The control point the curve leaves through, on the next side. */
  after: Point;
}

/** The control points a vertex actually uses: an open curve's ends use one. */
interface ResolvedControl {
  /**
   * The control point the curve arrives through.
   * @default undefined — the first vertex of an open curve
   */
  before?: Point;
  /**
   * The control point the curve leaves through.
   * @default undefined — the last vertex of an open curve
   */
  after?: Point;
}

/** One cubic Bézier piece of a curve, from a vertex to the next. */
export interface CubicPiece {
  /** The vertex it starts at. */
  from: Point;
  /** The control point that sets the direction it leaves `from` in. */
  control1: Point;
  /** The control point that sets the direction it reaches `to` in. */
  control2: Point;
  /** The vertex it ends at. */
  to: Point;
}

/** How many points stand for each piece when a curve is followed. */
const PIECE_STEPS = 16;

/**
 * The control points of every vertex of a curve: those set by hand where
 * there are some, the curve's own everywhere else.
 * @param points - The vertices, in order.
 * @param closed - Whether the last vertex joins the first.
 * @param controls - The control points set by hand, null where none is.
 * @returns One entry per vertex.
 */
export function curveControls(
  points: readonly Point[],
  closed: boolean,
  controls?: ReadonlyArray<CurveControl | null>,
): ResolvedControl[] {
  const count = points.length;
  const tangents = curveTangents(points, closed);
  const resolved: ResolvedControl[] = [];
  for (let index = 0; index < count; index++) {
    const point = points[index] as Point;
    const hasBefore = closed ? count > 1 : index > 0;
    const hasAfter = closed ? count > 1 : index < count - 1;
    const set = controls?.[index];
    const entry: ResolvedControl = {};
    if (set) {
      if (hasBefore) entry.before = set.before;
      if (hasAfter) entry.after = set.after;
    } else {
      const tangent = tangents[index] as Point;
      if (hasBefore) {
        const previous = points[(index - 1 + count) % count] as Point;
        entry.before = along(point, tangent, -arm(previous, point));
      }
      if (hasAfter) {
        const next = points[(index + 1) % count] as Point;
        entry.after = along(point, tangent, arm(point, next));
      }
    }
    resolved.push(entry);
  }
  return resolved;
}

/**
 * The cubic pieces of the smooth curve through some vertices.
 * @param points - The vertices, in order.
 * @param closed - Whether the last vertex joins the first.
 * @param controls - The control points set by hand, null where none is.
 * @returns One piece per side: one fewer than the vertices for an open
 * curve, as many for a closed one.
 */
export function curvePieces(
  points: readonly Point[],
  closed: boolean,
  controls?: ReadonlyArray<CurveControl | null>,
): CubicPiece[] {
  const count = points.length;
  if (count < 2) return [];
  const resolved = curveControls(points, closed, controls);
  const pieces: CubicPiece[] = [];
  const sides = closed ? count : count - 1;
  for (let index = 0; index < sides; index++) {
    const next = (index + 1) % count;
    const from = points[index] as Point;
    const to = points[next] as Point;
    pieces.push({
      from,
      control1: resolved[index]?.after ?? from,
      control2: resolved[next]?.before ?? to,
      to,
    });
  }
  return pieces;
}

/**
 * Points along the smooth curve through some vertices, close enough to it
 * for the pointer and for its bounds.
 * @param points - The vertices, in order.
 * @param closed - Whether the last vertex joins the first.
 * @param controls - The control points set by hand, null where none is.
 * @returns The points, both ends included; a closed curve's chain ends where
 * it starts.
 */
export function curveOutline(
  points: readonly Point[],
  closed: boolean,
  controls?: ReadonlyArray<CurveControl | null>,
): Point[] {
  const pieces = curvePieces(points, closed, controls);
  const first = pieces[0];
  if (!first) return [...points];
  const outline: Point[] = [first.from];
  for (const { from, control1, control2, to } of pieces) {
    for (let step = 1; step <= PIECE_STEPS; step++) {
      outline.push(
        cubicPoint(from, control1, control2, to, step / PIECE_STEPS),
      );
    }
  }
  return outline;
}

/**
 * A point of a cubic Bézier.
 * @param from - Where it starts.
 * @param control1 - The control point leaving the start.
 * @param control2 - The control point arriving at the end.
 * @param to - Where it ends.
 * @param t - How far along, from 0 at the start to 1 at the end.
 * @returns The point.
 */
export function cubicPoint(
  from: Point,
  control1: Point,
  control2: Point,
  to: Point,
  t: number,
): Point {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return {
    x: a * from.x + b * control1.x + c * control2.x + d * to.x,
    y: a * from.y + b * control1.y + c * control2.y + d * to.y,
  };
}

// The unit tangent at each vertex. At the two ends of an open curve it is the
// next tangent mirrored about the end side, so the end pieces bend as much as
// their neighbours rather than leaving straight.
function curveTangents(points: readonly Point[], closed: boolean): Point[] {
  const count = points.length;
  const tangents: Point[] = [];
  for (let index = 0; index < count; index++) {
    const before = closed
      ? (points[(index - 1 + count) % count] as Point)
      : (points[Math.max(0, index - 1)] as Point);
    const after = closed
      ? (points[(index + 1) % count] as Point)
      : (points[Math.min(count - 1, index + 1)] as Point);
    tangents.push(unit(before, after, ZERO));
  }
  if (!closed && count > 2) {
    tangents[0] = mirrored(
      tangents[1] as Point,
      points[0] as Point,
      points[1] as Point,
    );
    tangents[count - 1] = mirrored(
      tangents[count - 2] as Point,
      points[count - 2] as Point,
      points[count - 1] as Point,
    );
  }
  return tangents;
}

// The control arm of the piece between two vertices: a third of it.
function arm(from: Point, to: Point): number {
  return Math.hypot(to.x - from.x, to.y - from.y) / 3;
}

// A direction mirrored about the side from one point to another.
function mirrored(direction: Point, from: Point, to: Point): Point {
  const side = unit(from, to, ZERO);
  const projection = 2 * (direction.x * side.x + direction.y * side.y);
  return {
    x: projection * side.x - direction.x,
    y: projection * side.y - direction.y,
  };
}
