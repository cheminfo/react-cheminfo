import { expect, test } from 'vitest';

import { parallelTicks } from '../parallelTicks.ts';
import type { ParallelAxis } from '../parallelTypes.ts';

const COLUMN = new Float64Array(0);

test('an axis carries five evenly spaced graduations', () => {
  const { ticks } = parallelTicks(axis(), 0, 500);

  expect(ticks).toStrictEqual([
    { value: 0, label: '0' },
    { value: 125, label: '125' },
    { value: 250, label: '250' },
    { value: 375, label: '375' },
    { value: 500, label: '500' },
  ]);
});

test('a caller formatter is used as written', () => {
  const { ticks } = parallelTicks(
    { ...axis(), format: (value) => value.toFixed(2) },
    0,
    500,
  );

  expect(labels(ticks)).toStrictEqual([
    '0.00',
    '125.00',
    '250.00',
    '375.00',
    '500.00',
  ]);
});

test('a graduation repeating the label of the one below it is dropped', () => {
  const { ticks } = parallelTicks(
    { ...axis(), format: (value) => value.toFixed(0) },
    0,
    2,
  );

  expect(labels(ticks)).toStrictEqual(['0', '1', '2']);
  expect(ticks).toHaveLength(3);
});

test('the default labels carry the decimals the spacing needs, and no more', () => {
  expect(labels(parallelTicks(axis(), 12.3, 157.01).ticks)).toStrictEqual([
    '12',
    '48',
    '85',
    '121',
    '157',
  ]);
});

test('a graduation is never rounded away from its own value', () => {
  // A whole-number spacing whose marks sit on halves: rounding to no decimals
  // would write 0.5 as `1`, which is a mark the axis does not carry.
  expect(labels(parallelTicks(axis(), -1.5, 2.5).ticks)).toStrictEqual([
    '-1.5',
    '-0.5',
    '0.5',
    '1.5',
    '2.5',
  ]);
});

test('the caller writes the graduations of a coded quantity itself', () => {
  const written = [
    { value: 0, label: 'none' },
    { value: 1, label: 'low' },
    { value: 2, label: 'high' },
  ];
  const { domain, ticks } = parallelTicks(
    { ...axis(), domain: [0, 2], ticks: written },
    0,
    2,
  );

  expect(ticks).toStrictEqual(written);
  expect(domain).toStrictEqual([0, 2]);
});

test('asking for round numbers moves both ends of the axis', () => {
  const { domain, ticks } = parallelTicks({ ...axis(), nice: true }, -1.5, 2.5);

  expect(domain).toStrictEqual([-2, 3]);
  expect(labels(ticks)).toStrictEqual(['-2', '-1', '0', '1', '2', '3']);
});

test('the number of graduations is the caller s to ask for', () => {
  const { ticks } = parallelTicks({ ...axis(), tickCount: 3 }, 0, 100);

  expect(labels(ticks)).toStrictEqual(['0', '50', '100']);
});

test('a logarithmic axis is graduated by decades', () => {
  const { ticks } = parallelTicks({ ...axis(), scale: 'log' }, 1, 10_000);

  expect(labels(ticks)).toStrictEqual(['1', '10', '100', '1,000', '10,000']);
});

function axis(): ParallelAxis {
  return { id: 'mw', label: 'MW', values: COLUMN };
}

function labels(ticks: ReadonlyArray<{ label: string }>): string[] {
  const found: string[] = [];
  for (const tick of ticks) found.push(tick.label);
  return found;
}
