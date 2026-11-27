/**
 * The two ends of one axis, read off its own column.
 *
 * Deliberately not `chartPadExtent`: a parallel-coordinates axis ends exactly
 * on the data, because the reader compares rows against each other rather than
 * against a round number, and the best row has to touch the top of its axis.
 * The only opening is for a column with no spread at all, which would
 * otherwise draw no axis and place every row on one pixel.
 */

import { chartValuesExtent } from '../../chart/core/chartExtent.ts';

/** How far a column with no spread at all is opened, on each side. */
const PARALLEL_DEGENERATE_PADDING = 0.5;

/** The two ends of an axis, low first. */
interface ParallelExtent {
  /** The value at the bottom of the axis. */
  min: number;
  /** The value at its top. */
  max: number;
}

/**
 * The smallest and the largest finite value of one column.
 * @param values - The column, read in place.
 * @param count - How many rows to read, from the start.
 * @returns The extent. A column holding no finite value at all comes back as
 * half a unit either side of zero, and a constant one as half a unit either
 * side of its value, so that both still draw an axis.
 */
export function parallelExtent(
  values: ArrayLike<number>,
  count: number,
): ParallelExtent {
  const { min, max } = chartValuesExtent(values, { limit: count });
  if (min > max) {
    return {
      min: -PARALLEL_DEGENERATE_PADDING,
      max: PARALLEL_DEGENERATE_PADDING,
    };
  }
  if (min === max) {
    return {
      min: min - PARALLEL_DEGENERATE_PADDING,
      max: max + PARALLEL_DEGENERATE_PADDING,
    };
  }
  return { min, max };
}
