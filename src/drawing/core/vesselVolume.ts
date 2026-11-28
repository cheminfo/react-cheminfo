/**
 * The liquid a vessel holds, every vessel taken as a solid of revolution about
 * its vertical axis: its outline sliced into discs, in millimetres with y
 * pointing down, a volume in millilitres.
 */

import { boundsOf } from './geometry.ts';
import type { Point } from './types.ts';

/** How many discs a vessel is sliced into, unless a caller asks for more. */
const SLICES = 400;

/**
 * The half-width of a polygon at a height: half the span its edges cross
 * there.
 * @param polygon - The outline, closed.
 * @param y - The height.
 * @returns The half-width; 0 where the outline does not reach.
 */
export function halfWidthAt(polygon: readonly Point[], y: number): number {
  let left = Infinity;
  let right = -Infinity;
  for (let index = 0; index < polygon.length; index++) {
    const a = polygon[index] as Point;
    const b = polygon[(index + 1) % polygon.length] as Point;
    if (a.y === b.y || (a.y - y) * (b.y - y) > 0) continue;
    const x = a.x + ((b.x - a.x) * (y - a.y)) / (b.y - a.y);
    if (x < left) left = x;
    if (x > right) right = x;
  }
  return right > left ? (right - left) / 2 : 0;
}

/**
 * The height a volume of liquid stands at in a vessel, filled from its
 * lowest point.
 * @param polygon - The space the liquid stands in, closed, mm.
 * @param volume - The volume, mL; a negative one reads as none.
 * @param slices - How many discs the vessel is sliced into.
 * @default slices 400
 * @returns The level, as a y coordinate; undefined when it does not hold that much.
 */
export function levelForVolume(
  polygon: readonly Point[],
  volume: number,
  slices = SLICES,
): number | undefined {
  const { bottom, step } = slicing(polygon, slices);
  const wanted = Math.max(0, volume) * 1000;
  if (wanted === 0) return bottom;
  let held = 0;
  for (let index = 0; index < slices; index++) {
    const slice = sliceVolume(polygon, bottom, step, index);
    if (held + slice >= wanted) {
      return bottom - (index + (wanted - held) / slice) * step;
    }
    held += slice;
  }
  return undefined;
}

/**
 * What a vessel holds below a level.
 * @param polygon - The space the liquid stands in, closed, mm.
 * @param level - The level, as a y coordinate.
 * @param slices - How many discs the vessel is sliced into.
 * @default slices 400
 * @returns The volume, mL.
 */
export function volumeBelow(
  polygon: readonly Point[],
  level: number,
  slices = SLICES,
): number {
  const { bottom, step } = slicing(polygon, slices);
  let held = 0;
  for (let index = 0; index < slices; index++) {
    const share = (bottom - index * step - level) / step;
    if (share <= 0) break;
    held += sliceVolume(polygon, bottom, step, index) * Math.min(share, 1);
  }
  return held / 1000;
}

/**
 * What a vessel holds when full.
 * @param polygon - The space, closed, mm.
 * @param slices - How many discs the vessel is sliced into.
 * @default slices 400
 * @returns The volume, mL.
 */
export function heldVolume(polygon: readonly Point[], slices = SLICES): number {
  const { bottom, step } = slicing(polygon, slices);
  let held = 0;
  for (let index = 0; index < slices; index++) {
    held += sliceVolume(polygon, bottom, step, index);
  }
  return held / 1000;
}

function slicing(polygon: readonly Point[], slices: number) {
  const { y: top, height } = boundsOf(polygon);
  return { bottom: top + height, step: height / slices };
}

// The volume of one slice, in mm³, taken as a disc.
function sliceVolume(
  polygon: readonly Point[],
  bottom: number,
  step: number,
  index: number,
): number {
  const radius = halfWidthAt(polygon, bottom - (index + 0.5) * step);
  return Math.PI * radius * radius * step;
}
