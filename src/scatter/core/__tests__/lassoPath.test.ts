import { expect, test } from 'vitest';

import {
  appendLassoPoint,
  createLassoPath,
  lassoPathData,
  resetLassoPath,
} from '../lassoPath.ts';

test('a fresh path holds nothing and has room to grow', () => {
  const path = createLassoPath();

  expect(path).toHaveLength(0);
  expect(path.xs).toHaveLength(256);
  expect(path.ys).toHaveLength(256);
  expect(createLassoPath(8).xs).toHaveLength(8);
  expect(createLassoPath(0).xs).toHaveLength(1);
  expect(createLassoPath(Number.NaN).xs).toHaveLength(256);
});

test('a jitter within the minimum distance keeps a single vertex', () => {
  const path = createLassoPath(8);

  expect(appendLassoPoint(path, 0, 0, 3)).toBe(true);
  expect(appendLassoPoint(path, 2, 0, 3)).toBe(false);
  expect(appendLassoPoint(path, 0, 2, 3)).toBe(false);
  expect(path).toHaveLength(1);
});

test('the minimum distance is measured from the last vertex kept', () => {
  const path = createLassoPath(8);
  appendLassoPoint(path, 0, 0, 3);
  appendLassoPoint(path, 2, 0, 3);

  expect(appendLassoPoint(path, 4, 0, 3)).toBe(true);
  expect(path).toHaveLength(2);
  expect(path.xs[1]).toBe(4);
});

test('a minimum distance of zero drops nothing', () => {
  const path = createLassoPath(8);

  expect(appendLassoPoint(path, 0, 0, 0)).toBe(true);
  expect(appendLassoPoint(path, 0, 0, 0)).toBe(true);
  expect(appendLassoPoint(path, 0, 0, Number.NaN)).toBe(true);
  expect(path).toHaveLength(3);
});

test('a position that is not finite is never kept', () => {
  const path = createLassoPath(8);

  expect(appendLassoPoint(path, Number.NaN, 0, 1)).toBe(false);
  expect(appendLassoPoint(path, 0, Number.POSITIVE_INFINITY, 1)).toBe(false);
  expect(path).toHaveLength(0);
});

test('a long drag grows the buffer past its first capacity and keeps every vertex', () => {
  const path = createLassoPath();
  for (let index = 0; index < 300; index++) {
    expect(appendLassoPoint(path, index * 10, 0, 3)).toBe(true);
  }

  expect(path).toHaveLength(300);
  expect(path.xs).toHaveLength(512);
  expect(path.ys).toHaveLength(512);
  expect(path.xs[0]).toBe(0);
  expect(path.xs[255]).toBe(2550);
  expect(path.xs[299]).toBe(2990);
  expect(path.ys[299]).toBe(0);
});

test('the vertices already kept survive the growth', () => {
  const path = createLassoPath(2);
  for (let index = 0; index < 9; index++) {
    appendLassoPoint(path, index, index * 2, 0);
  }

  expect(path).toHaveLength(9);
  expect(path.xs).toHaveLength(16);
  expect(path.xs.subarray(0, 9)).toStrictEqual(
    new Float64Array([0, 1, 2, 3, 4, 5, 6, 7, 8]),
  );
  expect(path.ys.subarray(0, 9)).toStrictEqual(
    new Float64Array([0, 2, 4, 6, 8, 10, 12, 14, 16]),
  );
});

test('a reset empties the path without giving up its buffers', () => {
  const path = createLassoPath(8);
  appendLassoPoint(path, 1, 1, 0);
  appendLassoPoint(path, 2, 2, 0);
  const xsBefore = path.xs;
  const ysBefore = path.ys;

  resetLassoPath(path);

  expect(path).toHaveLength(0);
  expect(path.xs).toBe(xsBefore);
  expect(path.ys).toBe(ysBefore);
  expect(lassoPathData(path, true)).toBe('');
  expect(appendLassoPoint(path, 50, 50, 3)).toBe(true);
  expect(path).toHaveLength(1);
});

test('an empty path has no outline to draw', () => {
  const path = createLassoPath(8);

  expect(lassoPathData(path, false)).toBe('');
  expect(lassoPathData(path, true)).toBe('');
});

test('the outline rounds to a tenth of a pixel', () => {
  const path = createLassoPath(8);
  appendLassoPoint(path, 1.26, 2.34, 0);
  appendLassoPoint(path, 10.05, -3.749, 0);

  expect(lassoPathData(path, false)).toBe('M1.3,2.3 L10.1,-3.7');
});

test('the ring is closed only when it is asked for', () => {
  const path = createLassoPath(8);
  appendLassoPoint(path, 0, 0, 0);
  appendLassoPoint(path, 10, 0, 0);
  appendLassoPoint(path, 10, 10, 0);

  expect(lassoPathData(path, false)).toBe('M0,0 L10,0 L10,10');
  expect(lassoPathData(path, true)).toBe('M0,0 L10,0 L10,10Z');
});

test('a single vertex draws its move alone', () => {
  const path = createLassoPath(8);
  appendLassoPoint(path, 4, 5, 0);

  expect(lassoPathData(path, false)).toBe('M4,5');
  expect(lassoPathData(path, true)).toBe('M4,5Z');
});
