import { expect, test } from 'vitest';

import { cornerRadius, lineDash, visibleColor } from '../cssPaint.ts';

test('a colour the page paints nothing with is no colour', () => {
  expect(visibleColor('rgba(0, 0, 0, 0)')).toBeUndefined();
  expect(visibleColor('transparent')).toBeUndefined();
  expect(visibleColor('rgb(10 20 30 / 0)')).toBeUndefined();
  expect(visibleColor('color(srgb 1 0 0 / 0)')).toBeUndefined();
  expect(visibleColor('')).toBeUndefined();
});

test('a colour that is painted is kept as written', () => {
  // A blue of zero is not an alpha of zero.
  expect(visibleColor('rgb(10, 20, 0)')).toBe('rgb(10, 20, 0)');
  expect(visibleColor('rgba(255, 255, 255, 0.55)')).toBe(
    'rgba(255, 255, 255, 0.55)',
  );
  expect(visibleColor(' #123456 ')).toBe('#123456');
});

test('a line style becomes its dashes, or no line at all', () => {
  expect(lineDash('solid', 2)).toStrictEqual([]);
  expect(lineDash('dashed', 1)).toStrictEqual([3, 3]);
  expect(lineDash('dotted', 2)).toStrictEqual([2, 2]);
  expect(lineDash('none', 3)).toBeUndefined();
  expect(lineDash('hidden', 3)).toBeUndefined();
  expect(lineDash('solid', 0)).toBeUndefined();
  expect(lineDash('solid', Number.NaN)).toBeUndefined();
});

test('a focus ring is the pointer, not the figure', () => {
  expect(lineDash('auto', 2)).toBeUndefined();
});

test('a corner is read in pixels, or as a share of the shorter side', () => {
  expect(cornerRadius('3px', 40, 50)).toBe(3);
  expect(cornerRadius('50%', 40, 50)).toBe(20);
  expect(cornerRadius('0px', 40, 50)).toBe(0);
  expect(cornerRadius('', 40, 50)).toBe(0);
});
