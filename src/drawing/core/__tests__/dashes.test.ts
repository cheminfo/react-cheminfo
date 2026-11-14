import { expect, test } from 'vitest';

import { LINE_DASHES, isLineDash } from '../dashes.ts';

test('a pattern read from a file is kept only when it is one of ours', () => {
  expect(isLineDash('dash-dot')).toBe(true);
  expect(isLineDash(true)).toBe(true);
  expect(isLineDash(false)).toBe(true);
  expect(isLineDash('zigzag')).toBe(false);
  expect(isLineDash(2)).toBe(false);
});

test('the patterns are offered solid first, then plain dashes, then the named ones', () => {
  expect(LINE_DASHES.map((dash) => dash.value)).toStrictEqual([
    false,
    true,
    'short',
    'long',
    'dotted',
    'dash-dot',
    'dash-dot-dot',
    'long-dash-dot',
  ]);
});
