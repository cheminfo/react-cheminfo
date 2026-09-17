import { expect, test } from 'vitest';

import {
  parallelIncludedMask,
  parallelKeptCount,
  parallelRangeKeeps,
} from '../parallelFilter.ts';
import type { ParallelAxis, ParallelRanges } from '../parallelTypes.ts';

const MW = Float64Array.from([100, 200, 300, 400]);
const LOGP = Float64Array.from([-1, 0, 1, 2]);
const AXES: ParallelAxis[] = [
  { id: 'mw', label: 'MW', values: MW },
  { id: 'logP', label: 'logP', values: LOGP },
];

test('both ends of an interval are kept', () => {
  expect(parallelRangeKeeps([0, 1], 0)).toBe(true);
  expect(parallelRangeKeeps([0, 1], 1)).toBe(true);
  expect(parallelRangeKeeps([0, 1], 1.0001)).toBe(false);
  expect(parallelRangeKeeps([0, 1], -0.0001)).toBe(false);
});

test('a value that is not a number is kept by no interval', () => {
  expect(parallelRangeKeeps([0, 1], Number.NaN)).toBe(false);
});

test('nothing brushed keeps every row', () => {
  expect([...parallelIncludedMask(AXES, {}, 4)]).toStrictEqual([1, 1, 1, 1]);
});

test('one brush keeps the rows inside it', () => {
  const ranges: ParallelRanges = { mw: [200, 300] };

  expect([...parallelIncludedMask(AXES, ranges, 4)]).toStrictEqual([
    0, 1, 1, 0,
  ]);
});

test('two brushes keep only the rows inside both', () => {
  const ranges: ParallelRanges = { mw: [200, 400], logP: [-1, 1] };
  const kept = parallelIncludedMask(AXES, ranges, 4);

  expect([...kept]).toStrictEqual([0, 1, 1, 0]);
  expect(parallelKeptCount(kept)).toBe(2);
});

test('an interval given the wrong way round still keeps its rows', () => {
  const ranges: ParallelRanges = { mw: [300, 200] };

  expect([...parallelIncludedMask(AXES, ranges, 4)]).toStrictEqual([
    0, 1, 1, 0,
  ]);
});

test('a cleared axis and an axis that is not drawn are both ignored', () => {
  const ranges: ParallelRanges = { mw: null, tpsa: [0, 1] };

  expect([...parallelIncludedMask(AXES, ranges, 4)]).toStrictEqual([
    1, 1, 1, 1,
  ]);
});

test('a row whose value is not known yet falls out of a brushed axis', () => {
  const values = Float64Array.from([1, Number.NaN, 3]);
  const axes: ParallelAxis[] = [{ id: 'score', label: 'Score', values }];

  expect([...parallelIncludedMask(axes, { score: [0, 10] }, 3)]).toStrictEqual([
    1, 0, 1,
  ]);
});

test('a row the column is too short for falls out of a brushed axis', () => {
  const axes: ParallelAxis[] = [
    { id: 'mw', label: 'MW', values: Float64Array.from([100, 200]) },
  ];

  expect([...parallelIncludedMask(axes, { mw: [0, 1000] }, 4)]).toStrictEqual([
    1, 1, 0, 0,
  ]);
});
