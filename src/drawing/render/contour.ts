/**
 * The outlines glassware is drawn from: lines and cubic Béziers, open or
 * closed, in millimetres with y pointing down. Arcs are written as cubics, so
 * a turned or mirrored piece is moved by moving points and nothing else.
 */

import { cubicPoint } from '../core/curves.ts';
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

/** Draws an outline one piece after the other. */
export class Pen {
  readonly #start: Point;
  readonly #segments: Segment[] = [];
  #at: Point;

  /**
   * Start an outline.
   * @param x - Where it starts.
   * @param y - Where it starts.
   */
  public constructor(x: number, y: number) {
    this.#start = { x, y };
    this.#at = this.#start;
  }

  /**
   * Where the pen is.
   * @returns The current point.
   */
  public get at(): Point {
    return this.#at;
  }

  /**
   * A straight line.
   * @param x - Where it ends.
   * @param y - Where it ends.
   * @returns The pen.
   */
  public line(x: number, y: number): this {
    this.#at = { x, y };
    this.#segments.push({ to: this.#at });
    return this;
  }

  /**
   * A cubic Bézier.
   * @param c1x - First control point.
   * @param c1y - First control point.
   * @param c2x - Second control point.
   * @param c2y - Second control point.
   * @param x - Where it ends.
   * @param y - Where it ends.
   * @returns The pen.
   */
  public curve(
    c1x: number,
    c1y: number,
    c2x: number,
    c2y: number,
    x: number,
    y: number,
  ): this {
    this.#at = { x, y };
    this.#segments.push({
      c1: { x: c1x, y: c1y },
      c2: { x: c2x, y: c2y },
      to: this.#at,
    });
    return this;
  }

  /**
   * A quadratic Bézier, written as the cubic it is.
   * @param cx - The control point.
   * @param cy - The control point.
   * @param x - Where it ends.
   * @param y - Where it ends.
   * @returns The pen.
   */
  public quad(cx: number, cy: number, x: number, y: number): this {
    const from = this.#at;
    return this.curve(
      from.x + ((cx - from.x) * 2) / 3,
      from.y + ((cy - from.y) * 2) / 3,
      x + ((cx - x) * 2) / 3,
      y + ((cy - y) * 2) / 3,
      x,
      y,
    );
  }

  /**
   * An arc of a circle, from one angle to another; the pen first goes to
   * where the arc starts. Angles grow clockwise, as y points down.
   * @param cx - The centre.
   * @param cy - The centre.
   * @param r - The radius.
   * @param from - The starting angle, in radians.
   * @param to - The ending angle; its sign against `from` says which way.
   * @returns The pen.
   */
  public arc(cx: number, cy: number, r: number, from: number, to: number) {
    const start = { x: cx + r * Math.cos(from), y: cy + r * Math.sin(from) };
    if (Math.hypot(start.x - this.#at.x, start.y - this.#at.y) > 1e-9) {
      this.line(start.x, start.y);
    }
    const pieces = Math.max(1, Math.ceil(Math.abs(to - from) / (Math.PI / 2)));
    const step = (to - from) / pieces;
    const k = (4 / 3) * Math.tan(step / 4) * r;
    for (let index = 0; index < pieces; index++) {
      const a = from + index * step;
      const b = a + step;
      this.curve(
        cx + r * Math.cos(a) - k * Math.sin(a),
        cy + r * Math.sin(a) + k * Math.cos(a),
        cx + r * Math.cos(b) + k * Math.sin(b),
        cy + r * Math.sin(b) - k * Math.cos(b),
        cx + r * Math.cos(b),
        cy + r * Math.sin(b),
      );
    }
    return this;
  }

  /**
   * Follow another outline, from wherever the pen is to its start.
   * @param contour - The outline to follow.
   * @returns The pen.
   */
  public follow(contour: Contour): this {
    const { start, segments } = contour;
    if (Math.hypot(start.x - this.#at.x, start.y - this.#at.y) > 1e-9) {
      this.line(start.x, start.y);
    }
    for (const segment of segments) {
      this.#segments.push(segment);
      this.#at = segment.to;
    }
    return this;
  }

  /**
   * The outline, joined back to its start.
   * @returns The closed contour.
   */
  public close(): Contour {
    return { start: this.#start, segments: this.#segments, closed: true };
  }

  /**
   * The outline, left open.
   * @returns The open contour.
   */
  public open(): Contour {
    return { start: this.#start, segments: this.#segments, closed: false };
  }
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
      for (let index = 1; index <= steps; index++) {
        points.push(cubicPoint(from, c1, c2, to, index / steps));
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
