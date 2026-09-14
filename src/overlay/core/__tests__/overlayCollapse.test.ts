import { expect, test } from 'vitest';

import { overlayBarFolded, shouldCollapseOverlay } from '../overlayCollapse.ts';

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

test('a bar whose caller holds the fold is obeyed whatever the width', () => {
  const narrow = { startedFolded: false, width: 380, collapseBelow: 420 };
  const wide = { startedFolded: true, width: 800, collapseBelow: 420 };

  expect(overlayBarFolded({ ...narrow, collapsed: false })).toBe(false);
  expect(overlayBarFolded({ ...wide, collapsed: true })).toBe(true);
  expect(overlayBarFolded({ ...wide, collapsed: false })).toBe(false);
});

test('a bar left to decide folds when too narrow or when asked to start folded', () => {
  const base = { collapsed: undefined, collapseBelow: 420 };

  expect(overlayBarFolded({ ...base, startedFolded: false, width: 380 })).toBe(
    true,
  );
  expect(overlayBarFolded({ ...base, startedFolded: false, width: 800 })).toBe(
    false,
  );
  expect(overlayBarFolded({ ...base, startedFolded: false, width: 0 })).toBe(
    false,
  );
  expect(overlayBarFolded({ ...base, startedFolded: true, width: 800 })).toBe(
    true,
  );
});
