import { expect, test } from 'vitest';

import { coveredPixels } from '../../../core.ts';

const IMAGE = { width: 100, height: 100 };

test('a box covers the whole pixels it touches, grown out to their corners', () => {
  expect(
    coveredPixels({ x: 0.9, y: 0, width: 10, height: 4 }, IMAGE),
  ).toStrictEqual({ x: 0, y: 0, width: 11, height: 4 });
  expect(
    coveredPixels({ x: 2.25, y: 3.5, width: 0.5, height: 0.25 }, IMAGE),
  ).toStrictEqual({ x: 2, y: 3, width: 1, height: 1 });
});

test('the pixels are clipped to the image, and a box outside it covers none', () => {
  expect(
    coveredPixels({ x: -5.5, y: 95.5, width: 20, height: 20 }, IMAGE),
  ).toStrictEqual({ x: 0, y: 95, width: 15, height: 5 });
  expect(
    coveredPixels({ x: 120, y: 10, width: 5, height: 5 }, IMAGE),
  ).toBeNull();
  expect(
    coveredPixels({ x: 10, y: 10, width: 0, height: 5 }, IMAGE),
  ).toBeNull();
  expect(
    coveredPixels(
      { x: 4.5, y: 1, width: 1e6, height: 1 },
      { width: Infinity, height: Infinity },
    ),
  ).toStrictEqual({ x: 4, y: 1, width: 1e6 + 1, height: 1 });
});
