import { expect, test } from 'vitest';

import {
  emptyCase,
  formatSigned,
  readAnswerNumber,
  unreadableCase,
} from '../answers.ts';

test('a number is read the way a student types it', () => {
  expect(
    ['42', '+5', '−3', '-3', '1,5', '75.8 %', ' 12 ', '.5', '1 000', '–2'].map(
      (text) => readAnswerNumber(text),
    ),
  ).toStrictEqual([42, 5, -3, -3, 1.5, 75.8, 12, 0.5, 1000, -2]);
  expect(
    ['', 'abc', '1.2.3', '--1', '1e999'].map((text) => readAnswerNumber(text)),
  ).toStrictEqual([undefined, undefined, undefined, undefined, undefined]);
});

test('a whole number rejects a decimal', () => {
  expect(readAnswerNumber('7', true)).toBe(7);
  expect(readAnswerNumber('−7', true)).toBe(-7);
  expect(readAnswerNumber('7.5', true)).toBeUndefined();
});

test('a power of ten is read however a keyboard or a calculator writes it', () => {
  expect(
    [
      '1.93 × 10^3',
      '1,93·10³',
      '1.93x10^3',
      '1.93X10^3',
      '1.93*10^3',
      '1.93E3',
      '1.93e+3',
      '1.93 ⋅ 10^(3)',
      '1.93∙10⁺³',
      '1,93 · 10 ^ 3',
    ].map((text) => readAnswerNumber(text)),
  ).toStrictEqual([1930, 1930, 1930, 1930, 1930, 1930, 1930, 1930, 1930, 1930]);
  expect(
    [
      '2.5×10⁻³',
      '−4.2 × 10^−2',
      '6.022×10²³',
      '1.6*10^(-19)',
      '10^3',
      '10⁻⁶',
      '-10^3',
      '103',
    ].map((text) => readAnswerNumber(text)),
  ).toStrictEqual([0.0025, -0.042, 6.022e23, 1.6e-19, 1000, 1e-6, -1000, 103]);
});

test('a power of ten keeps a whole number whole, and a broken one reads as nothing', () => {
  expect(readAnswerNumber('2×10^3', true)).toBe(2000);
  expect(readAnswerNumber('1.5×10^-1', true)).toBeUndefined();
  expect(
    [
      '2x10',
      '×10^3',
      '1.93×10^',
      '1.93×10^(3',
      '1.93×10^3.5',
      '1×10^999',
      '1.93×10³x',
    ].map((text) => readAnswerNumber(text)),
  ).toStrictEqual([
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
  ]);
});

test('a signed number is written with its sign and a true minus', () => {
  expect([5, -2, 0].map(formatSigned)).toStrictEqual(['+5', '−2', '0']);
});

test('an empty box is told what to type', () => {
  expect(emptyCase('Electrons', 'a number of electrons')).toStrictEqual({
    label: 'Electrons',
    passed: false,
    reason: 'Type a number of electrons.',
    actual: null,
  });
});

test('what does not read as the value asked for is quoted back', () => {
  expect(
    unreadableCase('Electrons', ' twelve ', 'a whole number'),
  ).toStrictEqual({
    label: 'Electrons',
    passed: false,
    reason: '“twelve” is not a whole number.',
    actual: ' twelve ',
  });
});
