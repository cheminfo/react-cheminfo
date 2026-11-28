import { expect, test } from 'vitest';

import { DisjointSets } from '../disjointSets.ts';
import { limitedExp } from '../limitedExp.ts';

test('index sets join two at a time, each named by its smallest index', () => {
  const sets = new DisjointSets(6);

  expect(sets.union(4, 2)).toBe(true);
  expect(sets.union(2, 5)).toBe(true);
  expect(sets.union(5, 4)).toBe(false);
  expect(sets.find(5)).toBe(2);
  expect(sets.find(4)).toBe(2);
  expect(sets.find(3)).toBe(3);
  expect(sets.union(5, 0)).toBe(true);
  expect(sets.find(4)).toBe(0);
});

test('an exponential is carried on along its tangent past the bound', () => {
  expect(limitedExp(1)).toStrictEqual({ value: Math.E, slope: Math.E });

  const edge = Math.exp(80);

  expect(limitedExp(80)).toStrictEqual({ value: edge, slope: edge });
  expect(limitedExp(82)).toStrictEqual({ value: edge * 3, slope: edge });
  expect(limitedExp(12, 10)).toStrictEqual({
    value: Math.exp(10) * 3,
    slope: Math.exp(10),
  });
});
