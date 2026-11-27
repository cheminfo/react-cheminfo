/**
 * The lines, polygons, curves, rectangles and ellipses of a drawing read back
 * from a file, kept only when they fit the schema.
 */

import { isFiniteNumber, isRecord } from '../../values/core/values.ts';

import type { CurveControl } from './curves.ts';
import { isLineDash } from './dashes.ts';
import { parseGradient } from './graphicGradients.ts';
import type { DrawGraphic, DrawPathGraphic, GraphicStyle } from './graphics.ts';
import { isClosedGraphic } from './graphics.ts';
import { isColor } from './palette.ts';
import { normalizeDegrees } from './pictures.ts';
import type { Point } from './types.ts';

const PATH_KINDS: ReadonlySet<unknown> = new Set<DrawPathGraphic['kind']>([
  'line',
  'polyline',
  'polygon',
]);

/** The most vertices a polyline or a polygon may carry. */
const MAX_POINTS = 1000;

/**
 * A graphic from parsed JSON.
 * @param value - One item of `objects`.
 * @returns The graphic, or undefined when it does not fit.
 */
export function parseGraphic(value: unknown): DrawGraphic | undefined {
  if (!isRecord(value) || typeof value.id !== 'string') return undefined;
  const { id, kind } = value;
  let graphic: DrawGraphic;
  if (kind === 'rectangle' || kind === 'ellipse') {
    const { x, y, width, height } = value;
    if (!isFiniteNumber(x) || !isFiniteNumber(y)) return undefined;
    if (!isFiniteNumber(width) || !isFiniteNumber(height)) return undefined;
    if (width <= 0 || height <= 0) return undefined;
    graphic = { type: 'graphic', id, kind, x, y, width, height };
    const { radius, rotation } = value;
    if (kind === 'rectangle' && isFiniteNumber(radius) && radius > 0) {
      graphic.radius = radius;
    }
    if (isFiniteNumber(rotation) && normalizeDegrees(rotation) !== 0) {
      graphic.rotation = normalizeDegrees(rotation);
    }
  } else if (PATH_KINDS.has(kind)) {
    const points = parsePoints(value.points);
    const fewest = kind === 'polygon' ? 3 : 2;
    if (!points || points.length < fewest) return undefined;
    if (kind === 'line' && points.length !== 2) return undefined;
    graphic = {
      type: 'graphic',
      id,
      kind: kind as DrawPathGraphic['kind'],
      points,
    };
    if (kind !== 'line' && value.smooth === true) {
      graphic.smooth = true;
      const controls = parseControls(value.controls, points.length);
      if (controls) graphic.controls = controls;
    }
  } else {
    return undefined;
  }
  return withStyle(graphic, value);
}

function withStyle(
  graphic: DrawGraphic,
  value: Record<string, unknown>,
): DrawGraphic {
  const { lineWidth, dashed, fill, gradient, outline, color } = value;
  const style: GraphicStyle = {};
  if (isFiniteNumber(lineWidth) && lineWidth >= 0.1 && lineWidth <= 8) {
    style.lineWidth = lineWidth;
  }
  if (isLineDash(dashed) && dashed) style.dashed = dashed;
  if (isClosedGraphic(graphic) && isColor(fill)) {
    style.fill = fill;
    const blend = parseGradient(gradient);
    if (blend) style.gradient = blend;
    if (outline === false) style.outline = false;
  }
  if (isColor(color)) style.color = color;
  return { ...graphic, ...style };
}

// The hand-set control points of a curve: one entry per vertex, each null or
// a pair of points, and at least one pair.
function parseControls(
  value: unknown,
  count: number,
): Array<CurveControl | null> | undefined {
  if (!Array.isArray(value) || value.length !== count) return undefined;
  const controls: Array<CurveControl | null> = [];
  let set = false;
  for (const item of value) {
    if (item === null) {
      controls.push(null);
      continue;
    }
    if (!isRecord(item)) return undefined;
    const pair = parsePoints([item.before, item.after]);
    if (!pair) return undefined;
    controls.push({ before: pair[0] as Point, after: pair[1] as Point });
    set = true;
  }
  return set ? controls : undefined;
}

function parsePoints(value: unknown): Point[] | undefined {
  if (!Array.isArray(value) || value.length > MAX_POINTS) return undefined;
  const points: Point[] = [];
  for (const item of value) {
    if (!isRecord(item)) return undefined;
    const { x, y } = item;
    if (!isFiniteNumber(x) || !isFiniteNumber(y)) return undefined;
    points.push({ x, y });
  }
  return points;
}
