/**
 * Which rows the brushes keep.
 *
 * Exported rather than kept inside the figure, because a table beside the
 * figure has to filter on the same answer. Two definitions of "kept" is the
 * fault this file exists to prevent: a table showing fourteen rows under a
 * plot drawing one is not a rounding error, it is two different programs.
 */

import type {
  ParallelAxis,
  ParallelRange,
  ParallelRanges,
} from './parallelTypes.ts';

/** One axis's interval, ready to be tested row by row. */
interface ActiveRange {
  /** The column being tested. */
  values: ArrayLike<number>;
  /** The lowest value kept. */
  minimum: number;
  /** The highest value kept. */
  maximum: number;
}

/**
 * Whether one value falls inside an interval.
 * @param range - The interval, low value first.
 * @param value - The value to test.
 * @returns Whether it is kept. Both ends are inclusive, and a value that is
 * not a number is kept by no interval at all — a row whose property has not
 * been worked out yet cannot be said to be in range.
 */
export function parallelRangeKeeps(
  range: ParallelRange,
  value: number,
): boolean {
  return value >= range[0] && value <= range[1];
}

/**
 * Which rows every brush keeps at once.
 * @param axes - The axes, whose ids the intervals are keyed by.
 * @param ranges - The interval each axis keeps, or `null` for none.
 * @param count - How many rows there are.
 * @returns One byte per row, `1` for kept. An interval keyed on an axis that
 * is not drawn is ignored rather than emptying the figure, so a range left
 * over from a column the reader has since hidden does not silently filter
 * everything away.
 */
export function parallelIncludedMask(
  axes: readonly ParallelAxis[],
  ranges: ParallelRanges,
  count: number,
): Uint8Array {
  const included = new Uint8Array(count).fill(1);
  const active: ActiveRange[] = [];
  for (const axis of axes) {
    const range = ranges[axis.id];
    if (range === null || range === undefined) continue;
    active.push({
      values: axis.values,
      minimum: Math.min(range[0], range[1]),
      maximum: Math.max(range[0], range[1]),
    });
  }
  if (active.length === 0) return included;

  for (const range of active) {
    const rows = Math.min(count, range.values.length);
    for (let row = 0; row < rows; row++) {
      if (included[row] === 0) continue;
      const value = range.values[row] as number;
      if (value >= range.minimum && value <= range.maximum) continue;
      included[row] = 0;
    }
    // A row the figure has no value for on a brushed axis is not in range.
    for (let row = rows; row < count; row++) included[row] = 0;
  }
  return included;
}

/**
 * How many rows a mask keeps.
 * @param included - One byte per row, `1` for kept.
 * @returns The count.
 */
export function parallelKeptCount(included: Uint8Array): number {
  let kept = 0;
  for (const row of included) {
    if (row !== 0) kept++;
  }
  return kept;
}
