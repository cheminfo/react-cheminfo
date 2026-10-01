import { expect, test } from 'vitest';

import {
  isPartialNumber,
  numberText,
  readNumber,
  stepNumber,
} from '../numberText.ts';

test('text reads as the number it spells, decimal comma included', () => {
  expect(readNumber('0.2')).toBe(0.2);
  expect(readNumber('0,2')).toBe(0.2);
  expect(readNumber(' -1.5e-3 ')).toBe(-0.0015);
  expect(readNumber('.5')).toBe(0.5);
  expect(readNumber('+7')).toBe(7);
});

test('text that is not a number yet reads as nothing', () => {
  expect(readNumber('')).toBeUndefined();
  expect(readNumber('-')).toBeUndefined();
  expect(readNumber('1e')).toBeUndefined();
  expect(readNumber('0.2x')).toBeUndefined();
  expect(readNumber('Infinity')).toBeUndefined();
});

test('a half-typed decimal reads as the number it already spells', () => {
  expect(readNumber('0.')).toBe(0);
  expect(readNumber('0.0')).toBe(0);
});

test('a whole-number box refuses a decimal rather than rounding it', () => {
  expect(readNumber('3', true)).toBe(3);
  expect(readNumber('3.5', true)).toBeUndefined();
});

test('what can still become a number is not reported as a mistake', () => {
  for (const text of ['', '-', '+', '0.', '.', '1e', '1e-', '12', '0,']) {
    expect(isPartialNumber(text)).toBe(true);
  }
  for (const text of ['0.2x', 'e', 'abc', '1..2', '--1']) {
    expect(isPartialNumber(text)).toBe(false);
  }
});

test('a number is shown as itself, and nothing as an empty box', () => {
  expect(numberText(0.2)).toBe('0.2');
  expect(numberText(0)).toBe('0');
  expect(numberText(undefined)).toBe('');
  expect(numberText(Number.NaN)).toBe('');
});

test('stepping keeps the decimals the operands carry', () => {
  expect(stepNumber(0.1, 0.2)).toBe(0.3);
  expect(stepNumber(0.3, -0.1)).toBe(0.2);
  expect(stepNumber(1, 0.001)).toBe(1.001);
  expect(stepNumber(25, 1)).toBe(26);
  expect(stepNumber(1e-9, 1e-9)).toBe(2e-9);
});
