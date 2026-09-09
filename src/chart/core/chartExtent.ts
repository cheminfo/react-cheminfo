import type { MatrixLike } from './matrix.ts';

/** The two ends of a range. */
export interface ChartExtent {
  /** The smallest value. */
  min: number;
  /** The largest. */
  max: number;
}

/** How far into a run of numbers to read, and what to widen. */
export interface ChartValuesExtentOptions {
  /**
   * How many values to read, for a series longer than the slots it is drawn
   * in.
   * @default every value
   */
  limit?: number;
  /**
   * A range to widen rather than start afresh, so several runs can be covered
   * without an array of ranges being built to merge.
   * @default undefined — the range starts empty
   */
  into?: ChartExtent;
}

/** How a column's range is read and widened. */
export interface ChartColumnExtentOptions {
  /**
   * Share of the span added at each end, so points do not touch the frame.
   * @default 0.05
   */
  padding?: number;
  /**
   * Whether to stretch the range to include zero, which a bar chart must and a
   * scatter need not.
   * @default false
   */
  includeZero?: boolean;
  /**
   * Whether to make the range symmetric about zero, so the origin sits in the
   * middle — what a scores or a loadings axis usually wants.
   * @default false
   */
  symmetric?: boolean;
  /**
   * Which rows to read, for a range over one group only.
   * @default undefined — every row is read
   */
  indices?: ArrayLike<number>;
}

/**
 * The range of one column of a matrix.
 *
 * The matrix is read in place through `get`: no column is copied out, and a
 * value that is not finite is skipped rather than poisoning the range with a
 * `NaN`.
 *
 * The padding goes on before the stretch to zero, so a bar chart's baseline
 * lands on zero exactly rather than a twentieth of a span below it, where the
 * bars would float clear of the line they are measured from.
 * @param matrix - The matrix to read.
 * @param column - Which column.
 * @param options - See {@link ChartColumnExtentOptions}.
 * @returns The range, widened as asked. A column with no finite value at all gives `{ min: 0, max: 1 }`, which draws an honest empty axis.
 */
export function chartColumnExtent(
  matrix: MatrixLike,
  column: number,
  options: ChartColumnExtentOptions = {},
): ChartExtent {
  const {
    padding = DEFAULT_PADDING,
    includeZero = false,
    symmetric = false,
    indices,
  } = options;

  const seen = readColumn(matrix, column, indices);
  if (seen === null) return { min: 0, max: 1 };

  const padded = chartPadExtent(seen, padding);
  const grounded = includeZero
    ? { min: Math.min(padded.min, 0), max: Math.max(padded.max, 0) }
    : padded;
  if (!symmetric) return grounded;

  const reach = Math.max(Math.abs(grounded.min), Math.abs(grounded.max));
  return { min: -reach, max: reach };
}

/**
 * A range widened by a share of its span.
 * @param extent - The range.
 * @param padding - Share added at each end. Defaults to `0.05`.
 * @returns The widened range, its two ends in order. A zero-width one is opened by 5% of its own value, or to -1..1 when that value is zero, because an axis whose ends are the same number has nowhere to put a tick.
 */
export function chartPadExtent(
  extent: ChartExtent,
  padding: number = DEFAULT_PADDING,
): ChartExtent {
  const { min, max } = extent;
  if (!Number.isFinite(min) || !Number.isFinite(max)) return { min: 0, max: 1 };

  const low = Math.min(min, max);
  const high = Math.max(min, max);
  const span = high - low;
  if (span === 0) {
    const opening = low === 0 ? 1 : Math.abs(low) * DEFAULT_PADDING;
    return { min: low - opening, max: high + opening };
  }

  const share = Number.isFinite(padding) && padding > 0 ? padding : 0;
  const room = span * share;
  return { min: low - room, max: high + room };
}

/**
 * The range covering several — the shared scale a row or a column of a pair
 * grid draws against.
 * @param extents - The ranges to cover.
 * @returns The covering range, or `{ min: 0, max: 1 }` when none was given.
 */
export function chartMergeExtents(
  extents: readonly ChartExtent[],
): ChartExtent {
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  for (const extent of extents) {
    if (Number.isFinite(extent.min) && extent.min < min) min = extent.min;
    if (Number.isFinite(extent.max) && extent.max > max) max = extent.max;
  }
  if (min > max) return { min: 0, max: 1 };
  return { min, max };
}

/**
 * A range covering nothing, which every scan starts from.
 *
 * `min` above `max` is what says it is empty, and it is deliberate: a range
 * that started at zero would report a run of nothing as a run of zeroes, and
 * an axis would be drawn around a value the data never held.
 */
export const EMPTY_EXTENT: ChartExtent = {
  min: Number.POSITIVE_INFINITY,
  max: Number.NEGATIVE_INFINITY,
};

/**
 * The range of a run of numbers, skipping anything that is not finite.
 *
 * The one scan every chart starts from, and the reason it is here rather than
 * written out per chart: a copy that forgets the finiteness guard poisons a
 * whole axis with one `NaN`, and a copy that forgets `limit` reads a series
 * past the slots it is drawn in.
 *
 * `ml-spectra-processing`'s `xMinMaxValues` answers the same question, but
 * this package draws in a browser and does not depend on it; a shared six-line
 * scan is cheaper than the package for the one thing needed from it.
 * @param values - The numbers to read, in place — nothing is copied.
 * @param options - See {@link ChartValuesExtentOptions}.
 * @returns The range. A run with no finite value at all gives an empty range —
 * `min` above `max` — which `chartPadExtent` and the callers here read as
 * nothing to draw rather than as a range around zero.
 */
export function chartValuesExtent(
  values: ArrayLike<number>,
  options: ChartValuesExtentOptions = {},
): ChartExtent {
  const { limit = values.length, into = EMPTY_EXTENT } = options;
  let { min, max } = into;
  const count = Math.min(limit, values.length);
  for (let index = 0; index < count; index++) {
    const value = values[index];
    if (value === undefined || !Number.isFinite(value)) continue;
    if (value < min) min = value;
    if (value > max) max = value;
  }
  return { min, max };
}

const DEFAULT_PADDING = 0.05;

function readColumn(
  matrix: MatrixLike,
  column: number,
  indices: ArrayLike<number> | undefined,
): ChartExtent | null {
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  const count = indices === undefined ? matrix.rows : indices.length;
  for (let step = 0; step < count; step++) {
    const row = indices === undefined ? step : indices[step];
    if (row === undefined) continue;
    const value = matrix.get(row, column);
    if (!Number.isFinite(value)) continue;
    if (value < min) min = value;
    if (value > max) max = value;
  }
  if (min > max) return null;
  return { min, max };
}
