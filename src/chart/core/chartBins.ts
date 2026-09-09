import type { ChartExtent } from './chartExtent.ts';
import type { MatrixLike } from './matrix.ts';

/** Counts over one shared set of bin edges, optionally split by series. */
export interface ChartBins {
  /** `bins + 1` edges, ascending. */
  edges: Float64Array;
  /** `series * bins` counts, laid out one series after another. */
  counts: Uint32Array;
  /** How many series the counts hold; `1` when nothing was split. */
  series: number;
  /** How many bins each series has. */
  bins: number;
  /** The largest count in any one bin of any one series, for scaling the draw. */
  peak: number;
}

/**
 * How one column is spread, split by group over one shared set of edges.
 *
 * `xHistogram` from `ml-spectra-processing` is the published helper for a
 * single series, but it accumulates every value into one series and takes a
 * flat array where we hold a matrix column; hence this one, which reads the
 * matrix in place in a single pass.
 * @param matrix - The matrix to read.
 * @param column - Which column to bin.
 * @param range - The edges' two ends, normally the column's shared axis domain.
 * @param bins - How many bins to cut it into, at least one.
 * @param groups - One group index per row, or `null` for a single series.
 * @param series - How many groups there are; ignored when `groups` is `null`.
 * @returns The counts. A row whose value is not finite, is outside `range`, or carries a group outside `0..series - 1` is left out rather than clamped into an end bin, because a clamped outlier reads as a real peak at the edge.
 */
export function chartBinCounts(
  matrix: MatrixLike,
  column: number,
  range: ChartExtent,
  bins: number,
  groups: ArrayLike<number> | null,
  series: number,
): ChartBins {
  const binCount = wholeAtLeastOne(bins);
  const seriesCount = groups === null ? 1 : wholeAtLeastOne(series);
  const min = Number.isFinite(range.min) ? range.min : 0;
  const max =
    Number.isFinite(range.max) && range.max > min ? range.max : min + 1;
  const span = max - min;

  const edges = new Float64Array(binCount + 1);
  for (let index = 0; index < binCount; index++) {
    edges[index] = min + (span * index) / binCount;
  }
  edges[binCount] = max;

  const counts = new Uint32Array(seriesCount * binCount);
  for (let row = 0; row < matrix.rows; row++) {
    const value = matrix.get(row, column);
    if (!Number.isFinite(value) || value < min || value > max) continue;

    const group = groupOf(groups, row, seriesCount);
    if (group < 0) continue;

    // The value that is exactly `max` sits on the closing edge, which belongs
    // to the last bin rather than to a bin past the end of the axis.
    const bin = Math.min(
      binCount - 1,
      Math.floor(((value - min) / span) * binCount),
    );
    const slot = group * binCount + bin;
    counts[slot] = (counts[slot] ?? 0) + 1;
  }

  let peak = 0;
  for (const count of counts) {
    if (count > peak) peak = count;
  }

  return { edges, counts, series: seriesCount, bins: binCount, peak };
}

function wholeAtLeastOne(count: number): number {
  if (!Number.isFinite(count)) return 1;
  return Math.max(1, Math.floor(count));
}

function groupOf(
  groups: ArrayLike<number> | null,
  row: number,
  seriesCount: number,
): number {
  if (groups === null) return 0;
  const raw = groups[row];
  if (raw === undefined || !Number.isFinite(raw)) return -1;
  const group = Math.trunc(raw);
  if (group < 0 || group >= seriesCount) return -1;
  return group;
}
