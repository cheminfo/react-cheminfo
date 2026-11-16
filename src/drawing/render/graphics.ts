/**
 * The stroke of a line, a polyline, a polygon, a curve, a rectangle or an
 * ellipse, as one path in the width, the dashes and the fill the graphic asks
 * for.
 */

import { curvePieces } from '../core/curves.ts';
import type { DrawGraphic, DrawPathGraphic } from '../core/graphics.ts';
import {
  boxTurn,
  graphicCorners,
  isBoxGraphic,
  isClosedGraphic,
} from '../core/graphics.ts';

import { Pen } from './contour.ts';
import { strokeDash, withDash } from './dashes.ts';
import { gradientPaint } from './graphicPaint.ts';
import { ellipsePath, pathData } from './markup.ts';
import { mapContour, polygonContour, roundedRect } from './outlines.ts';
import type { PathPrimitive } from './primitives.ts';

/**
 * The path a graphic is drawn as.
 * @param graphic - The graphic.
 * @param style - The drawing style, for the width of an outline that sets
 * none of its own.
 * @param style.lineWidth - The drawing's line width, in points.
 * @returns The primitive.
 */
export function graphicPrimitive(
  graphic: DrawGraphic,
  style: { lineWidth: number },
): PathPrimitive {
  const width = graphic.lineWidth ?? style.lineWidth;
  const primitive: PathPrimitive = {
    kind: 'path',
    d: graphicPath(graphic),
    width,
    extent: graphicCorners(graphic),
  };
  withDash(primitive, strokeDash(graphic.dashed, width));
  if (graphic.fill && isClosedGraphic(graphic)) {
    primitive.fill = graphic.fill;
    const gradient = gradientPaint(graphic);
    if (gradient) primitive.gradient = gradient;
    if (graphic.outline === false) primitive.outline = false;
  }
  return primitive;
}

/**
 * The SVG path data of a graphic, in points.
 * @param graphic - The graphic.
 * @returns The path data.
 */
export function graphicPath(graphic: DrawGraphic): string {
  if (!isBoxGraphic(graphic)) return pointsPath(graphic);
  const { kind, x, y, width, height, radius = 0, rotation } = graphic;
  const turn = boxTurn(graphic);
  if (kind === 'rectangle') {
    const r = Math.min(radius, width / 2, height / 2);
    if (r <= 0) return pathData(polygonContour(graphicCorners(graphic)));
    return pathData(mapContour(roundedRect(x, y, width, height, r), turn));
  }
  const left = turn({ x, y: y + height / 2 });
  const right = turn({ x: x + width, y: y + height / 2 });
  return ellipsePath(left, right, width / 2, height / 2, rotation);
}

function pointsPath(graphic: DrawPathGraphic): string {
  const [first, ...rest] = graphic.points;
  if (!first) return '';
  const closed = graphic.kind === 'polygon';
  const pen = new Pen(first.x, first.y);
  if (graphic.smooth && rest.length > 1) {
    for (const piece of curvePieces(graphic.points, closed, graphic.controls)) {
      const { control1, control2, to } = piece;
      pen.curve(control1.x, control1.y, control2.x, control2.y, to.x, to.y);
    }
  } else {
    for (const point of rest) pen.line(point.x, point.y);
  }
  return pathData(closed ? pen.close() : pen.open());
}
