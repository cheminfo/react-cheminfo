import { expect, test } from 'vitest';

import {
  BIN_LOG_FLOOR,
  atLeastSpan,
  binAt,
  binSteps,
  binsInWindow,
} from '../binSteps.ts';

const EDGES = Float64Array.from([0, 10, 20, 30, 40]);
const COUNTS = Uint32Array.from([5, 0, 100, 1]);

test('a window shows the bins that overlap it, even in part', () => {
  expect([
    binsInWindow(EDGES, [0, 40]),
    binsInWindow(EDGES, [12, 25]),
    binsInWindow(EDGES, [10, 20]),
    binsInWindow(EDGES, [41, 50]),
  ]).toStrictEqual([
    { first: 0, last: 3 },
    { first: 1, last: 2 },
    { first: 1, last: 1 },
    { first: 4, last: 3 },
  ]);
});

test('a value lies in the bin whose low edge is at or below it', () => {
  expect(
    [0, 9.99, 10, 39.9, 40, -1].map((value) => binAt(EDGES, value)),
  ).toStrictEqual([0, 0, 1, 3, -1, -1]);
});

test('the bins are one stepped area, linear or log, an empty bin on the log floor', () => {
  const linear = binSteps(
    { edges: EDGES, counts: COUNTS },
    { first: 1, last: 2 },
    'linear',
  );
  const log = binSteps(
    { edges: EDGES, counts: COUNTS },
    { first: 0, last: 3 },
    'log',
  );

  expect([[...linear.x], [...linear.y], linear.peak]).toStrictEqual([
    [10, 20, 20, 30],
    [0, 0, 100, 100],
    100,
  ]);
  expect([[...log.y], log.peak]).toStrictEqual([
    [Math.log10(5), Math.log10(5), BIN_LOG_FLOOR, BIN_LOG_FLOOR, 2, 2, 0, 0],
    2,
  ]);
  expect(
    binSteps({ edges: EDGES, counts: COUNTS }, { first: 4, last: 3 }, 'linear')
      .peak,
  ).toBe(1);
});

test('a window narrower than the narrowest is widened about its middle, inside the whole range', () => {
  expect([
    atLeastSpan([10, 30], 4, [0, 40]),
    atLeastSpan([20, 21], 4, [0, 40]),
    atLeastSpan([0, 1], 4, [0, 40]),
    atLeastSpan([39, 40], 4, [0, 40]),
    atLeastSpan([1, 2], 80, [0, 40]),
  ]).toStrictEqual([
    [10, 30],
    [18.5, 22.5],
    [0, 4],
    [36, 40],
    [0, 40],
  ]);
});
