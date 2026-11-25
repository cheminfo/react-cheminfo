import { expect, test } from 'vitest';

import { roundSignificant } from '../roundSignificant.ts';

test('a number keeps the significant digits asked for, and stays a number', () => {
  expect([
    roundSignificant(0.268_814_5, 4),
    roundSignificant(12_345.678, 4),
    roundSignificant(-0.000_123_456, 3),
    roundSignificant(1 / 3, 15),
    roundSignificant(99.95, 3),
    roundSignificant(0, 6),
  ]).toStrictEqual([0.2688, 12_350, -0.000_123, 0.333_333_333_333_333, 100, 0]);
});

test('a value that is not finite comes back unchanged', () => {
  expect([
    roundSignificant(Number.NaN, 4),
    roundSignificant(Number.POSITIVE_INFINITY, 4),
    roundSignificant(Number.NEGATIVE_INFINITY, 4),
  ]).toStrictEqual([
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
  ]);
});

test('a count of digits outside 1–100 is refused', () => {
  expect(() => roundSignificant(1.5, 0)).toThrow(RangeError);
  expect(() => roundSignificant(1.5, 101)).toThrow(RangeError);
});
