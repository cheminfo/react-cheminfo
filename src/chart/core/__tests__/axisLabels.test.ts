import { expect, test } from 'vitest';

import { axisLabeller, formatNumber, formatScientific } from '../axisLabels.ts';
import type { ChartAxisScale } from '../chartAxisScale.ts';
import { chartAxisScale } from '../chartAxisScale.ts';

/**
 * An axis divided the way a chart a reader has zoomed divides one.
 * @param from - The low end of the window.
 * @param to - The high end.
 * @param count - The most intervals it has room for.
 * @returns The axis.
 */
function spectrumAxis(from: number, to: number, count: number): ChartAxisScale {
  return chartAxisScale(from, to, { count, nice: false, step: 'atMost' });
}

test('a label keeps the digits it needs and loses the ones it does not', () => {
  expect(formatNumber(500, 4)).toBe('500');
  expect(formatNumber(500.0002, 4)).toBe('500.0002');
  expect(formatNumber(0.4996, 4)).toBe('0.4996');
  expect(formatNumber(100.1, 2)).toBe('100.1');
  expect(formatNumber(1234, 0)).toBe('1234');
});

test('a tick that rounds to zero from below is not written as minus zero', () => {
  expect(formatNumber(-0.00004, 3)).toBe('0');
  expect(formatNumber(-12.5, 1)).toBe('-12.5');
});

test('a power of ten keeps only the mantissa digits it needs', () => {
  expect(formatScientific(2e8)).toBe('2e+8');
  expect(formatScientific(1.5e8)).toBe('1.5e+8');
  expect(formatScientific(-5e7)).toBe('-5e+7');
  expect(formatScientific(2e-5)).toBe('2e-5');
});

test('zero has no exponent, whatever the axis it is on', () => {
  expect(formatScientific(0)).toBe('0');
  expect(formatScientific(0, 2)).toBe('0');
});

test('a mantissa asked for a precision keeps exactly that many decimals', () => {
  expect(formatScientific(123456789, 2)).toBe('1.23e+8');
  expect(formatScientific(2e8, 2)).toBe('2.00e+8');
});

test('the noise a tick picks up on the way is not written out', () => {
  // 3 * 0.1 is 0.30000000000000004, and the shortest form writes every digit.
  expect(formatScientific(3 * 0.1 * 1e-4)).toBe('3e-5');
  expect(formatScientific(7 * 1e5 * 1.1)).toBe('7.7e+5');
});

test('an intensity axis breaks into powers of ten, every label of it', () => {
  const write = axisLabeller(chartAxisScale(0, 2e8, { count: 4, nice: false }));

  expect([0, 5e7, 1e8, 1.5e8, 2e8].map(write)).toStrictEqual([
    '0',
    '5e+7',
    '1e+8',
    '1.5e+8',
    '2e+8',
  ]);
});

test('an axis a chemist reads at a glance is left in plain digits', () => {
  const axis = spectrumAxis(0, 1000, 6);
  const write = axisLabeller(axis);

  expect(axis.values.map(write)).toStrictEqual([
    '0',
    '200',
    '400',
    '600',
    '800',
    '1000',
  ]);
});

test('a window whose digits are all behind zeros is written the same way', () => {
  const axis = spectrumAxis(0, 0.00005, 5);
  const write = axisLabeller(axis);

  expect(axis.values.map(write)).toStrictEqual([
    '0',
    '1e-5',
    '2e-5',
    '3e-5',
    '4e-5',
    '5e-5',
  ]);
});

test('a deep zoom keeps the decimals its step asked for', () => {
  const axis = spectrumAxis(0.4995, 0.5005, 6);

  expect(axis.values.map(axisLabeller(axis))).toStrictEqual([
    '0.4996',
    '0.4998',
    '0.5',
    '0.5002',
    '0.5004',
  ]);
});
