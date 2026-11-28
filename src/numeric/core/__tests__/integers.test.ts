import { expect, test } from 'vitest';

import { greatestCommonDivisor, leastCommonMultiple } from '../integers.ts';

test('the greatest common divisor is never negative, and 0 only for 0 and 0', () => {
  expect(greatestCommonDivisor(12, 18)).toBe(6);
  expect(greatestCommonDivisor(-12, 18)).toBe(6);
  expect(greatestCommonDivisor(7, 0)).toBe(7);
  expect(greatestCommonDivisor(0, 0)).toBe(0);
  expect(greatestCommonDivisor(3, 2)).toBe(1);
});

test('the least common multiple is never negative, and 0 when either is', () => {
  expect(leastCommonMultiple(4, 6)).toBe(12);
  expect(leastCommonMultiple(-4, 6)).toBe(12);
  expect(leastCommonMultiple(3, 2)).toBe(6);
  expect(leastCommonMultiple(0, 5)).toBe(0);
});
