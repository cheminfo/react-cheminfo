/**
 * The outlines glassware is drawn from: lines and cubic Béziers, open or
 * closed, in millimetres with y pointing down. Arcs are written as cubics, so
 * a turned or mirrored piece is moved by moving points and nothing else.
 */

import { bezierOf } from '../core/curves.ts';
import { boundsOf } from '../core/geometry.ts';
import type { Box, Point } from '../core/types.ts';
/** A straight piece of an outline. */
interface LineSegment {
  /** Where it ends. */
  to: Point;
}

/** A cubic Bézier piece of an outline. */
interface CubicSegment {
  /** The control point leaving the previous end. */
  c1: Point;
  /** The control point arriving at this end. */
  c2: Point;
  /** Where it ends. */
  to: Point;
}

/** One piece of an outline. */
export type Segment = LineSegment | CubicSegment;

/** An outline: where it starts, its pieces, and whether it closes. */
export interface Contour {
  /** Where it starts. */
  start: Point;
  /** Its pieces, in order. */
  segments: Segment[];
  /** Whether the last piece joins back to the start. */
  closed: boolean;
}

/**
 * Whether a piece of an outline is a curve.
 * @param segment - The piece.
 * @returns True for a cubic.
 */
export function isCubic(segment: Segment): segment is CubicSegment {
  return 'c1' in segment;
}

/**
 * An outline as a polyline, its curves walked in even steps.
 * @param contour - The outline.
 * @param steps - Points per curve.
 * @returns The points, the start first; a closed outline does not repeat it.
 */
export function sampleContour(contour: Contour, steps = 8): Point[] {
  const points: Point[] = [contour.start];
  let from = contour.start;
  for (const segment of contour.segments) {
    if (isCubic(segment)) {
      const { c1, c2, to } = segment;
      const lookup = bezierOf({ from, control1: c1, control2: c2, to }).getLUT(
        steps,
      );
      // The first point of each curve is the end of the piece before it.
      for (let index = 1; index < lookup.length; index++) {
        const { x, y } = lookup[index] as Point;
        points.push({ x, y });
      }
    } else {
      points.push(segment.to);
    }
    from = segment.to;
  }
  if (contour.closed && points.length > 1) {
    const last = points.at(-1) as Point;
    if (Math.hypot(last.x - contour.start.x, last.y - contour.start.y) < 1e-9) {
      points.pop();
    }
  }
  return points;
}

/**
 * Where an outline ends.
 * @param contour - The outline.
 * @returns Its last point; its start when it has no pieces.
 */
export function contourEnd(contour: Contour): Point {
  return contour.segments.at(-1)?.to ?? contour.start;
}

/**
 * The box a set of outlines takes up, their curves walked in even steps.
 * @param contours - The outlines.
 * @param steps - Points per curve.
 * @returns The box; undefined when there is no outline.
 */
export function contourBounds(
  contours: readonly Contour[],
  steps = 8,
): Box | undefined {
  const points: Point[] = [];
  for (const contour of contours) points.push(...sampleContour(contour, steps));
  return points.length === 0 ? undefined : boundsOf(points);
}
