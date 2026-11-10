/**
 * A scale and a turn about a pivot, as the handles of a selection frame make
 * them, landing on coordinates a file stores.
 */

import { expect, test } from 'vitest';

import { pointMap } from '../transform.ts';

test('a quarter turn doubled about a pivot lands on rounded coordinates', () => {
  const map = pointMap({ pivot: { x: 1, y: 1 }, scale: 2, rotation: 90 });

  expect(map({ x: 2, y: 1 })).toStrictEqual({ x: 1, y: 3 });
  expect(map({ x: 1, y: 2 })).toStrictEqual({ x: -1, y: 1 });
  expect(map({ x: 1, y: 1 })).toStrictEqual({ x: 1, y: 1 });
});

test('no turn and no scale still rounds to a hundredth of a point', () => {
  const map = pointMap({ pivot: { x: 0, y: 0 }, scale: 1, rotation: 0 });

  expect(map({ x: 1.234, y: -5.678 })).toStrictEqual({ x: 1.23, y: -5.68 });

  const third = pointMap({ pivot: { x: 0, y: 0 }, scale: 1, rotation: 30 });

  expect(third({ x: 10, y: 0 })).toStrictEqual({ x: 8.66, y: 5 });
});
