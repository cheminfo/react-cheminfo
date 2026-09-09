import { expect, test } from 'vitest';

import {
  FIGURE_MAX_PIXELS,
  figurePixels,
  figureScaleFits,
  figureScaleLabel,
  formatFigurePixels,
} from '../figureScale.ts';

const FIGURE = { width: 640, height: 460 };

test('a figure saved at three times is three times the pixels', () => {
  expect(figurePixels(FIGURE, 3)).toStrictEqual({ width: 1920, height: 1380 });
});

test('a fractional size lands on whole pixels', () => {
  expect(figurePixels({ width: 200.4, height: 100.6 }, 1.5)).toStrictEqual({
    width: 301,
    height: 151,
  });
});

test('a multiple that makes no sense saves the figure at its own size', () => {
  expect(figurePixels(FIGURE, Number.NaN)).toStrictEqual({
    width: 640,
    height: 460,
  });
});

test('a multiple a browser could not paint is reported as not fitting', () => {
  const wide = { width: FIGURE_MAX_PIXELS / 2, height: 100 };

  expect(figureScaleFits(wide, 2)).toBe(true);
  expect(figureScaleFits(wide, 3)).toBe(false);
});

test('a multiple reads as a multiple, and a size as a measurement', () => {
  expect(figureScaleLabel(2)).toBe('2×');
  expect(formatFigurePixels({ width: 1280, height: 920 })).toBe(
    '1280 × 920 pixels',
  );
});
