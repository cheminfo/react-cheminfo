import { expect, test } from 'vitest';

import {
  parallelHasRange,
  parallelMergeRanges,
  parallelRangeList,
  parallelWriteRange,
} from '../parallelSelection.ts';

test('a bare interval and a list of one mean the same thing', () => {
  expect(parallelRangeList([0, 1])).toStrictEqual([[0, 1]]);
  expect(parallelRangeList([[0, 1]])).toStrictEqual([[0, 1]]);
  expect(parallelRangeList(null)).toStrictEqual([]);
  expect(parallelRangeList(undefined)).toStrictEqual([]);
  expect(parallelRangeList([])).toStrictEqual([]);
});

test('an axis keeping an empty list keeps nothing', () => {
  expect(parallelHasRange([])).toBe(false);
  expect(parallelHasRange(null)).toBe(false);
  expect(parallelHasRange([0, 1])).toBe(true);
  expect(parallelHasRange([[0, 1]])).toBe(true);
});

test('intervals come back sorted, with the overlapping ones joined', () => {
  expect(
    parallelMergeRanges([
      [60, 160],
      [10, 30],
    ]),
  ).toStrictEqual([
    [10, 30],
    [60, 160],
  ]);
  expect(
    parallelMergeRanges([
      [10, 80],
      [60, 160],
    ]),
  ).toStrictEqual([[10, 160]]);
  // Two that touch at a point are one interval drawn twice.
  expect(
    parallelMergeRanges([
      [10, 60],
      [60, 160],
    ]),
  ).toStrictEqual([[10, 160]]);
  // One swallowed whole by another leaves the wider one alone.
  expect(
    parallelMergeRanges([
      [10, 160],
      [60, 80],
    ]),
  ).toStrictEqual([[10, 160]]);
  expect(parallelMergeRanges([])).toStrictEqual([]);
});

test('an interval written backwards is read the way every filter reads it', () => {
  expect(parallelMergeRanges([[160, 60]])).toStrictEqual([[60, 160]]);
});

test('one interval is replaced, added or taken away without touching the rest', () => {
  const list = [
    [10, 30],
    [60, 160],
  ] as const;

  expect(parallelWriteRange(list, 0, [0, 5])).toStrictEqual([
    [0, 5],
    [60, 160],
  ]);
  expect(parallelWriteRange(list, -1, [200, 220])).toStrictEqual([
    [10, 30],
    [60, 160],
    [200, 220],
  ]);
  expect(parallelWriteRange(list, 1, null)).toStrictEqual([[10, 30]]);
  expect(parallelWriteRange(list, 0, [20, 70])).toStrictEqual([[20, 160]]);
});
