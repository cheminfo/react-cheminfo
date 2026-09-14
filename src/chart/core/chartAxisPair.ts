import { clamp } from '../../format/core/clamp.ts';

/** The two axes a flat figure is drawn against, counting from zero. */
interface ChartAxisPair {
  /** The axis along x. */
  x: number;
  /** The axis along y. */
  y: number;
}

/**
 * An axis index brought inside the axes that exist.
 *
 * A fraction is floored and anything that is not a number lands on the first
 * axis, so a saved index resolves to the same axis in every figure that reads
 * it.
 * @param index - The axis asked for.
 * @param last - The highest axis there is.
 * @returns A whole number between zero and `last`.
 */
export function clampAxisIndex(index: number, last: number): number {
  return Math.floor(clamp(index, 0, last));
}

/**
 * A pair of axes made safe against the axes that were actually computed.
 *
 * A saved pair outlives the data it was made on: reload with fewer columns and
 * axis eight no longer exists. Both axes are pulled back inside what exists,
 * and kept apart, because one axis drawn against itself is a diagonal line
 * that says nothing at all.
 * @param x - The axis asked for along x.
 * @param y - The axis asked for along y.
 * @param count - How many axes there are.
 * @returns Two axes that exist, and differ whenever there are two to pick from.
 */
export function clampAxisPair(
  x: number,
  y: number,
  count: number,
): ChartAxisPair {
  const last = Math.max(0, count - 1);
  const along = clampAxisIndex(x, last);
  const up = clampAxisIndex(y, last);
  if (up !== along) return { x: along, y: up };
  return { x: along, y: along > 0 ? along - 1 : Math.min(1, last) };
}
