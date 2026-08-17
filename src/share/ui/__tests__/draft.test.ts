import { expect, test } from 'vitest';

import { withPart } from '../draft.ts';

test('a part switched off joins the ones the draft already switches off', () => {
  expect(withPart(['menu'], 'hints', true)).toStrictEqual(['menu', 'hints']);
});

test('a part switched back on leaves the rest as they were', () => {
  expect(withPart(['menu', 'hints', 'answers'], 'hints', false)).toStrictEqual([
    'menu',
    'answers',
  ]);
});

test('a part switched off twice is still named once', () => {
  expect(withPart(['menu', 'hints'], 'hints', true)).toStrictEqual([
    'menu',
    'hints',
  ]);
});

test('switching on a part the draft never switched off changes nothing', () => {
  expect(withPart(['menu'], 'answers', false)).toStrictEqual(['menu']);
  expect(withPart([], 'answers', false)).toStrictEqual([]);
});
