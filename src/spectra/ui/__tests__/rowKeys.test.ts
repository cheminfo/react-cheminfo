import { expect, test } from 'vitest';

import { fitKeys, nextKey } from '../rowKeys.ts';

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
