import { expect, test } from 'vitest';

import {
  formatCompact,
  formatDecimal,
  formatInteger,
  formatTrimmed,
} from '../numbers.ts';

test('a whole number is grouped in thousands', () => {
  expect(formatInteger(0)).toBe('0');
  expect(formatInteger(1234)).toBe('1,234');
  expect(formatInteger(1_234_567)).toBe('1,234,567');
  expect(formatInteger(-9876)).toBe('-9,876');
});

test('an integer rounds away whatever follows the decimal point', () => {
  expect(formatInteger(1234.4)).toBe('1,234');
  expect(formatInteger(1234.6)).toBe('1,235');
});

test('a number that is not finite reads as the missing marker', () => {
  expect(formatInteger(Number.NaN)).toBe('–');
  expect(formatInteger(Number.POSITIVE_INFINITY)).toBe('–');
  expect(formatDecimal(Number.NaN, 2)).toBe('–');
  expect(formatTrimmed(Number.NaN, 2)).toBe('–');
  expect(formatCompact(Number.NaN)).toBe('–');
});

test('a decimal keeps its digits, zeros included, and groups its thousands', () => {
  expect(formatDecimal(1234.5, 2)).toBe('1,234.50');
  expect(formatDecimal(2, 3)).toBe('2.000');
  expect(formatDecimal(2)).toBe('2.00');
  expect(formatDecimal(0.125, 0)).toBe('0');
});

test('a digit count outside what Intl accepts is clamped into it', () => {
  expect(formatDecimal(1.23456, -3)).toBe('1');
  expect(formatDecimal(0.5, 99)).toBe('0.50000000000000000000');
  expect(formatTrimmed(1.23456, -3)).toBe('1');
});

test('a digit count that is not a number falls back to two', () => {
  expect(formatDecimal(1.23456, Number.NaN)).toBe('1.23');
  expect(formatTrimmed(1.23456, Number.NaN)).toBe('1.23');
  expect(formatDecimal(1.23456, Number.POSITIVE_INFINITY)).toBe('1.23');
});

test('a trimmed number drops its trailing zeros and never groups', () => {
  expect(formatTrimmed(1.5, 3)).toBe('1.5');
  expect(formatTrimmed(2, 2)).toBe('2');
  expect(formatTrimmed(1234.5678, 2)).toBe('1234.57');
  expect(formatTrimmed(0.125, 3)).toBe('0.125');
  expect(formatTrimmed(0.000_4, 2)).toBe('0');
});

test('a compact number is shortened once it reaches a thousand', () => {
  expect(formatCompact(999)).toBe('999');
  expect(formatCompact(1000)).toBe('1K');
  expect(formatCompact(1234)).toBe('1.2K');
  expect(formatCompact(3_400_000)).toBe('3.4M');
  expect(formatCompact(-1500)).toBe('-1.5K');
});
