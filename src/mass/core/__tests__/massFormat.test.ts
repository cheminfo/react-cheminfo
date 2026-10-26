import { expect, test } from 'vitest';

import { formatIntensity, formatMz } from '../massFormat.ts';

test('an m/z is written with four decimals, or none when nominal', () => {
  expect(formatMz(325.11294)).toBe('325.1129');
  expect(formatMz(163)).toBe('163.0000');
  expect(formatMz(1000 / 3)).toBe('333.3333');
  expect(formatMz(163, 0)).toBe('163');
  expect(formatMz(162.6, 0)).toBe('163');
});

test('an intensity is written with two decimals, or none when nominal', () => {
  expect(formatIntensity(100)).toBe('100.00');
  expect(formatIntensity(8.75)).toBe('8.75');
  expect(formatIntensity(0)).toBe('0.00');
  expect(formatIntensity(8.75, 0)).toBe('9');
  expect(formatIntensity(100, 0)).toBe('100');
});

test('the counts a pixel spectrum kept are written as a power of ten', () => {
  expect(formatIntensity(123456789)).toBe('1.23e+8');
  expect(formatIntensity(1e5)).toBe('1.00e+5');
  expect(formatIntensity(99999.5)).toBe('99999.50');
});

test('a share of a total too small for two decimals is not written as zero', () => {
  // A survey scan of thirteen hundred picked peaks summed to a hundred puts
  // most of its rows here, and `0.00` down a whole column reads as a fault.
  expect(formatIntensity(0.004)).toBe('4.00e-3');
  expect(formatIntensity(0.0001)).toBe('1.00e-4');
  expect(formatIntensity(0.01)).toBe('0.01');
  // A peak that really is zero keeps the plain form a reader expects.
  expect(formatIntensity(0)).toBe('0.00');
  expect(formatIntensity(0, 0)).toBe('0');
});

test('a mirrored peak is not thrown into powers of ten for being negative', () => {
  expect(formatIntensity(-8.75)).toBe('-8.75');
  expect(formatIntensity(-0.004)).toBe('-4.00e-3');
});
