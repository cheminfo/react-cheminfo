import { expect, test } from 'vitest';

import { resolveElementTarget } from '../elementTarget.ts';

test('a target names the element a ref holds, the element itself, or nothing', () => {
  const canvas = { tagName: 'CANVAS' } as unknown as Element;

  expect(resolveElementTarget({ current: canvas })).toBe(canvas);
  expect(resolveElementTarget({ current: null })).toBeNull();
  expect(resolveElementTarget(canvas)).toBe(canvas);
  expect(resolveElementTarget(null)).toBeNull();
});
