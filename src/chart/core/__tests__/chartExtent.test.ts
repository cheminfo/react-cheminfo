import { getNumbers } from 'ml-dataset-iris';
import { PCA } from 'ml-pca';
import { expect, test } from 'vitest';

import {
  EMPTY_EXTENT,
  chartColumnExtent,
  chartMergeExtents,
  chartPadExtent,
  chartValuesExtent,
} from '../chartExtent.ts';
import { rowMatrix } from '../matrix.ts';

const measurements = getNumbers();
const scores = rowMatrix(
  new PCA(measurements, { scale: true }).predict(measurements).to2DArray(),
);

test('the raw range of a scores column is its two extreme flowers', () => {
  const extent = chartColumnExtent(scores, 0, { padding: 0 });

  expect(extent.min).toBeCloseTo(-2.7651, 4);
  expect(extent.max).toBeCloseTo(3.2996, 4);
});

test('a symmetric range puts the origin in the middle', () => {
  const extent = chartColumnExtent(scores, 0, { symmetric: true, padding: 0 });

  expect(extent.min).toBe(-extent.max);
  expect(extent.max).toBeCloseTo(3.2996, 4);
});

test('indices read one group only, so setosa keeps to its own side', () => {
  const setosa = new Uint32Array(50);
  for (let index = 0; index < setosa.length; index++) setosa[index] = index;

  const extent = chartColumnExtent(scores, 0, { padding: 0, indices: setosa });

  expect(extent.min).toBeCloseTo(-2.7651, 4);
  expect(extent.max).toBeCloseTo(-1.8126, 4);
});

test('padding widens by a share of the span at each end', () => {
  const matrix = rowMatrix([[0], [4], [10]]);

  expect(chartColumnExtent(matrix, 0, { padding: 0.1 })).toStrictEqual({
    min: -1,
    max: 11,
  });
  expect(chartColumnExtent(matrix, 0)).toStrictEqual({ min: -0.5, max: 10.5 });
});

test('includeZero reaches zero exactly, so bars stand on their baseline', () => {
  const matrix = rowMatrix([[2], [5], [9]]);

  expect(
    chartColumnExtent(matrix, 0, { includeZero: true, padding: 0 }),
  ).toStrictEqual({ min: 0, max: 9 });
  expect(chartColumnExtent(matrix, 0, { includeZero: true }).min).toBe(0);
  expect(chartColumnExtent(matrix, 0, { padding: 0 })).toStrictEqual({
    min: 2,
    max: 9,
  });
});

test('a column with nothing finite in it draws an empty axis', () => {
  const matrix = rowMatrix([
    [Number.NaN],
    [Number.NaN],
    [Number.POSITIVE_INFINITY],
  ]);

  expect(chartColumnExtent(matrix, 0)).toStrictEqual({ min: 0, max: 1 });
  expect(chartColumnExtent(matrix, 7)).toStrictEqual({ min: 0, max: 1 });
});

test('one value on its own is opened by a twentieth of itself', () => {
  expect(chartPadExtent({ min: 4, max: 4 })).toStrictEqual({
    min: 3.8,
    max: 4.2,
  });
  expect(chartPadExtent({ min: 0, max: 0 })).toStrictEqual({
    min: -1,
    max: 1,
  });
  expect(chartPadExtent({ min: 0, max: 10 }, 0)).toStrictEqual({
    min: 0,
    max: 10,
  });
  expect(chartPadExtent({ min: Number.NaN, max: 3 })).toStrictEqual({
    min: 0,
    max: 1,
  });
});

test('merged ranges cover every one they were given', () => {
  expect(
    chartMergeExtents([
      { min: -1, max: 2 },
      { min: 0, max: 5 },
      { min: -4, max: -3 },
    ]),
  ).toStrictEqual({ min: -4, max: 5 });
  expect(chartMergeExtents([])).toStrictEqual({ min: 0, max: 1 });
  expect(
    chartMergeExtents([{ min: Number.NaN, max: Number.NaN }]),
  ).toStrictEqual({ min: 0, max: 1 });
});

test('a run of numbers is read in place, past nothing that is not a number', () => {
  const values = [3, Number.NaN, -1, Number.POSITIVE_INFINITY, 7];

  expect(chartValuesExtent(values)).toStrictEqual({ min: -1, max: 7 });
});

test('the limit stops a series being read past the slots it is drawn in', () => {
  const values = [3, 1, 99];

  expect(chartValuesExtent(values, { limit: 2 })).toStrictEqual({
    min: 1,
    max: 3,
  });
  // A limit past the end reads what is there rather than reading undefined.
  expect(chartValuesExtent(values, { limit: 9 })).toStrictEqual({
    min: 1,
    max: 99,
  });
});

test('several runs are covered without an array of ranges being built', () => {
  const first = chartValuesExtent([3, 5], { into: EMPTY_EXTENT });
  const both = chartValuesExtent([-2, 1], { into: first });

  expect(both).toStrictEqual({ min: -2, max: 5 });
});

test('a run with nothing finite in it stays the empty range, never zero', () => {
  const empty = chartValuesExtent([Number.NaN, Number.NaN]);

  // min above max is what says there was nothing; a range around zero would
  // draw an axis about a value the data never held.
  expect(empty.min).toBeGreaterThan(empty.max);
  expect(empty).toStrictEqual(EMPTY_EXTENT);
});
