/**
 * The bar of a drawing editor, read off a link the way draw and glassware
 * read it: kept within its range, and `split=100` hiding the panels.
 */

import { expect, test } from 'vitest';

import { SPLIT_CLOSED, closableSplitParam } from '../../../split/core/split.ts';
import { DRAWING_SPLIT } from '../editorRouter.ts';

test('a drawing editor gives the drawing 72 % of its row, dragged between 50 and 85 %', () => {
  const codec = closableSplitParam(DRAWING_SPLIT);

  expect(DRAWING_SPLIT).toStrictEqual({ ratio: 72, min: 50, max: 85 });
  expect(codec.parse('95')).toBe(85);
  expect(codec.parse('30')).toBe(50);
  expect(codec.parse(String(SPLIT_CLOSED))).toBe(SPLIT_CLOSED);
  expect(codec.serialize(SPLIT_CLOSED)).toBe('100');
});
