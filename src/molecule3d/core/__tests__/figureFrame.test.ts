import { expect, test } from 'vitest';

import { FIGURE_LONGEST_SIDE, figureFrame } from '../figureFrame.ts';

test('a molecule larger than a figure is rendered in a smaller frame, keeping the viewer’s shape', () => {
  expect(
    figureFrame(
      { width: 5120, height: 2602 },
      { x: 0.3, y: 0.09, width: 0.4, height: 0.75 },
      FIGURE_LONGEST_SIDE,
    ),
  ).toStrictEqual({
    width: 4800,
    height: 2439,
    viewport: { x: 1440, y: 219, width: 1920, height: 1829 },
  });
});

test('a molecule smaller than a figure is never enlarged', () => {
  expect(
    figureFrame(
      { width: 1218, height: 1218 },
      { x: 0.1, y: 0.1, width: 0.8, height: 0.8 },
      FIGURE_LONGEST_SIDE,
    ),
  ).toStrictEqual({
    width: 1218,
    height: 1218,
    viewport: { x: 121, y: 121, width: 974, height: 974 },
  });
});

test('a crop with no area keeps the whole frame, held to the longest side', () => {
  expect(
    figureFrame(
      { width: 4000, height: 2000 },
      { x: 0, y: 0, width: 0, height: 0 },
      FIGURE_LONGEST_SIDE,
    ),
  ).toStrictEqual({
    width: 1920,
    height: 960,
    viewport: { x: 0, y: 0, width: 1920, height: 960 },
  });
});

test('a crop running past the frame stops at its edge', () => {
  expect(
    figureFrame(
      { width: 1000, height: 1000 },
      { x: 0.9, y: 0.95, width: 0.3, height: 0.3 },
      FIGURE_LONGEST_SIDE,
    ),
  ).toStrictEqual({
    width: 1000,
    height: 1000,
    viewport: { x: 900, y: 950, width: 100, height: 50 },
  });
});
