/**
 * A scale and a turn about a pivot, as the handles of a selection frame make
 * them.
 */

import type { DrawText } from './captions.ts';
import { clampCaptionSize } from './captions.ts';
import type { CurveControl } from './curves.ts';
import { roundCoordinate } from './geometry.ts';
import type { DrawPicture } from './pictures.ts';
import { normalizeDegrees, normalizePicture } from './pictures.ts';
import type { Point } from './types.ts';
import { turnAbout } from './vectors.ts';

/** A scale and a turn about a point. */
export interface Similarity {
  /** The point that stays where it is. */
  pivot: Point;
  /** How much larger everything becomes. */
  scale: number;
  /** How far everything turns, clockwise, in degrees. */
  rotation: number;
}

/**
 * Where a transform takes a point, rounded as coordinates are.
 * @param transform - The scale and the turn.
 * @returns The map.
 */
export function pointMap(transform: Similarity): (point: Point) => Point {
  const turn = turnAbout(transform.pivot, transform.rotation, transform.scale);
  return (point) => {
    const { x, y } = turn(point);
    return { x: roundCoordinate(x), y: roundCoordinate(y) };
  };
}

/**
 * A curve — a shape's path, a membrane, a strand — whose points and hand-set
 * controls a map takes elsewhere.
 * @param curve - The curve.
 * @param map - Where each point goes.
 * @returns The curve, moved.
 */
export function mapCurve<
  T extends {
    points: readonly Point[];
    controls?: ReadonlyArray<CurveControl | null>;
  },
>(curve: T, map: (point: Point) => Point): T {
  const moved = { ...curve, points: curve.points.map(map) };
  if (curve.controls) {
    moved.controls = curve.controls.map((control) =>
      control
        ? { before: map(control.before), after: map(control.after) }
        : null,
    );
  }
  return moved;
}

/**
 * A caption scaled and turned with a selection: its anchor follows, its size
 * scales within the bounds a caption keeps, and its turn adds up.
 * @param text - The caption.
 * @param transform - The scale and the turn.
 * @param defaultSize - The size a caption without its own is drawn at.
 * @returns The caption, transformed.
 */
export function transformCaption<T extends DrawText>(
  text: T,
  transform: Similarity,
  defaultSize: number,
): T {
  const { rotation: turn, ...rest } = text;
  const moved = { ...rest, ...pointMap(transform)(text) } as T;
  if (transform.scale !== 1) {
    moved.size = clampCaptionSize(
      roundCoordinate((text.size ?? defaultSize) * transform.scale),
    );
  }
  const nextTurn = normalizeDegrees((turn ?? 0) + transform.rotation);
  if (nextTurn !== 0) moved.rotation = nextTurn;
  return moved;
}

/**
 * A picture scaled and turned with a selection, about its centre.
 * @param picture - The picture.
 * @param transform - The scale and the turn.
 * @returns The picture, transformed and normalized.
 */
export function transformPicture<T extends DrawPicture>(
  picture: T,
  transform: Similarity,
): T {
  const width = picture.width * transform.scale;
  const height = picture.height * transform.scale;
  const centre = pointMap(transform)({
    x: picture.x + picture.width / 2,
    y: picture.y + picture.height / 2,
  });
  return normalizePicture({
    ...picture,
    x: centre.x - width / 2,
    y: centre.y - height / 2,
    width,
    height,
    rotation: (picture.rotation ?? 0) + transform.rotation,
  }) as T;
}
