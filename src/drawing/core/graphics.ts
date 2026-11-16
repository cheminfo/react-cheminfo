/**
 * The figures a scheme draws around its structures — a line, a polyline, a
 * polygon, a curve, a rectangle, an ellipse — which ChemDraw calls graphics.
 * Like the rest of the drawing they are plain JSON, in points with y pointing
 * down, and they are drawn under the structures, so a filled box highlights a
 * molecule rather than hiding it.
 */

import type { CurveControl } from './curves.ts';
import { curveOutline } from './curves.ts';
import type { LineDash } from './dashes.ts';
import { boxCorners } from './geometry.ts';
import type { GraphicGradient } from './graphicGradients.ts';
import { mapCurve } from './transform.ts';
import type { Box, Point } from './types.ts';
import { turnAbout } from './vectors.ts';

/** How a graphic is drawn, each setting falling back on the drawing's. */
export interface GraphicStyle {
  /**
   * The width of its outline, in points.
   * @default the drawing's line width
   */
  lineWidth?: number;
  /**
   * Whether and how its outline is dashed: plain dashes, or a named pattern.
   * @default false
   */
  dashed?: LineDash;
  /**
   * What fills a closed graphic, `#rrggbb` or `#rrggbbaa`.
   * @default undefined — not filled
   */
  fill?: string;
  /**
   * How the fill blends into a second colour; only a filled graphic has one.
   * @default undefined — one flat colour
   */
  gradient?: GraphicGradient;
  /**
   * Whether its outline is drawn; only a filled graphic goes without one.
   * @default true
   */
  outline?: boolean;
  /**
   * The ink of its outline, `#rrggbb` or `#rrggbbaa`.
   * @default the drawing's ink
   */
  color?: string;
}

/** A graphic drawn through its vertices: a line, a polyline, a polygon. */
export interface DrawPathGraphic extends GraphicStyle {
  /** What the object is. */
  type: 'graphic';
  /** Identifier, unique in the document. */
  id: string;
  /** What it is. */
  kind: 'line' | 'polyline' | 'polygon';
  /**
   * Its vertices in order: the two ends of a line, two or more for a
   * polyline, three or more for a polygon, whose last joins its first.
   */
  points: Point[];
  /**
   * Whether a polyline or a polygon is drawn as one smooth curve through its
   * vertices, in cubic Bézier pieces, rather than in straight sides.
   * @default false
   */
  smooth?: boolean;
  /**
   * The control points of a curve set by hand, one entry per vertex, null
   * where the curve sets its own tangent; in points, like the vertices.
   * @default undefined — the curve sets every tangent itself
   */
  controls?: Array<CurveControl | null>;
}

/** A graphic drawn in a box: a rectangle, an ellipse. */
export interface DrawBoxGraphic extends GraphicStyle, Box {
  /** What the object is. */
  type: 'graphic';
  /** Identifier, unique in the document. */
  id: string;
  /** What it is. */
  kind: 'rectangle' | 'ellipse';
  /**
   * The radius of a rectangle's corners, in points.
   * @default 0
   */
  radius?: number;
  /**
   * How far it is turned about the middle of its box, clockwise, in degrees.
   * @default 0
   */
  rotation?: number;
}

/** A line, a polyline, a polygon, a rectangle or an ellipse. */
export type DrawGraphic = DrawPathGraphic | DrawBoxGraphic;

/** A graphic before it is given an identifier. */
export type NewGraphic =
  Omit<DrawPathGraphic, 'type' | 'id'> | Omit<DrawBoxGraphic, 'type' | 'id'>;

/**
 * What a patch may change on a graphic; undefined gives a setting back. A
 * path may become another path — a polyline closed into a polygon — but never
 * a box, and only a box takes a box, corners and a turn.
 */
export type GraphicPatch = Partial<
  GraphicStyle &
    Pick<
      DrawBoxGraphic,
      'radius' | 'x' | 'y' | 'width' | 'height' | 'rotation'
    > &
    Pick<DrawPathGraphic, 'kind' | 'points' | 'smooth' | 'controls'>
>;

/**
 * Whether a graphic is drawn in a box: a rectangle or an ellipse.
 * @param graphic - The graphic.
 * @returns True for a rectangle and an ellipse.
 */
export function isBoxGraphic(graphic: DrawGraphic): graphic is DrawBoxGraphic {
  return graphic.kind === 'rectangle' || graphic.kind === 'ellipse';
}

/**
 * Whether a graphic is closed: it can be filled.
 * @param graphic - The graphic.
 * @returns True for a polygon, a rectangle and an ellipse.
 */
export function isClosedGraphic(graphic: Pick<DrawGraphic, 'kind'>): boolean {
  return graphic.kind !== 'line' && graphic.kind !== 'polyline';
}

/**
 * The points a box or a loop must hold for a graphic to be inside it: the
 * vertices of a path, points along a curve, the corners of a rectangle,
 * turned with it, and the middles of the sides of the upright box an ellipse
 * fits in.
 * @param graphic - The graphic.
 * @returns The points, in points.
 */
export function graphicCorners(graphic: DrawGraphic): Point[] {
  if (!isBoxGraphic(graphic)) {
    return graphic.smooth
      ? curveOutline(
          graphic.points,
          graphic.kind === 'polygon',
          graphic.controls,
        )
      : graphic.points;
  }
  const { kind, x, y, width, height, rotation } = graphic;
  if (kind === 'rectangle') return boxCorners(graphic).map(boxTurn(graphic));
  if (!rotation) {
    return [
      { x: x + width / 2, y },
      { x: x + width, y: y + height / 2 },
      { x: x + width / 2, y: y + height },
      { x, y: y + height / 2 },
    ];
  }
  // A turned ellipse reaches past the ends of its axes: these are the middles
  // of the sides of the upright box it fits in.
  const angle = (rotation * Math.PI) / 180;
  const rx = width / 2;
  const ry = height / 2;
  const reachX = Math.hypot(rx * Math.cos(angle), ry * Math.sin(angle));
  const reachY = Math.hypot(rx * Math.sin(angle), ry * Math.cos(angle));
  const cx = x + rx;
  const cy = y + ry;
  return [
    { x: cx, y: cy - reachY },
    { x: cx + reachX, y: cy },
    { x: cx, y: cy + reachY },
    { x: cx - reachX, y: cy },
  ];
}

/**
 * Where a point of a box graphic, unturned, goes once the box is turned about
 * its middle.
 * @param graphic - The graphic.
 * @returns The map; the identity for a box that is not turned.
 */
export function boxTurn(graphic: DrawBoxGraphic): (point: Point) => Point {
  const { x, y, width, height, rotation = 0 } = graphic;
  return turnAbout({ x: x + width / 2, y: y + height / 2 }, rotation);
}

/**
 * A path with every point it is drawn through moved: its vertices, and the
 * control points of a curve, which go where the vertices go.
 * @param graphic - The path.
 * @param map - Where a point goes.
 * @returns The moved path.
 */
export function mapPath(
  graphic: DrawPathGraphic,
  map: (point: Point) => Point,
): DrawPathGraphic {
  return mapCurve(graphic, map);
}
