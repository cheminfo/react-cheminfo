import { expect, test } from 'vitest';

import { ASYNC_LOADING, asyncFailed, asyncSucceeded } from '../asyncState.ts';

test('a task starts loading and lands on its data', () => {
  expect(ASYNC_LOADING).toStrictEqual({
    status: 'loading',
    data: undefined,
    error: undefined,
  });
  expect(asyncSucceeded([1990, 2000])).toStrictEqual({
    status: 'success',
    data: [1990, 2000],
    error: undefined,
  });
});

test('a first failure is an error state carrying a readable error', () => {
  const state = asyncFailed(ASYNC_LOADING, { status: 503 });

  expect(state.status).toBe('error');
  expect(state.error?.message).toBe('{"status":503}');
});

test('a failing refresh keeps the data already on screen', () => {
  const shown = asyncSucceeded({ entries: 214_000 });

  expect(asyncFailed(shown, new Error('network down'))).toBe(shown);
});
