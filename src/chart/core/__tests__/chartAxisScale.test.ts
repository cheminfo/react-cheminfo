import { expect, test } from 'vitest';

import {
  chartAxisScale,
  chartExponentSuffix,
  chartNiceDomain,
  chartTickDecimals,
  chartTickLabel,
} from '../chartAxisScale.ts';

test('a unit axis is divided in fifths', () => {
  expect(chartAxisScale(0, 1)).toStrictEqual({
    domain: [0, 1],
    values: [0, 0.2, 0.4, 0.6, 0.8, 1],
    step: 0.2,
    decimals: 1,
    exponent: 0,
    labels: ['0.0', '0.2', '0.4', '0.6', '0.8', '1.0'],
  });
});

test('a column of pca scores ends on whole numbers either side of zero', () => {
  expect(chartAxisScale(-2.7651, 3.2996, { count: 5 })).toStrictEqual({
    domain: [-3, 4],
    values: [-3, -2, -1, 0, 1, 2, 3, 4],
    step: 1,
    decimals: 0,
    exponent: 0,
    labels: ['-3', '-2', '-1', '0', '1', '2', '3', '4'],
  });
});

test('a loadings axis is nudged out to a whole step so it ends on a label', () => {
  expect(chartAxisScale(-0.5, 0.5, { count: 5 })).toStrictEqual({
    domain: [-0.6, 0.6],
    values: [-0.6, -0.4, -0.2, 0, 0.2, 0.4, 0.6],
    step: 0.2,
    decimals: 1,
    exponent: 0,
    labels: ['-0.6', '-0.4', '-0.2', '0.0', '0.2', '0.4', '0.6'],
  });
});

test('a share that must end at 100% keeps the domain it was given', () => {
  expect(chartAxisScale(0, 100, { nice: false })).toStrictEqual({
    domain: [0, 100],
    values: [0, 20, 40, 60, 80, 100],
    step: 20,
    decimals: 0,
    exponent: 0,
    labels: ['0', '20', '40', '60', '80', '100'],
  });
});

test('an axis that never reaches zero is not dragged down to it', () => {
  expect(chartAxisScale(-8, -1)).toStrictEqual({
    domain: [-8, -1],
    values: [-8, -7, -6, -5, -4, -3, -2, -1],
    step: 1,
    decimals: 0,
    exponent: 0,
    labels: ['-8', '-7', '-6', '-5', '-4', '-3', '-2', '-1'],
  });
});

test('a nanometre-scale axis lifts its power of ten into the title', () => {
  const axis = chartAxisScale(0, 1e-9, { count: 5 });

  expect(axis).toStrictEqual({
    domain: [0, 1e-9],
    values: [0, 2e-10, 4e-10, 6e-10, 8e-10, 1e-9],
    step: 2e-10,
    decimals: 1,
    exponent: -9,
    labels: ['0.0', '0.2', '0.4', '0.6', '0.8', '1.0'],
  });
  expect(chartExponentSuffix(axis.exponent)).toBe(' (\u00D710\u207B\u2079)');
});

test('a tiny axis about zero keeps its sign through the lifted factor', () => {
  expect(chartAxisScale(-1e-9, 1e-9)).toStrictEqual({
    domain: [-1e-9, 1e-9],
    values: [-1e-9, -5e-10, 0, 5e-10, 1e-9],
    step: 5e-10,
    decimals: 1,
    exponent: -9,
    labels: ['-1.0', '-0.5', '0.0', '0.5', '1.0'],
  });
});

test('an axis in the tens of millions is written in units of ten million', () => {
  expect(chartAxisScale(0, 2.5e7)).toStrictEqual({
    domain: [0, 2.5e7],
    values: [0, 5e6, 1e7, 1.5e7, 2e7, 2.5e7],
    step: 5e6,
    decimals: 1,
    exponent: 7,
    labels: ['0.0', '0.5', '1.0', '1.5', '2.0', '2.5'],
  });
});

test('a step below one divides, so the ticks are exact and the step is not a difference', () => {
  const axis = chartAxisScale(0.1, 0.3, { count: 4 });

  expect(axis).toStrictEqual({
    domain: [0.1, 0.3],
    values: [0.1, 0.15, 0.2, 0.25, 0.3],
    step: 0.05,
    decimals: 2,
    exponent: 0,
    labels: ['0.10', '0.15', '0.20', '0.25', '0.30'],
  });
  expect(axis.values[2]).toBe(0.2);
  expect(axis.step).not.toBe(0.049_999_999_999_999_996);
});

test('a constant column is opened by 5% either side so it still draws', () => {
  expect(chartAxisScale(72.96, 72.96)).toStrictEqual({
    domain: [68, 78],
    values: [68, 70, 72, 74, 76, 78],
    step: 2,
    decimals: 0,
    exponent: 0,
    labels: ['68', '70', '72', '74', '76', '78'],
  });
});

test('a column of zeros has no width to widen, so it takes a unit either side', () => {
  expect(chartAxisScale(0, 0)).toStrictEqual({
    domain: [-1, 1],
    values: [-1, -0.5, 0, 0.5, 1],
    step: 0.5,
    decimals: 1,
    exponent: 0,
    labels: ['-1.0', '-0.5', '0.0', '0.5', '1.0'],
  });
});

test('ten principal components are counted one by one', () => {
  expect(chartAxisScale(1, 10, { count: 10 })).toStrictEqual({
    domain: [1, 10],
    values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    step: 1,
    decimals: 0,
    exponent: 0,
    labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
  });
});

test('the two ends are read in either order', () => {
  expect(chartAxisScale(10, 0)).toStrictEqual(chartAxisScale(0, 10));
  expect(chartAxisScale(10, 0).values).toStrictEqual([0, 2, 4, 6, 8, 10]);
});

test('a range holding a value that is not finite falls back to 0..1', () => {
  const unit = chartAxisScale(0, 1);

  expect(chartAxisScale(Number.NaN, 5)).toStrictEqual(unit);
  expect(chartAxisScale(0, Number.POSITIVE_INFINITY)).toStrictEqual(unit);
  expect(chartAxisScale(Number.NaN, Number.NaN)).toStrictEqual(unit);
});

test('a scatter-matrix cell asks for three ticks and is given whole ones', () => {
  expect(chartAxisScale(4.3, 7.9, { count: 3 })).toStrictEqual({
    domain: [4, 8],
    values: [4, 5, 6, 7, 8],
    step: 1,
    decimals: 0,
    exponent: 0,
    labels: ['4', '5', '6', '7', '8'],
  });
});

test('a domain is widened outward until both ends land on a whole step', () => {
  expect(chartNiceDomain(-0.5, 0.5)).toStrictEqual([-0.6, 0.6]);
  expect(chartNiceDomain(3.2, 7.9, 4)).toStrictEqual([3, 8]);
  expect(chartNiceDomain(7.9, 3.2, 4)).toStrictEqual([3, 8]);
  expect(chartNiceDomain(5, 5)).toStrictEqual([4.7, 5.3]);
});

test('the decimals a label carries are the step and nothing more', () => {
  expect(chartTickDecimals(0.05)).toBe(2);
  expect(chartTickDecimals(0.2)).toBe(1);
  expect(chartTickDecimals(1)).toBe(0);
  expect(chartTickDecimals(20)).toBe(0);
  expect(chartTickDecimals(2e-10)).toBe(10);
});

test('a negative zero is written as the zero a reader expects at an origin', () => {
  expect(chartTickLabel(-0, 1)).toBe('0.0');
  expect(chartTickLabel(0, 1)).toBe('0.0');
  expect(chartTickLabel(-0.6, 1)).toBe('-0.6');
  expect(chartTickLabel(2e-10, 1, -9)).toBe('0.2');
  expect(chartTickLabel(Number.NaN, 2)).toBe('–');
});

test('the factor the labels were divided by is written into the title', () => {
  expect(chartExponentSuffix(0)).toBe('');
  expect(chartExponentSuffix(-9)).toBe(' (×10⁻⁹)');
  expect(chartExponentSuffix(7)).toBe(' (×10⁷)');
  expect(chartExponentSuffix(-12)).toBe(' (×10⁻¹²)');
  expect(chartExponentSuffix(Number.NaN)).toBe('');
});
