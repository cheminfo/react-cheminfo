import { expect, test } from 'vitest';

import { clamp } from '../clamp.ts';
import { roundTo } from '../roundTo.ts';
import { formatSuperscript } from '../superscript.ts';

test('a value inside the range is kept, one outside lands on the bound it ran past', () => {
  expect(clamp(0.4, 0, 1)).toBe(0.4);
  expect(clamp(-2, 0, 1)).toBe(0);
  expect(clamp(7, 0, 1)).toBe(1);
  expect(clamp(3, 3, 3)).toBe(3);
});

test('a value that is not finite lands on the fallback, the lower bound unless told', () => {
  expect(clamp(Number.NaN, 0, 1)).toBe(0);
  expect(clamp(Number.POSITIVE_INFINITY, 0, 1)).toBe(0);
  expect(clamp(Number.NEGATIVE_INFINITY, 2, 9)).toBe(2);
  expect(clamp(Number.NaN, 0, 20, 2)).toBe(2);
});

test('a number is rounded to the decimals asked for, two by default', () => {
  expect(roundTo(12.3456)).toBe(12.35);
  expect(roundTo(12.3456, 1)).toBe(12.3);
  expect(roundTo(12.5, 0)).toBe(13);
  expect(roundTo(-0.123_456, 4)).toBe(-0.1235);
  expect(roundTo(1.005, 15)).toBe(1.005);
});

test('a decimal count out of range is clamped, and one that is not a number falls back to two', () => {
  expect(roundTo(1.234_567, -4)).toBe(1);
  expect(roundTo(1.234_567, 2.9)).toBe(1.23);
  expect(roundTo(1.234_567, Number.NaN)).toBe(1.23);
  expect(roundTo(Number.NaN, 2)).toBeNaN();
  expect(roundTo(Number.POSITIVE_INFINITY, 2)).toBe(Number.POSITIVE_INFINITY);
});

test('a whole number is written in superscript digits, with its sign', () => {
  expect(formatSuperscript(0)).toBe('⁰');
  expect(formatSuperscript(14)).toBe('¹⁴');
  expect(formatSuperscript(1_234_567_890)).toBe('¹²³⁴⁵⁶⁷⁸⁹⁰');
  expect(formatSuperscript(-3)).toBe('⁻³');
  expect(formatSuperscript(2.9)).toBe('²');
  expect(formatSuperscript(Number.NaN)).toBe('');
});
