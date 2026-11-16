/**
 * What can be done to a line, a polygon, a curve, a rectangle or an ellipse:
 * give it an identifier, change it, move it, scale it, turn it. Every result
 * keeps its coordinates to a hundredth of a point.
 */

import type { CurveControl } from './curves.ts';
import { roundCoordinate } from './geometry.ts';
import { gradientAngle, movedGradientCentre } from './graphicGradients.ts';
import type {
  DrawBoxGraphic,
  DrawGraphic,
  DrawPathGraphic,
  GraphicPatch,
  NewGraphic,
} from './graphics.ts';
import { isBoxGraphic, isClosedGraphic, mapPath } from './graphics.ts';
import { normalizeDegrees } from './pictures.ts';
import type { Similarity } from './transform.ts';
import { pointMap } from './transform.ts';
import type { Point } from './types.ts';

/**
 * A graphic given its identifier, its coordinates kept to a hundredth of a
 * point: what a drawing adds.
 * @param graphic - The graphic.
 * @param id - Its identifier, unique in the drawing.
 * @returns The graphic.
 */
export function newGraphic(graphic: NewGraphic, id: string): DrawGraphic {
  return roundGraphic({ ...graphic, type: 'graphic', id });
}

/**
 * A graphic changed: its vertices, its corners or how it is drawn. A setting
 * patched to undefined is the drawing's again; a box keeps its kind and a
 * path takes no box; a fill, its gradient and a missing outline are kept only
 * on a filled closed graphic, and hand-set tangents only on a curve.
 * @param graphic - The graphic.
 * @param patch - What changes.
 * @returns The changed graphic.
 */
export function patchedGraphic(
  graphic: DrawGraphic,
  patch: GraphicPatch,
): DrawGraphic {
  const next = Object.fromEntries(
    Object.entries({ ...graphic, ...fitting(graphic, patch) }).filter(
      ([, value]) => value !== undefined,
    ),
  ) as unknown as DrawGraphic;
  if (!isClosedGraphic(next) || !next.fill) {
    if (!isClosedGraphic(next)) delete next.fill;
    delete next.gradient;
    delete next.outline;
  }
  if (!isBoxGraphic(next)) fitControls(next);
  return roundGraphic(next);
}

/**
 * A graphic moved.
 * @param graphic - The graphic.
 * @param delta - By how much, in points.
 * @returns The moved graphic.
 */
export function shiftGraphic(graphic: DrawGraphic, delta: Point): DrawGraphic {
  return mapGraphic(graphic, (point) => ({
    x: point.x + delta.x,
    y: point.y + delta.y,
  }));
}

/**
 * A graphic scaled about a centre, its outline keeping its width.
 * @param graphic - The graphic.
 * @param centre - The point that stays still.
 * @param factor - How much larger it becomes.
 * @returns The scaled graphic.
 */
export function scaleGraphic(
  graphic: DrawGraphic,
  centre: Point,
  factor: number,
): DrawGraphic {
  const scaled = mapGraphic(graphic, (point) => ({
    x: centre.x + (point.x - centre.x) * factor,
    y: centre.y + (point.y - centre.y) * factor,
  }));
  if (!isBoxGraphic(scaled)) return scaled;
  return roundGraphic({
    ...scaled,
    width: scaled.width * factor,
    height: scaled.height * factor,
    ...(scaled.radius ? { radius: scaled.radius * factor } : {}),
  });
}

/**
 * A graphic scaled and turned about a pivot: a path point by point, its
 * gradient turning with it, a box about its centre, turned as a whole.
 * @param graphic - The graphic.
 * @param transform - The scale and the turn.
 * @returns The transformed graphic.
 */
export function transformGraphic(
  graphic: DrawGraphic,
  transform: Similarity,
): DrawGraphic {
  const map = pointMap(transform);
  if (!isBoxGraphic(graphic)) {
    // A box's gradient turns with the box; a path's is set on the page.
    const { gradient } = graphic;
    const path = mapPath(graphic, map);
    if (!gradient || !transform.rotation) return path;
    if (gradient.kind === 'radial') {
      const { centre: _centre, ...rest } = gradient;
      const centre = movedGradientCentre(graphic, path, map);
      return { ...path, gradient: centre ? { ...rest, centre } : rest };
    }
    const angle = gradientAngle((gradient.angle ?? 0) + transform.rotation);
    const { angle: _angle, ...rest } = gradient;
    return { ...path, gradient: angle === 0 ? rest : { ...rest, angle } };
  }
  const { scale, rotation } = transform;
  const { rotation: turn, radius, ...rest } = graphic;
  const width = graphic.width * scale;
  const height = graphic.height * scale;
  const centre = map({
    x: graphic.x + graphic.width / 2,
    y: graphic.y + graphic.height / 2,
  });
  const nextTurn = normalizeDegrees((turn ?? 0) + rotation);
  return {
    ...rest,
    x: roundCoordinate(centre.x - width / 2),
    y: roundCoordinate(centre.y - height / 2),
    width: roundCoordinate(width),
    height: roundCoordinate(height),
    ...(radius ? { radius: roundCoordinate(radius * scale) } : {}),
    ...(nextTurn === 0 ? {} : { rotation: nextTurn }),
  };
}

// The part of a patch a graphic can take: a box keeps its kind.
function fitting(graphic: DrawGraphic, patch: GraphicPatch): GraphicPatch {
  if (isBoxGraphic(graphic)) {
    const {
      kind: _kind,
      points: _points,
      smooth: _smooth,
      controls: _controls,
      ...rest
    } = patch;
    return rest;
  }
  const {
    radius: _radius,
    x: _x,
    y: _y,
    width: _width,
    height: _height,
    rotation: _rotation,
    ...rest
  } = patch;
  return rest;
}

// A graphic whose position is moved point by point, then rounded.
function mapGraphic(
  graphic: DrawGraphic,
  move: (point: Point) => Point,
): DrawGraphic {
  if (isBoxGraphic(graphic)) {
    return roundGraphic({ ...graphic, ...move(graphic) });
  }
  return roundGraphic(mapPath(graphic, move));
}

function roundGraphic(graphic: DrawGraphic): DrawGraphic {
  if (isBoxGraphic(graphic)) {
    const rounded: DrawBoxGraphic = {
      ...graphic,
      x: roundCoordinate(graphic.x),
      y: roundCoordinate(graphic.y),
      width: roundCoordinate(graphic.width),
      height: roundCoordinate(graphic.height),
    };
    if (graphic.radius) rounded.radius = roundCoordinate(graphic.radius);
    const turn = normalizeDegrees(graphic.rotation ?? 0);
    if (turn === 0) delete rounded.rotation;
    else rounded.rotation = turn;
    return rounded;
  }
  return mapPath(graphic, (point) => ({
    x: roundCoordinate(point.x),
    y: roundCoordinate(point.y),
  }));
}

// Keep a path's hand-set control points only where they still apply: on a
// curve, one per vertex, and not all of them null.
function fitControls(path: DrawPathGraphic): void {
  // Two ends make a straight line however it is drawn.
  if (path.kind === 'line') delete path.smooth;
  const { controls, points, smooth } = path;
  if (!controls) return;
  const fitted: Array<CurveControl | null> = [];
  for (let index = 0; index < points.length; index++) {
    fitted.push(controls[index] ?? null);
  }
  if (smooth && fitted.some(Boolean)) path.controls = fitted;
  else delete path.controls;
}
