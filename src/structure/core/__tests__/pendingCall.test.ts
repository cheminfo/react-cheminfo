import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { createPendingCall } from '../pendingCall.ts';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

test('only the last value of a burst is delivered, once it is still', () => {
  const pending = createPendingCall<string>();
  const delivered: string[] = [];
  const deliver = (value: string): void => {
    delivered.push(value);
  };

  pending.push('C', 300, deliver);
  vi.advanceTimersByTime(200);
  pending.push('CC', 300, deliver);
  vi.advanceTimersByTime(200);
  pending.push('CCO', 300, deliver);

  expect(delivered).toStrictEqual([]);

  vi.advanceTimersByTime(300);

  expect(delivered).toStrictEqual(['CCO']);
});

test('no delay delivers at once', () => {
  const pending = createPendingCall<string>();
  const delivered: string[] = [];

  pending.push('CCO', 0, (value) => delivered.push(value));

  expect(delivered).toStrictEqual(['CCO']);
});

test('flushing delivers the waiting value early, and only once', () => {
  const pending = createPendingCall<string>();
  const delivered: string[] = [];

  pending.push('CCO', 300, (value) => delivered.push(value));
  pending.flush();
  vi.advanceTimersByTime(300);
  pending.flush();

  expect(delivered).toStrictEqual(['CCO']);
});

test('a dropped value is never delivered', () => {
  const pending = createPendingCall<string>();
  const delivered: string[] = [];

  pending.push('CCO', 300, (value) => delivered.push(value));
  pending.drop();
  vi.advanceTimersByTime(300);
  pending.flush();

  expect(delivered).toStrictEqual([]);
});
