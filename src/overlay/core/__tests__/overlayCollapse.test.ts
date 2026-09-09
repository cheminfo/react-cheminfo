import { expect, test } from 'vitest';

import { shouldCollapseOverlay } from '../overlayCollapse.ts';

test('a figure narrower than the threshold folds its card away', () => {
  expect(shouldCollapseOverlay(380, 420)).toBe(true);
  expect(shouldCollapseOverlay(1, 420)).toBe(true);
});

test('the threshold itself is wide enough to keep the controls', () => {
  expect(shouldCollapseOverlay(420, 420)).toBe(false);
  expect(shouldCollapseOverlay(421, 420)).toBe(false);
});

test('an unmeasured figure keeps its controls rather than folding them', () => {
  expect(shouldCollapseOverlay(0, 420)).toBe(false);
  expect(shouldCollapseOverlay(-10, 420)).toBe(false);
  expect(shouldCollapseOverlay(Number.NaN, 420)).toBe(false);
});

test('a threshold that is not a number never folds anything', () => {
  expect(shouldCollapseOverlay(380, Number.NaN)).toBe(false);
  expect(shouldCollapseOverlay(380, Number.POSITIVE_INFINITY)).toBe(false);
});
