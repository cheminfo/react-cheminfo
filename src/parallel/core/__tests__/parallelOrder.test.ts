import { expect, test } from 'vitest';

import type { ParallelAxisLayout } from '../parallelAxes.ts';
import { parallelAxisLayouts } from '../parallelAxes.ts';
import {
  parallelAxisOrder,
  parallelDropIndex,
  parallelMoveAxis,
} from '../parallelOrder.ts';

// Three axes over six hundred pixels, so they stand at 0, 300 and 600.
const LAYOUTS: ParallelAxisLayout[] = parallelAxisLayouts(
  [
    { id: 'mw', label: 'MW', values: Float64Array.from([1]), domain: [0, 1] },
    {
      id: 'logP',
      label: 'logP',
      values: Float64Array.from([1]),
      domain: [0, 1],
    },
    {
      id: 'logS',
      label: 'logS',
      values: Float64Array.from([1]),
      domain: [0, 1],
    },
  ],
  1,
  600,
  200,
);

test('the axes are reported by their ids, from left to right', () => {
  expect(parallelAxisOrder(LAYOUTS)).toStrictEqual(['mw', 'logP', 'logS']);
});

test('an axis takes the place it was dragged to, and the rest close up', () => {
  const order = ['mw', 'logP', 'logS'];

  expect(parallelMoveAxis(order, 0, 2)).toStrictEqual(['logP', 'logS', 'mw']);
  expect(parallelMoveAxis(order, 2, 0)).toStrictEqual(['logS', 'mw', 'logP']);
  expect(parallelMoveAxis(order, 1, 0)).toStrictEqual(['logP', 'mw', 'logS']);
});

test('a move that goes nowhere leaves the order alone', () => {
  const order = ['mw', 'logP', 'logS'];

  expect(parallelMoveAxis(order, 1, 1)).toStrictEqual(order);
  expect(parallelMoveAxis(order, 1, 3)).toStrictEqual(order);
  expect(parallelMoveAxis(order, -1, 1)).toStrictEqual(order);
  expect(parallelMoveAxis(order, 1, -1)).toStrictEqual(order);
});

test('a dragged name lands on the axis it was let go nearest', () => {
  expect(parallelDropIndex(0, LAYOUTS)).toBe(0);
  expect(parallelDropIndex(140, LAYOUTS)).toBe(0);
  expect(parallelDropIndex(160, LAYOUTS)).toBe(1);
  expect(parallelDropIndex(900, LAYOUTS)).toBe(2);
  expect(parallelDropIndex(-900, LAYOUTS)).toBe(0);
  expect(parallelDropIndex(0, [])).toBe(-1);
});
