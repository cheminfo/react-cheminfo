import { expect, test } from 'vitest';

import { positionInRange } from '../scale.ts';

test('a value is placed where it sits between the bounds', () => {
  expect(positionInRange(0, 0, 10)).toBe(0);
  expect(positionInRange(5, 0, 10)).toBe(0.5);
  expect(positionInRange(10, 0, 10)).toBe(1);
});

test('a value outside the bounds is clamped rather than running off the scale', () => {
  expect(positionInRange(50, 0, 10)).toBe(1);
  expect(positionInRange(-5, 0, 10)).toBe(0);
});

test('a range holding a single value puts everything in the middle', () => {
  expect(positionInRange(3, 3, 3)).toBe(0.5);
  expect(positionInRange(3, 3, 3, { logarithmic: true })).toBe(0.5);
});

test('a number that is not finite is placed at the bottom', () => {
  expect(positionInRange(Number.NaN, 0, 10)).toBe(0);
  expect(positionInRange(5, Number.NaN, 10)).toBe(0);
  expect(positionInRange(5, 0, Number.POSITIVE_INFINITY)).toBe(0);
});

test('a quantity spanning decades is placed logarithmically', () => {
  expect(positionInRange(0.01, 0.000_1, 1, { logarithmic: true })).toBeCloseTo(
    0.5,
    10,
  );
  expect(positionInRange(0.01, 0.000_1, 1)).toBeCloseTo(0.0099, 4);
});

test('a genuine zero on a logarithmic scale lands at the bottom, not off it', () => {
  expect(positionInRange(0, 0, 1000, { logarithmic: true })).toBe(0);
});
