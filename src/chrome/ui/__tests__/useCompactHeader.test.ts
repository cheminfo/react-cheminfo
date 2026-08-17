import { afterEach, expect, test } from 'vitest';

import { isCompactBar } from '../useCompactHeader.ts';

const initialInnerWidth: unknown = Reflect.get(globalThis, 'innerWidth');

afterEach(() => {
  Reflect.set(globalThis, 'innerWidth', initialInnerWidth);
});

test('a bar narrower than the default has run out of room', () => {
  expect(isCompactBar(bar(900))).toBe(true);
});

test('a bar wider than the default keeps its labels', () => {
  expect(isCompactBar(bar(1200))).toBe(false);
});

test('the default width is exactly 1000 pixels, inclusive', () => {
  expect(isCompactBar(bar(1000))).toBe(true);
  expect(isCompactBar(bar(1001))).toBe(false);
});

test('the site may set the width the bar folds at', () => {
  expect(isCompactBar(bar(900), 800)).toBe(false);
  expect(isCompactBar(bar(700), 800)).toBe(true);
});

test('with no bar to measure, the window is what is read', () => {
  Reflect.set(globalThis, 'innerWidth', 640);

  expect(isCompactBar(null)).toBe(true);

  Reflect.set(globalThis, 'innerWidth', 1440);

  expect(isCompactBar(null)).toBe(false);
});

test('a bar that has not been laid out falls back to the window', () => {
  Reflect.set(globalThis, 'innerWidth', 640);

  expect(isCompactBar(bar(0))).toBe(true);

  Reflect.set(globalThis, 'innerWidth', 1440);

  expect(isCompactBar(bar(0))).toBe(false);
});

test('a page with no window to measure is never folded', () => {
  Reflect.set(globalThis, 'innerWidth', undefined);

  expect(isCompactBar(null)).toBe(false);
  expect(isCompactBar(bar(0))).toBe(false);
});

function bar(clientWidth: number): HTMLElement {
  return { clientWidth } as HTMLElement;
}
