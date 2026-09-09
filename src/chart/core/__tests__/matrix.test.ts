import { expect, test } from 'vitest';

import { mappedMatrix, rowMatrix, stackedMatrix } from '../matrix.ts';

test('an array of rows is read as a matrix in place', () => {
  const matrix = rowMatrix([
    [1, 2],
    [3, 4],
  ]);

  expect(matrix.rows).toBe(2);
  expect(matrix.columns).toBe(2);
  expect(matrix.get(0, 0)).toBe(1);
  expect(matrix.get(1, 0)).toBe(3);
  expect(matrix.get(1, 1)).toBe(4);
});

test('a position outside the matrix reads as NaN instead of throwing', () => {
  const matrix = rowMatrix([
    [1, 2],
    [3, 4],
  ]);

  expect(matrix.get(2, 0)).toBeNaN();
  expect(matrix.get(0, 5)).toBeNaN();
  expect(matrix.get(-1, 0)).toBeNaN();
  expect(matrix.get(0, -1)).toBeNaN();
});

test('an empty table is a zero by zero matrix', () => {
  const matrix = rowMatrix([]);

  expect(matrix.rows).toBe(0);
  expect(matrix.columns).toBe(0);
  expect(matrix.get(0, 0)).toBeNaN();
});

test('the width is taken from the first row, so a ragged one is cut off', () => {
  const matrix = rowMatrix([[1, 2], [3, 4, 5], [6]]);

  expect(matrix.columns).toBe(2);
  expect(matrix.get(1, 2)).toBeNaN();
  expect(matrix.get(2, 1)).toBeNaN();
});

test('a mapped matrix flips one column and leaves the rows it reads alone', () => {
  const rows = [
    [1, 2],
    [3, 4],
  ];
  const source = rowMatrix(rows);
  const flipped = mappedMatrix(source, (value, rowIndex, columnIndex) =>
    columnIndex === 1 ? -value : value + rowIndex * 0,
  );

  expect(flipped.rows).toBe(2);
  expect(flipped.columns).toBe(2);
  expect(flipped.get(0, 1)).toBe(-2);
  expect(flipped.get(0, 0)).toBe(1);
  expect(source.get(0, 1)).toBe(2);
  expect(rows).toStrictEqual([
    [1, 2],
    [3, 4],
  ]);
});

test('two matrices of one width are read as one table, top first', () => {
  const top = rowMatrix([
    [1, 2],
    [3, 4],
  ]);
  const bottom = rowMatrix([[5, 6]]);
  const stacked = stackedMatrix(top, bottom);

  expect(stacked.rows).toBe(3);
  expect(stacked.columns).toBe(2);
  expect(stacked.get(0, 0)).toBe(1);
  expect(stacked.get(1, 1)).toBe(4);
  expect(stacked.get(2, 0)).toBe(5);
  expect(stacked.get(2, 1)).toBe(6);
});

test('a stacked matrix reads NaN outside itself rather than reaching on', () => {
  const stacked = stackedMatrix(rowMatrix([[1, 2]]), rowMatrix([[3, 4]]));

  expect(stacked.get(2, 0)).toBeNaN();
  expect(stacked.get(-1, 0)).toBeNaN();
  expect(stacked.get(0, 2)).toBeNaN();
});
