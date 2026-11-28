/**
 * Outlines mirrored and walked backwards, and a whole outline made of a half
 * and its mirror image, as a lathe turns a piece of glass.
 */

import type { Point } from '../core/types.ts';

import type { Contour, Segment } from './contour.ts';
import { isCubic } from './contour.ts';
import { mapContour } from './outlines.ts';
import { Pen } from './pen.ts';

/**
 * An outline mirrored across the vertical axis.
 * @param contour - The outline.
 * @returns Its mirror image.
 */
export function mirrorContour(contour: Contour): Contour {
  return mapContour(contour, (point) => ({ x: -point.x, y: point.y }));
}

/**
 * An open outline walked the other way.
 * @param contour - The outline.
 * @returns The same outline, from its end to its start.
 */
export function reverseContour(contour: Contour): Contour {
  const { start, segments, closed } = contour;
  const points: Point[] = [start];
  for (const segment of segments) points.push(segment.to);
  const walked: Segment[] = [];
  for (let index = segments.length - 1; index >= 0; index--) {
    const segment = segments[index] as Segment;
    const to = points[index] as Point;
    walked.push(
      isCubic(segment) ? { c1: segment.c2, c2: segment.c1, to } : { to },
    );
  }
  return {
    start: points.at(-1) as Point,
    segments: walked,
    closed,
  };
}

/**
 * A closed outline made of a right half and its mirror image: the half runs
 * from the top of the axis, down the right side, to the bottom of the axis.
 * @param half - The right half, open.
 * @returns The whole outline, closed.
 */
export function lathe(half: Contour): Contour {
  const pen = new Pen(half.start.x, half.start.y).follow(half);
  return pen.follow(reverseContour(mirrorContour(half))).close();
}

/**
 * A closed outline made of a right-hand side that leaves the axis along a
 * horizontal, and its mirror image: what a vessel holds, from its top down.
 * @param side - The right-hand side, open, from the top of its wall down to
 * the bottom of the axis.
 * @returns The whole outline, closed.
 */
export function latheSide(side: Contour): Contour {
  return lathe(new Pen(0, side.start.y).follow(side).open());
}
