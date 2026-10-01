import { expect, test } from 'vitest';

import { logAxisBounds } from '../logAxisBounds.ts';

// Densities of period 3, in g/cm3, in the order a chart groups them by family.
const PERIOD_3 = [0.971, 1.738, 2.6, 2.3, 1.82, 2.067, 0.003, 0.0017];

// Crustal abundances in ppm, with a genuine zero for an element that does not
// occur in nature.
const ABUNDANCE = [461000, 282000, 1400, 0.0001, 3.5, 0];

test('the ends are the smallest and largest value, whatever their order', () => {
  expect(logAxisBounds(PERIOD_3)).toStrictEqual({ min: 0.0017, max: 2.6 });
});

test('a value that is not a number is passed over rather than poisoning the end', () => {
  expect(logAxisBounds([1, Number.NaN, 10, Infinity, 100])).toStrictEqual({
    min: 1,
    max: 100,
    tickValues: [1, 10, 100],
  });
});

test('an axis with nothing to draw is left to the library', () => {
  expect(logAxisBounds([])).toBeNull();
  expect(logAxisBounds([Number.NaN])).toBeNull();
});

test('a lone value is read against a zero rather than filling the axis', () => {
  expect(logAxisBounds([2.6])).toStrictEqual({ min: 0, max: 2.6 });
  expect(logAxisBounds([-4])).toStrictEqual({ min: -4, max: 0 });
  expect(logAxisBounds([0])).toStrictEqual({ min: -1, max: 1 });
});

test('a wide axis is ruled by decade, so its graduations do not pile up', () => {
  expect(logAxisBounds(ABUNDANCE)?.tickValues).toStrictEqual([
    0, 1, 10, 100, 1000, 10000, 100000,
  ]);
});

test('a narrow axis keeps the linear graduations, which read better there', () => {
  expect(logAxisBounds(PERIOD_3)?.tickValues).toBeUndefined();
});

test('nothing is written inside the linear region, where it would pile up', () => {
  // Under a symmetric log of constant 1 every value below 1 sits on the zero
  // line, so a graduation at 0.001 would land on the one at 0.01.
  const ticks = logAxisBounds([1e-6, 1e5])?.tickValues;

  expect(ticks?.[0]).toBe(1);
});

test('a true logarithmic axis has no such region, and is ruled right down', () => {
  const ticks = logAxisBounds([1e-6, 1e-3], { constant: 0 })?.tickValues;

  expect(ticks).toStrictEqual([1e-6, 1e-5, 1e-4, 1e-3]);
});

test('a very wide axis is thinned rather than smeared', () => {
  const ticks = logAxisBounds([1e-20, 1e20], { constant: 0 })?.tickValues;

  expect(ticks?.length).toBeLessThanOrEqual(10);
  expect(ticks?.[0]).toBe(1e-20);
});

test('a true logarithmic axis leaves out what it cannot place', () => {
  // A speciation diagram reaches zero asymptotically, and a log axis has no
  // room for a zero at all: the bottom comes from the smallest real amount.
  const bounds = logAxisBounds([0, 1e-7, 0.5, -3], {
    constant: 0,
    snapToDecades: true,
  });

  expect(bounds).toStrictEqual({
    min: 1e-7,
    max: 1,
    tickValues: [1e-7, 1e-6, 1e-5, 1e-4, 1e-3, 1e-2, 1e-1, 1],
  });
});

test('the ends snap outwards to whole decades, so the axis reads as round', () => {
  const bounds = logAxisBounds([0.0004, 2300], {
    constant: 0,
    snapToDecades: true,
  });

  expect(bounds?.min).toBe(1e-4);
  expect(bounds?.max).toBe(10000);
});

test('an axis with no meaningful bottom is given one', () => {
  // Fifteen decades of a species nobody is reading spends the whole height.
  const bounds = logAxisBounds([1e-30, 1], {
    constant: 0,
    snapToDecades: true,
    maxDecades: 12,
  });

  expect(bounds?.min).toBe(1e-12);
  expect(bounds?.max).toBe(1);
});

test('the graduations are stepped over rather than smeared', () => {
  const bounds = logAxisBounds([1e-15, 1], {
    constant: 0,
    snapToDecades: true,
    mostTicks: 9,
  });

  expect(bounds?.tickValues).toHaveLength(8);
});

test('a short true-logarithmic axis is still ruled by decade', () => {
  // The heuristic that hands a short axis back to the library is a symmetric-log
  // one: there the library has linear graduations to offer. Here every
  // graduation is a decade, and a caller formatting them as decades needs them.
  const bounds = logAxisBounds([0.3], { constant: 0, snapToDecades: true });

  expect(bounds).toStrictEqual({ min: 0.1, max: 1, tickValues: [0.1, 1] });
});
