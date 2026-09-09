import { expect, test } from 'vitest';

import { fitKeys, nextKey, reorder } from '../rowKeys.ts';

test('a new key is one past the highest in use, so no row inherits the box of another', () => {
  expect(nextKey([])).toBe(0);
  expect(nextKey([0, 1, 2])).toBe(3);
  expect(nextKey([7, 2, 5])).toBe(8);
});

test('keys grow to match a list that gained rows elsewhere', () => {
  expect(fitKeys([0, 1], 4)).toStrictEqual([0, 1, 2, 3]);
});

test('keys shrink to match a list that lost rows elsewhere', () => {
  expect(fitKeys([3, 4, 5, 6], 2)).toStrictEqual([3, 4]);
});

test('a list that did not change keeps every key it had', () => {
  expect(fitKeys([9, 4, 1], 3)).toStrictEqual([9, 4, 1]);
});

test('an entry moves to its new position and the rest close up behind it', () => {
  expect(reorder(['a', 'b', 'c'], 0, 2)).toStrictEqual(['b', 'c', 'a']);
  expect(reorder(['a', 'b', 'c'], 2, 0)).toStrictEqual(['c', 'a', 'b']);
});

test('moving an entry that is not there leaves the list as it was', () => {
  expect(reorder(['a', 'b'], 5, 0)).toStrictEqual(['a', 'b']);
});
