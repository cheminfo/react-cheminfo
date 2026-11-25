import type { ChartBins } from './chartBins.ts';

/** How a histogram's counts are read up the vertical axis. */
export type BinScale = 'linear' | 'log';

/**
 * Where an empty bin stands on a log scale: half a count, below the one count
 * a bin holding a single sample reaches, so an empty bin and a bin of one stay
 * apart.
 */
export const BIN_LOG_FLOOR = Math.log10(0.5);

/** One series of a histogram: its edges and its counts. */
export type BinSeries = Pick<ChartBins, 'edges' | 'counts'>;

/** The bins a window of the axis shows. */
export interface ShownBins {
  /** The first bin shown. */
  first: number;
  /** The last; less than `first` when none is shown. */
  last: number;
}

/**
 * The bins a window of the horizontal axis shows: those that overlap it, at
 * least in part.
 * @param edges - The bins' edges, one more than the bins, ascending.
 * @param window - The window, low end first.
 * @returns The first and the last bin shown.
 */
export function binsInWindow(
  edges: ArrayLike<number>,
  window: readonly [number, number],
): ShownBins {
  const bins = edges.length - 1;
  let first = 0;
  while (first < bins && (edges[first + 1] as number) <= window[0]) first++;
  let last = bins - 1;
  while (last >= 0 && (edges[last] as number) >= window[1]) last--;
  return { first, last };
}

/**
 * The bin holding a value: the one whose low edge is at or below it and whose
 * high edge is above it.
 * @param edges - The bins' edges, ascending.
 * @param value - The value.
 * @returns The bin, or -1 for a value outside every bin.
 */
export function binAt(edges: ArrayLike<number>, value: number): number {
  const bins = edges.length - 1;
  if (!(value >= (edges[0] as number) && value < (edges[bins] as number))) {
    return -1;
  }
  let low = 0;
  let high = bins - 1;
  while (low < high) {
    const middle = (low + high + 1) >> 1;
    if ((edges[middle] as number) <= value) low = middle;
    else high = middle - 1;
  }
  return low;
}

/**
 * Some bins of a histogram as the corners of one stepped area, for
 * `areaPath`: each bin a flat top from its low edge to its high one, as high
 * as its count — or the count's logarithm, an empty bin on
 * {@link BIN_LOG_FLOOR}.
 * @param series - The histogram.
 * @param shown - The bins drawn.
 * @param scale - How the counts are read.
 * @returns The corners, and the highest of them: at least 1 on a linear
 *   scale and 0 on a log one, so an empty window still has an axis.
 */
export function binSteps(
  series: BinSeries,
  shown: ShownBins,
  scale: BinScale,
): { x: Float64Array; y: Float64Array; peak: number } {
  const { edges, counts } = series;
  const count = Math.max(0, shown.last - shown.first + 1);
  const x = new Float64Array(count * 2);
  const y = new Float64Array(count * 2);
  let peak = scale === 'log' ? 0 : 1;
  for (let index = 0; index < count; index++) {
    const bin = shown.first + index;
    const counted = counts[bin] as number;
    let height = counted;
    if (scale === 'log') {
      height = counted > 0 ? Math.log10(counted) : BIN_LOG_FLOOR;
    }
    x[index * 2] = edges[bin] as number;
    x[index * 2 + 1] = edges[bin + 1] as number;
    y[index * 2] = height;
    y[index * 2 + 1] = height;
    if (height > peak) peak = height;
  }
  return { x, y, peak };
}

/**
 * A window of the horizontal axis widened about its middle to at least a
 * span, and kept inside the full range.
 * @param window - The window.
 * @param narrowest - The narrowest span a window may have.
 * @param full - The full range.
 * @returns The window.
 */
export function atLeastSpan(
  window: readonly [number, number],
  narrowest: number,
  full: readonly [number, number],
): [number, number] {
  const span = window[1] - window[0];
  if (span >= narrowest) return [window[0], window[1]];
  const reach = Math.min(narrowest, full[1] - full[0]);
  const middle = (window[0] + window[1]) / 2;
  const start = Math.min(
    Math.max(middle - reach / 2, full[0]),
    full[1] - reach,
  );
  return [start, start + reach];
}
