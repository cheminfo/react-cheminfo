/**
 * The gradient a filled shape blends along: from one side to the other, from
 * a middle line out to both sides as light falls on a cylinder, or out from a
 * centre as on a sphere, lit from the middle or from a side.
 */

import { isFiniteNumber, isRecord } from '../../values/core/values.ts';

import { boundsOf } from './geometry.ts';
import type { DrawPathGraphic } from './graphics.ts';
import { graphicCorners } from './graphics.ts';
import { isColor } from './palette.ts';
import type { Point } from './types.ts';

/** How a gradient runs between the fill and its second colour. */
export type GradientKind = 'linear' | 'reflected' | 'radial';

/** A fill blending into a second colour. */
export interface GraphicGradient {
  /** How the colours run. */
  kind: GradientKind;
  /**
   * The colour the fill blends into, `#rrggbb` or `#rrggbbaa`: at the far
   * side, at both sides, or at the rim.
   */
  color: string;
  /**
   * The direction the colours run, clockwise from left to right, in degrees,
   * turned with the graphic; a radial gradient has none.
   * @default 0
   */
  angle?: number;
  /**
   * Where a radial gradient starts, across and down the shape's own frame:
   * -1 at its left or top edge, 1 at its right or bottom edge. Only a radial
   * gradient has one.
   * @default { x: 0, y: 0 } — the middle
   */
  centre?: Point;
}

const KINDS: ReadonlySet<unknown> = new Set<GradientKind>([
  'linear',
  'reflected',
  'radial',
]);

/**
 * The direction of a gradient as it is kept: from 0 up to 360 degrees.
 * @param degrees - Any angle, in degrees.
 * @returns The same direction, rounded to a hundredth of a degree.
 */
export function gradientAngle(degrees: number): number {
  const turn = Math.round((((degrees % 360) + 360) % 360) * 100) / 100;
  return turn === 360 ? 0 : turn;
}

/**
 * The centre of a radial gradient as it is kept: each coordinate between -1
 * and 1, to a hundredth.
 * @param centre - Any point, in the shape's frame.
 * @returns The centre, or undefined for the middle.
 */
export function gradientCentre(centre: Point): Point | undefined {
  const x = centreCoordinate(centre.x);
  const y = centreCoordinate(centre.y);
  return x === 0 && y === 0 ? undefined : { x, y };
}

function centreCoordinate(value: number): number {
  return Math.round(Math.min(1, Math.max(-1, value)) * 100) / 100 || 0;
}

/**
 * A gradient from parsed JSON: a known kind into a colour, the angle kept when
 * it runs along a line and the centre when it is radial.
 * @param value - The `gradient` of a graphic.
 * @returns The gradient, or undefined when it does not fit.
 */
export function parseGradient(value: unknown): GraphicGradient | undefined {
  if (!isRecord(value) || !KINDS.has(value.kind)) return undefined;
  if (!isColor(value.color)) return undefined;
  const gradient: GraphicGradient = {
    kind: value.kind as GradientKind,
    color: value.color,
  };
  const { angle, centre } = value;
  if (gradient.kind !== 'radial' && isFiniteNumber(angle)) {
    const turn = gradientAngle(angle);
    if (turn !== 0) gradient.angle = turn;
  }
  if (
    gradient.kind === 'radial' &&
    isRecord(centre) &&
    isFiniteNumber(centre.x) &&
    isFiniteNumber(centre.y)
  ) {
    const kept = gradientCentre({ x: centre.x, y: centre.y });
    if (kept) gradient.centre = kept;
  }
  return gradient;
}

/**
 * Where the centre of a path's radial gradient lies once the path is moved:
 * the same point of the path, in the frame of the box it now stands in.
 * @param before - The path before it moved.
 * @param after - The path moved.
 * @param map - Where a point goes.
 * @returns The centre, or undefined for the middle.
 */
export function movedGradientCentre(
  before: DrawPathGraphic,
  after: DrawPathGraphic,
  map: (point: Point) => Point,
): Point | undefined {
  const centre = before.gradient?.centre;
  if (!centre) return undefined;
  const from = boundsOf(graphicCorners(before));
  const to = boundsOf(graphicCorners(after));
  const point = map({
    x: from.x + ((1 + centre.x) * from.width) / 2,
    y: from.y + ((1 + centre.y) * from.height) / 2,
  });
  return gradientCentre({
    x: to.width > 0 ? ((point.x - to.x) * 2) / to.width - 1 : 0,
    y: to.height > 0 ? ((point.y - to.y) * 2) / to.height - 1 : 0,
  });
}
