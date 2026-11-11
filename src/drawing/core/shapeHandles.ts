/**
 * The handles a curve is edited by, a curve graphic and an arrow alike: a
 * square on each point it passes through, which moves that point with its
 * control points, and a ring on each control point, which turns the tangent
 * there. A ring dragged keeps the opposite one in line, so the curve stays
 * smooth through the point; with Alt it moves alone and leaves a corner, and
 * with shift it turns by 15° steps. A drag from the line between the points
 * pulls a new one out, and Backspace over a point takes it out.
 */

import type { CurveShape, CurveSpot } from './curveShape.ts';
import { curveSpotAt, handSet } from './curveShape.ts';
import { curveControls } from './curves.ts';
import { angleTo, distance, polar, snapAngle } from './geometry.ts';
import type { Point } from './types.ts';

/** A handle of a curve: one of its points, or a control point of one. */
export interface CurveHandle {
  /** The point it belongs to, by its place in the curve. */
  vertex: number;
  /**
   * The point itself, the control point the curve arrives through, or the
   * one it leaves through.
   */
  part: 'point' | 'before' | 'after';
}

/** How a dragged handle is held. */
export interface CurveDragOptions {
  /** Whether the tangent turns by 15° steps. */
  snap: boolean;
  /** Whether a control point moves alone, leaving a corner. */
  corner: boolean;
}

/** How far from a handle the pointer still takes it, in screen pixels. */
const HANDLE_REACH = 7;

/** How far from the line a drag still pulls a point out of it, in pixels. */
const LINE_REACH = 5;

/** The step a tangent turns by with shift held: 15°. */
const SNAP = Math.PI / 12;

/**
 * Where the handles of a curve are: its control points first, so one lying
 * on its point is still taken, then the points.
 * @param shape - The curve.
 * @returns Each handle and where it is, in points.
 */
export function shapeHandles(
  shape: CurveShape,
): Array<{ handle: CurveHandle; point: Point }> {
  const resolved = curveControls(shape.points, shape.closed, shape.controls);
  const controls: Array<{ handle: CurveHandle; point: Point }> = [];
  const points: Array<{ handle: CurveHandle; point: Point }> = [];
  for (let vertex = 0; vertex < shape.points.length; vertex++) {
    const { before, after } = resolved[vertex] ?? {};
    if (before) {
      controls.push({ handle: { vertex, part: 'before' }, point: before });
    }
    if (after) {
      controls.push({ handle: { vertex, part: 'after' }, point: after });
    }
    points.push({
      handle: { vertex, part: 'point' },
      point: shape.points[vertex] as Point,
    });
  }
  return [...controls, ...points];
}

/**
 * The handle of a curve under the pointer, if any.
 * @param shape - The curve.
 * @param pointer - The pointer, in points.
 * @param pixel - Points per screen pixel.
 * @returns The nearest handle within reach, or undefined.
 */
export function shapeHandleAt(
  shape: CurveShape,
  pointer: Point,
  pixel: number,
): CurveHandle | undefined {
  let best: CurveHandle | undefined;
  let nearest = HANDLE_REACH * pixel;
  for (const { handle, point } of shapeHandles(shape)) {
    const away = distance(point, pointer);
    if (away <= nearest && (!best || away < nearest)) {
      best = handle;
      nearest = away;
    }
  }
  return best;
}

/**
 * The place on a curve's line under the pointer, where a drag pulls a new
 * point out.
 * @param shape - The curve.
 * @param pointer - The pointer, in points.
 * @param pixel - Points per screen pixel.
 * @returns The place, or undefined when the pointer is off the line.
 */
export function shapeLineAt(
  shape: CurveShape,
  pointer: Point,
  pixel: number,
): CurveSpot | undefined {
  return curveSpotAt(shape, pointer, LINE_REACH * pixel);
}

/**
 * The curve with a handle dragged: a point moves with its control points, a
 * control point turns the tangent.
 * @param shape - The curve as it was when the handle was taken.
 * @param handle - The handle.
 * @param pointer - Where the pointer is, in points.
 * @param options - Whether the tangent snaps, and whether it breaks.
 * @returns The curve.
 */
export function dragShapeHandle(
  shape: CurveShape,
  handle: CurveHandle,
  pointer: Point,
  options: CurveDragOptions,
): CurveShape {
  const { vertex, part } = handle;
  const controls = handSet(shape);
  const point = shape.points[vertex] as Point;
  if (part === 'point') {
    const dx = pointer.x - point.x;
    const dy = pointer.y - point.y;
    const shift = (at: Point) => ({ x: at.x + dx, y: at.y + dy });
    const set = controls[vertex];
    if (set) {
      controls[vertex] = { before: shift(set.before), after: shift(set.after) };
    }
    const points = [...shape.points];
    points[vertex] = pointer;
    return { ...shape, points, controls };
  }
  const resolved = curveControls(shape.points, shape.closed, shape.controls)[
    vertex
  ];
  const target = options.snap
    ? polar(
        point,
        snapAngle(angleTo(point, pointer), SNAP),
        distance(point, pointer),
      )
    : pointer;
  const other = part === 'after' ? resolved?.before : resolved?.after;
  const opposite = options.corner
    ? (other ?? mirror(point, target))
    : inLine(point, target, other);
  controls[vertex] =
    part === 'after'
      ? { before: opposite, after: target }
      : { before: target, after: opposite };
  return { ...shape, controls };
}

/**
 * The curve with one point given back the tangent the curve picks.
 * @param shape - The curve.
 * @param vertex - The point, by its place.
 * @returns The curve.
 */
export function resetShapeVertex(
  shape: CurveShape,
  vertex: number,
): CurveShape {
  const controls = handSet(shape);
  controls[vertex] = null;
  return { ...shape, controls };
}

// The control point opposite a dragged one, in line with it through the
// point, at the distance it had, or at the dragged one's when it had none.
function inLine(point: Point, dragged: Point, other: Point | undefined): Point {
  const reach = other ? distance(point, other) : 0;
  const length = reach > 0 ? reach : distance(point, dragged);
  if (distance(point, dragged) === 0) return other ?? point;
  return polar(point, angleTo(dragged, point), length);
}

function mirror(point: Point, dragged: Point): Point {
  return { x: 2 * point.x - dragged.x, y: 2 * point.y - dragged.y };
}
