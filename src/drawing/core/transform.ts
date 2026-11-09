/**
 * A scale and a turn about a pivot, as the handles of a selection frame make
 * them.
 */

import { roundCoordinate } from './geometry.ts';
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
