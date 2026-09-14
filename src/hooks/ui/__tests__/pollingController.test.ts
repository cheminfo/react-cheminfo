import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type { PollingSnapshot } from '../pollingController.ts';
import { isNewPollingRun, startPolling } from '../pollingController.ts';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

test('it polls once at the start, then after each interval, until an answer is final', async () => {
  const answers = ['seeding', 'seeding', 'done', 'never asked'];
  let calls = 0;
  const snapshots: Array<PollingSnapshot<string>> = [];

  startPolling(
    () => Promise.resolve(answers[calls++] as string),
    { interval: 1500, isDone: (state) => state === 'done' },
    (snapshot) => snapshots.push(snapshot),
  );

  await vi.advanceTimersByTimeAsync(0);

  expect(calls).toBe(1);

  await vi.advanceTimersByTimeAsync(1499);

  expect(calls).toBe(1);

  await vi.advanceTimersByTimeAsync(1);

  expect(calls).toBe(2);

  await vi.advanceTimersByTimeAsync(10_000);

  expect(calls).toBe(3);
  expect(snapshots.at(-1)).toStrictEqual({
    value: 'done',
    error: undefined,
    done: true,
  });
});

test('the interval may follow the answer, and a failure keeps the last answer and retries', async () => {
  const outcomes: Array<string | Error> = ['running', new Error('503'), 'idle'];
  let calls = 0;
  const snapshots: Array<PollingSnapshot<string>> = [];

  startPolling(
    () => {
      const outcome = outcomes[calls++] ?? 'idle';
      return outcome instanceof Error
        ? Promise.reject(outcome)
        : Promise.resolve(outcome);
    },
    {
      interval: (state) => (state === 'running' ? 2000 : 30_000),
      retryInterval: 5000,
    },
    (snapshot) => snapshots.push(snapshot),
  );

  await vi.advanceTimersByTimeAsync(2000);

  expect(calls).toBe(2);
  expect(snapshots[1]?.value).toBe('running');
  expect(snapshots[1]?.error?.message).toBe('503');

  await vi.advanceTimersByTimeAsync(5000);

  expect(calls).toBe(3);
  expect(snapshots[2]).toStrictEqual({
    value: 'idle',
    error: undefined,
    done: false,
  });
});

test('nothing is asked while the tab is hidden, and showing it polls at once', async () => {
  const page = stubDocument('hidden');
  let calls = 0;

  startPolling(
    () => Promise.resolve(++calls),
    { interval: 1000 },
    () => null,
  );
  await vi.advanceTimersByTimeAsync(5000);

  expect(calls).toBe(0);

  page.show();
  await vi.advanceTimersByTimeAsync(0);

  expect(calls).toBe(1);
});

test('stopping cancels the next poll and ignores the answer in flight', async () => {
  let resolve: ((value: number) => void) | undefined;
  const snapshots: Array<PollingSnapshot<number>> = [];
  let calls = 0;

  const stop = startPolling(
    () => {
      calls++;
      return new Promise<number>((settle) => {
        resolve = settle;
      });
    },
    { interval: 100 },
    (snapshot) => snapshots.push(snapshot),
  );
  stop();
  resolve?.(7);
  await vi.advanceTimersByTimeAsync(1000);

  expect(calls).toBe(1);
  expect(snapshots).toStrictEqual([]);
});

test('another job or a switched poll is a new run, a re-render of the same one is not', () => {
  const running = { fetcher: fetchJobA, enabled: true };

  expect(isNewPollingRun(running, { fetcher: fetchJobA, enabled: true })).toBe(
    false,
  );
  expect(isNewPollingRun(running, { fetcher: fetchJobB, enabled: true })).toBe(
    true,
  );
  expect(isNewPollingRun(running, { fetcher: fetchJobA, enabled: false })).toBe(
    true,
  );
});

function fetchJobA(): Promise<string> {
  return Promise.resolve('a');
}

function fetchJobB(): Promise<string> {
  return Promise.resolve('b');
}

function stubDocument(initial: DocumentVisibilityState) {
  let visibilityState = initial;
  const listeners = new Set<() => void>();
  vi.stubGlobal('document', {
    get visibilityState() {
      return visibilityState;
    },
    addEventListener: (_type: string, listener: () => void) => {
      listeners.add(listener);
    },
    removeEventListener: (_type: string, listener: () => void) => {
      listeners.delete(listener);
    },
  });
  return {
    show() {
      visibilityState = 'visible';
      for (const listener of listeners) listener();
    },
  };
}
