import { expect, test } from 'vitest';

import { MARGIN, SHARED_AXIS_MARGIN } from '../chartGeometry.ts';
import {
  FOOT_FURNITURE,
  FOOT_MINIMUM,
  SPLITTER,
  STACKED_MINIMUM,
  STACK_LIMIT,
  stackCapacity,
  stackShares,
} from '../stackCapacity.ts';

test('the floors are the ones the stack itself keeps, restated here', () => {
  expect(STACKED_MINIMUM).toBe(90);
  // The *difference* between what the foot pays for furniture and what a pane
  // above it pays, which is what has to be handed back for the plots to match.
  expect(FOOT_FURNITURE).toBe(MARGIN.bottom - SHARED_AXIS_MARGIN);
  expect(FOOT_FURNITURE).toBe(26);
  expect(FOOT_MINIMUM).toBe(116);
  expect(SPLITTER).toBe(10);
  expect(STACK_LIMIT).toBe(6);
});

test('a column too short for even one pane still holds one', () => {
  expect(stackCapacity(0)).toBe(1);
  expect(stackCapacity(100)).toBe(1);
  expect(stackCapacity(115)).toBe(1);
  expect(stackCapacity(116)).toBe(1);
});

test('a column holds the panes its floors and splitters leave room for', () => {
  expect(stackCapacity(216)).toBe(2);
  expect(stackCapacity(316)).toBe(3);
  expect(stackCapacity(416)).toBe(4);
  expect(stackCapacity(616)).toBe(6);
});

test('a pixel short of a pane is a pane fewer', () => {
  expect(stackCapacity(215)).toBe(1);
  expect(stackCapacity(315)).toBe(2);
  expect(stackCapacity(415)).toBe(3);
});

test('a tall column is capped by the limit rather than by its height', () => {
  expect(stackCapacity(900)).toBe(6);
  expect(stackCapacity(5000)).toBe(6);
});

test('the capacity at the heights a stack is actually given', () => {
  expect(stackCapacity(300)).toBe(2);
  expect(stackCapacity(400)).toBe(3);
  expect(stackCapacity(600)).toBe(5);
  expect(stackCapacity(900)).toBe(6);
});

test('a lone pane takes the whole height, floor and all', () => {
  expect(stackShares(700, 1)).toStrictEqual([700]);
  expect(stackShares(42, 1)).toStrictEqual([42]);
});

test('the shares sum to exactly the height they were given', () => {
  expect(stackShares(648, 4)).toStrictEqual([155, 155, 155, 183]);
  expect(sumOf(stackShares(648, 4))).toBe(648);
});

test('an uneven division still sums exactly, the remainder on the foot', () => {
  expect(stackShares(500, 3)).toStrictEqual([158, 158, 184]);
  expect(sumOf(stackShares(500, 3))).toBe(500);
  expect(stackShares(851, 5)).toStrictEqual([165, 165, 165, 165, 191]);
  expect(sumOf(stackShares(851, 5))).toBe(851);
});

test('the tightest stack lands exactly on both floors at once', () => {
  expect(stackShares(206, 2)).toStrictEqual([STACKED_MINIMUM, FOOT_MINIMUM]);
  expect(stackShares(296, 3)).toStrictEqual([
    STACKED_MINIMUM,
    STACKED_MINIMUM,
    FOOT_MINIMUM,
  ]);
  expect(sumOf(stackShares(296, 3))).toBe(296);
});

test('the foot pane is taller than the ones above it by exactly its furniture', () => {
  const stacked = 150;

  expect(stackShares(626, 4)).toStrictEqual([
    stacked,
    stacked,
    stacked,
    stacked + FOOT_FURNITURE,
  ]);
  expect(MARGIN.bottom).toBe(34);
  expect(SHARED_AXIS_MARGIN).toBe(8);
});

test('a height short of what the count needs keeps the floors, not the sum', () => {
  expect(stackShares(200, 3)).toStrictEqual([90, 90, 116]);
  expect(sumOf(stackShares(200, 3))).toBe(296);
});

test('a count that is not a whole pane is no panes at all', () => {
  expect(stackShares(600, 0)).toStrictEqual([]);
  expect(stackShares(600, -2)).toStrictEqual([]);
  expect(stackShares(600, 2.5)).toStrictEqual([]);
});

test('a column measured, counted and then shared out comes back whole', () => {
  const column = 600;
  const count = stackCapacity(column);

  expect(count).toBe(5);

  const room = column - (count - 1) * SPLITTER;
  const shares = stackShares(room, count);

  expect(shares).toStrictEqual([106, 106, 106, 106, 136]);
  expect(sumOf(shares) + (count - 1) * SPLITTER).toBe(column);
});

test('a column filled to the limit still clears every floor', () => {
  const column = 638;
  const count = stackCapacity(column);

  expect(count).toBe(STACK_LIMIT);

  const shares = stackShares(column - (count - 1) * SPLITTER, count);

  expect(shares).toStrictEqual([93, 93, 93, 93, 93, 123]);
});

/**
 * Add the shares up, so the exact-sum assertions read as one number.
 * @param shares - The heights `stackShares` handed back.
 * @returns Their total, in pixels.
 */
function sumOf(shares: readonly number[]): number {
  let total = 0;
  for (const share of shares) {
    total += share;
  }
  return total;
}
