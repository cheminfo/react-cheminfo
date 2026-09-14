import { expect, test } from 'vitest';

import { CLOUD_ZOOM_RANGE, clampCloudZoom } from '../cloudZoom.ts';

test('a zoom inside the range is kept', () => {
  expect(clampCloudZoom(2.5)).toBe(2.5);
  expect(clampCloudZoom(CLOUD_ZOOM_RANGE.min)).toBe(0.4);
  expect(clampCloudZoom(CLOUD_ZOOM_RANGE.max)).toBe(4);
});

test('a zoom past either end stops at that end', () => {
  expect(clampCloudZoom(0.1)).toBe(0.4);
  expect(clampCloudZoom(12)).toBe(4);
});

test('a zoom that is not a finite number draws the box at its own size', () => {
  expect(clampCloudZoom(Number.NaN)).toBe(1);
  expect(clampCloudZoom(Number.POSITIVE_INFINITY)).toBe(1);
});
