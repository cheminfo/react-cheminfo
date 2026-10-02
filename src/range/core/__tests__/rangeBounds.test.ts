import { expect, test } from 'vitest';

import type { RangeDomain } from '../rangeBounds.ts';
import {
  OPEN_RANGE,
  isRangeBounded,
  isRangeDomain,
  movedRange,
  rangeHandles,
  sameRange,
  settleHandles,
} from '../rangeBounds.ts';

const YEARS: RangeDomain = [1970, 2026];

test('an open side stands at the end of the track', () => {
  expect(rangeHandles(OPEN_RANGE, YEARS)).toStrictEqual([1970, 2026]);
  expect(rangeHandles({ min: 1990, max: null }, YEARS)).toStrictEqual([
    1990, 2026,
  ]);
});

test('a bound past the track is held at its end, and a reversed one is put in order', () => {
  expect(rangeHandles({ min: 1900, max: 2100 }, YEARS)).toStrictEqual([
    1970, 2026,
  ]);
  expect(rangeHandles({ min: 2010, max: 1990 }, YEARS)).toStrictEqual([
    1990, 2010,
  ]);
});

test('a handle taken to the end of the track opens its side', () => {
  const from = { min: 1990, max: 2000 };

  expect(movedRange(from, [1970, 2000], YEARS)).toStrictEqual({
    min: null,
    max: 2000,
  });
  expect(movedRange(from, [1990, 2026], YEARS)).toStrictEqual({
    min: 1990,
    max: null,
  });
  expect(movedRange(from, [1995, 2005], YEARS)).toStrictEqual({
    min: 1995,
    max: 2005,
  });
});

test('an untouched handle keeps a bound that lies past the track', () => {
  // 1900 sits at the low end of the track, which would otherwise read as open.
  const from = { min: 1900, max: null };

  expect(movedRange(from, [1970, 2010], YEARS)).toStrictEqual({
    min: 1900,
    max: 2010,
  });
});

test('dragging snaps the moved handle onto the grid and leaves the other alone', () => {
  const from = { min: 1.23, max: null };
  const domain: RangeDomain = [0, 10];

  expect(settleHandles([1.23, 7.26], from, 0.5, domain)).toStrictEqual([
    1.23, 7.5,
  ]);
  expect(
    settleHandles([0.30000000000000004, 10], OPEN_RANGE, 0.1, domain),
  ).toStrictEqual([0.3, 10]);
});

test('a track end off the grid is still reachable', () => {
  const domain: RangeDomain = [0, 2026.5];

  expect(
    settleHandles([0, 2026.5], { min: 3, max: 4 }, 1, domain),
  ).toStrictEqual([0, 2026.5]);
  expect(
    settleHandles([0, 2026.4], { min: 3, max: 4 }, 1, domain),
  ).toStrictEqual([0, 2026]);
});

test('a range is bounded when either side is', () => {
  expect(isRangeBounded(OPEN_RANGE)).toBe(false);
  expect(isRangeBounded({ min: 0, max: null })).toBe(true);
  expect(isRangeBounded({ min: null, max: 5 })).toBe(true);
});

test('two ranges are the same only when both sides agree', () => {
  expect(sameRange({ min: 1, max: null }, { min: 1, max: null })).toBe(true);
  expect(sameRange({ min: 1, max: null }, { min: 1, max: 2 })).toBe(false);
  expect(sameRange({ min: null, max: 2 }, { min: 0, max: 2 })).toBe(false);
});

test('a track needs two finite ends, the high one above the low', () => {
  expect(isRangeDomain([0, 1])).toBe(true);
  expect(isRangeDomain([0, 0])).toBe(false);
  expect(isRangeDomain([5, 1])).toBe(false);
  expect(isRangeDomain([0, Number.POSITIVE_INFINITY])).toBe(false);
  expect(isRangeDomain([Number.NaN, 1])).toBe(false);
});
