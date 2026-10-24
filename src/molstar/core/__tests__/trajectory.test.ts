import { expect, test } from 'vitest';

import { clampFramesPerSecond } from '../trajectory.ts';

test('a frame rate is rounded into what molstar plays', () => {
  expect(clampFramesPerSecond(25)).toBe(25);
  expect(clampFramesPerSecond(24.6)).toBe(25);
  expect(clampFramesPerSecond(1)).toBe(5);
  expect(clampFramesPerSecond(1000)).toBe(60);
  expect(clampFramesPerSecond(Number.NaN)).toBe(5);
});
