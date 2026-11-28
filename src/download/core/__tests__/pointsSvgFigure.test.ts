import { expect, test } from 'vitest';

import { pointsSvgFigure } from '../pointsSvgFigure.ts';

test('a size stated to the hundredth of a point keeps its decimals in pixels, whatever the viewBox', () => {
  const svg = '<svg width="99.49pt" height="74.88pt" viewBox="0 0 1 1">';

  expect(pointsSvgFigure(svg)).toStrictEqual({
    markup: svg,
    width: expect.closeTo(132.6533, 4),
    height: expect.closeTo(99.84, 4),
  });
});

test('a drawing of 72 × 36 points is 96 × 48 pixels of the page', () => {
  const svg = '<svg width="72pt" height="36pt" viewBox="0 0 72 36"></svg>';

  expect(pointsSvgFigure(svg)).toStrictEqual({
    markup: svg,
    width: 96,
    height: 48,
  });
});
