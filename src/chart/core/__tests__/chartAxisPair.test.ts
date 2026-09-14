import { expect, test } from 'vitest';

import { clampAxisIndex, clampAxisPair } from '../chartAxisPair.ts';

test('an axis index is floored and held inside the axes that exist', () => {
  expect(clampAxisIndex(1.6, 4)).toBe(1);
  expect(clampAxisIndex(9, 4)).toBe(4);
  expect(clampAxisIndex(-2, 4)).toBe(0);
  expect(clampAxisIndex(Number.NaN, 4)).toBe(0);
  expect(clampAxisIndex(Number.POSITIVE_INFINITY, 4)).toBe(0);
});

test('a pair made on other data is pulled back inside what was computed', () => {
  expect(clampAxisPair(7, 9, 3)).toStrictEqual({ x: 2, y: 1 });
  expect(clampAxisPair(2.9, 0.4, 5)).toStrictEqual({ x: 2, y: 0 });
});

test('the two axes are kept apart whenever there are two to pick from', () => {
  expect(clampAxisPair(2, 2, 4)).toStrictEqual({ x: 2, y: 1 });
  expect(clampAxisPair(0, 0, 4)).toStrictEqual({ x: 0, y: 1 });
  expect(clampAxisPair(3, 5, 1)).toStrictEqual({ x: 0, y: 0 });
  expect(clampAxisPair(0, 1, 0)).toStrictEqual({ x: 0, y: 0 });
});
