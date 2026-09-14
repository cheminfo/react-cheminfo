import { expect, test } from 'vitest';

import { chartGroupIndex } from '../chartGroups.ts';

test('a whole index inside the range is its group, and a fraction is read by its whole part', () => {
  const groupOf = [0, 2, 1.9, 0.2];

  expect(chartGroupIndex(groupOf, 0, 3)).toBe(0);
  expect(chartGroupIndex(groupOf, 1, 3)).toBe(2);
  expect(chartGroupIndex(groupOf, 2, 3)).toBe(1);
  expect(chartGroupIndex(groupOf, 3, 3)).toBe(0);
});

test('a padded, negative, infinite or out-of-range entry belongs to no group', () => {
  const groupOf = Float64Array.from([
    -1,
    Number.NaN,
    3,
    Number.POSITIVE_INFINITY,
  ]);

  expect(chartGroupIndex(groupOf, 0, 3)).toBe(-1);
  expect(chartGroupIndex(groupOf, 1, 3)).toBe(-1);
  expect(chartGroupIndex(groupOf, 2, 3)).toBe(-1);
  expect(chartGroupIndex(groupOf, 3, 3)).toBe(-1);
});

test('a row past the end, or no grouping at all, belongs to no group', () => {
  expect(chartGroupIndex([0, 1], 2, 2)).toBe(-1);
  expect(chartGroupIndex(undefined, 0, 2)).toBe(-1);
  expect(chartGroupIndex([0], 0, 0)).toBe(-1);
});
