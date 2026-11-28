import { expect, test } from 'vitest';

import { workerPoolSize } from '../workerPoolSize.ts';

test('one processor is left to the page, and the pool never passes its cap', () => {
  expect(workerPoolSize({ max: 8, cores: 4 })).toBe(3);
  expect(workerPoolSize({ max: 4, cores: 16 })).toBe(4);
  expect(workerPoolSize({ max: 4, cores: 1 })).toBe(1);
  expect(workerPoolSize({ max: 4, cores: 6.5 })).toBe(4);
  expect(workerPoolSize({ max: 4, cores: 4.9 })).toBe(3);
});

test('what was asked for wins, held between 1 and the cap', () => {
  expect(workerPoolSize({ max: 8, requested: 2, cores: 16 })).toBe(2);
  expect(workerPoolSize({ max: 8, requested: 20 })).toBe(8);
  expect(workerPoolSize({ max: 8, requested: 0 })).toBe(1);
  expect(workerPoolSize({ max: 8, requested: 2.7 })).toBe(2);
});

test('a machine that says nothing runs one worker', () => {
  expect(workerPoolSize({ max: 8, cores: Number.NaN })).toBe(1);
});
