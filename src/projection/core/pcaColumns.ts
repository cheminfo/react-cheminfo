import type { MatrixLike } from '../../chart/core/matrix.ts';

/**
 * The average and the spread of every measurement, read off the rows in place.
 * @param rows - The measurements, one array per sample.
 * @param width - How many measurements each row must carry.
 * @returns The average and the sample standard deviation of each column.
 * @throws {Error} When a row is not `width` wide or a measurement is not a finite number.
 */
export function columnStats(
  rows: readonly number[][],
  width: number,
): { mean: number[]; deviation: number[] } {
  // Centred on the average so far, in one pass: a running total of the raw
  // values squared loses the low bits of a spectrum sitting on a baseline.
  // `deviation` carries the squared spread until the last loop roots it.
  const mean = new Array<number>(width).fill(0);
  const deviation = new Array<number>(width).fill(0);
  for (let index = 0; index < rows.length; index++) {
    const row = rows[index];
    if (row?.length !== width) {
      throw new Error(
        `pcaResult was given a row ${row?.length ?? 0} measurements wide at index ${index}, where the first row is ${width} wide.`,
      );
    }
    const seen = index + 1;
    for (let column = 0; column < width; column++) {
      const value = row[column];
      if (value === undefined || !Number.isFinite(value)) {
        throw new Error(
          `pcaResult was given ${String(value)} at row ${index}, measurement ${column}. A model carries it on into a map of nothing at all.`,
        );
      }
      const before = mean[column] ?? 0;
      const step = value - before;
      const after = before + step / seen;
      mean[column] = after;
      deviation[column] = (deviation[column] ?? 0) + step * (value - after);
    }
  }

  const divisor = Math.max(1, rows.length - 1);
  for (let column = 0; column < width; column++) {
    deviation[column] = Math.sqrt((deviation[column] ?? 0) / divisor);
  }
  return { mean, deviation };
}

/**
 * The loadings with a column of zero weight put back wherever the model
 * dropped a measurement that never moved.
 * @param loadings - The model's loadings, one column per measurement it kept.
 * @param excluded - The dropped columns, each a position in what was left.
 * @param width - How many measurements a row carries.
 * @returns Loadings as wide as a row, or the model's own when nothing was
 * dropped or the record does not add up.
 */
export function widenedLoadings(
  loadings: MatrixLike,
  excluded: readonly number[],
  width: number,
): MatrixLike {
  if (excluded.length === 0) return loadings;
  const kept: number[] = [];
  for (let column = 0; column < width; column++) kept.push(column);
  for (const position of excluded) kept.splice(position, 1);
  if (kept.length !== loadings.columns) return loadings;

  const keptAt = new Int32Array(width).fill(DROPPED);
  for (let index = 0; index < kept.length; index++) {
    keptAt[kept[index] ?? 0] = index;
  }
  return {
    rows: loadings.rows,
    columns: width,
    get: (row: number, column: number) => {
      if (column < 0 || column >= width) return Number.NaN;
      const at = keptAt[column] ?? DROPPED;
      return at === DROPPED ? 0 : loadings.get(row, at);
    },
  };
}

const DROPPED = -1;
