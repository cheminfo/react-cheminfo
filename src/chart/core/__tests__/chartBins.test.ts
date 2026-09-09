import { expect, test } from 'vitest';

import { chartBinCounts } from '../chartBins.ts';
import { rowMatrix } from '../matrix.ts';

// A filler first column, so the column argument is the one being read.
const ROWS = [
  [-1, 0.5],
  [-1, 1.5],
  [-1, 2],
  [-1, 3.9],
  [-1, 5],
  [-1, 7],
  [-1, 9.9],
  [-1, 10],
  [-1, 10.5],
  [-1, 4],
  [-1, Number.NaN],
  [-1, 0.5],
  [-1, 0.9],
];
const GROUPS = [0, 0, 0, 1, 1, 0, 1, 1, 0, -1, 0, 0, 0];
const RANGE = { min: 0, max: 10 };

const matrix = rowMatrix(ROWS);

test('two groups are counted over one shared set of edges', () => {
  const histogram = chartBinCounts(matrix, 1, RANGE, 5, GROUPS, 2);

  expect(histogram.edges).toStrictEqual(new Float64Array([0, 2, 4, 6, 8, 10]));
  expect(histogram.counts).toStrictEqual(
    new Uint32Array([4, 1, 0, 1, 0, 0, 1, 1, 0, 2]),
  );
  expect(histogram.series).toBe(2);
  expect(histogram.bins).toBe(5);
  expect(histogram.peak).toBe(4);
});

test('a value past the range is dropped and one on the closing edge is kept', () => {
  const histogram = chartBinCounts(
    rowMatrix([
      [-1, 10],
      [-1, 10.5],
      [-1, -0.5],
    ]),
    1,
    RANGE,
    5,
    null,
    1,
  );

  expect(histogram.counts).toStrictEqual(new Uint32Array([0, 0, 0, 0, 1]));
  expect(histogram.peak).toBe(1);
});

test('a group outside the series is left out rather than folded into one', () => {
  const histogram = chartBinCounts(matrix, 1, RANGE, 5, GROUPS, 2);
  let total = 0;
  for (const count of histogram.counts) total += count;

  // Thirteen rows, less the one past the range, the one that is not a number
  // and the one whose group is -1.
  expect(total).toBe(10);
});

test('no groups at all is one series holding every finite value in range', () => {
  const histogram = chartBinCounts(matrix, 1, RANGE, 5, null, 4);

  expect(histogram.series).toBe(1);
  expect(histogram.counts).toStrictEqual(new Uint32Array([4, 2, 2, 1, 2]));
  expect(histogram.peak).toBe(4);
});

test('fewer than one bin is one bin, and a range of no width still ascends', () => {
  const single = chartBinCounts(matrix, 1, RANGE, 0, null, 1);

  expect(single.bins).toBe(1);
  expect(single.edges).toStrictEqual(new Float64Array([0, 10]));
  expect(single.counts).toStrictEqual(new Uint32Array([11]));

  const flat = chartBinCounts(matrix, 1, { min: 4, max: 4 }, 2, null, 1);

  expect(flat.edges).toStrictEqual(new Float64Array([4, 4.5, 5]));
  expect(flat.counts).toStrictEqual(new Uint32Array([1, 1]));
});
