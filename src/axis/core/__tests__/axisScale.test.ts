import { expect, test } from 'vitest';

import { isAxisScale, resolveAxisScale } from '../axisScale.ts';

test('an axis nobody has touched is read the way its quantity is read', () => {
  expect(resolveAxisScale('log', null)).toBe('log');
  expect(resolveAxisScale('linear', null)).toBe('linear');
});

test('what the reader chose overrules the quantity, both ways', () => {
  expect(resolveAxisScale('log', 'linear')).toBe('linear');
  expect(resolveAxisScale('linear', 'log')).toBe('log');
});

test('a scale off a link is only one of the two', () => {
  expect(isAxisScale('log')).toBe(true);
  expect(isAxisScale('linear')).toBe(true);
  expect(isAxisScale('logarithmic')).toBe(false);
  expect(isAxisScale('')).toBe(false);
});
