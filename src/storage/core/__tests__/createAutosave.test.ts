import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { createAutosave } from '../createAutosave.ts';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

test('a burst of changes is written once, as its last value, after the quiet delay', async () => {
  const written: string[] = [];
  const autosave = createAutosave<string>({
    write: (value) => {
      written.push(value);
    },
    delay: 500,
  });

  autosave.schedule('C');
  await vi.advanceTimersByTimeAsync(200);
  autosave.schedule('CC');
  await vi.advanceTimersByTimeAsync(200);
  autosave.schedule('CCO');

  expect(autosave.isPending()).toBe(true);

  await vi.advanceTimersByTimeAsync(499);

  expect(written).toStrictEqual([]);

  await vi.advanceTimersByTimeAsync(1);

  expect(written).toStrictEqual(['CCO']);
  expect(autosave.isPending()).toBe(false);
});

test('changes that never pause are still written every maxWait', async () => {
  const written: number[] = [];
  const autosave = createAutosave<number>({
    write: (value) => {
      written.push(value);
    },
    delay: 500,
    maxWait: 2000,
  });

  for (let step = 1; step <= 10; step++) {
    autosave.schedule(step);
    // eslint-disable-next-line no-await-in-loop -- one change every 300 ms, in order
    await vi.advanceTimersByTimeAsync(300);
  }

  expect(written).toStrictEqual([7]);
});

test('writes never overlap: a slow write holds the next one back', async () => {
  const events: string[] = [];
  const autosave = createAutosave<string>({
    write: async (value) => {
      events.push(`start ${value}`);
      await new Promise((resolve) => {
        setTimeout(resolve, 1000);
      });
      events.push(`end ${value}`);
    },
  });

  autosave.schedule('a');
  void autosave.flush();
  autosave.schedule('b');
  const done = autosave.flush();
  await vi.advanceTimersByTimeAsync(2000);
  await done;

  expect(events).toStrictEqual(['start a', 'end a', 'start b', 'end b']);
});

test('flush takes the value pending when it is called, and cancel drops it', async () => {
  const written: string[] = [];
  const autosave = createAutosave<string>({
    write: (value) => {
      written.push(value);
    },
  });

  autosave.schedule('old drawing');
  const flushed = autosave.flush();
  autosave.schedule('new drawing');
  await flushed;

  expect(written).toStrictEqual(['old drawing']);

  autosave.cancel();
  await vi.advanceTimersByTimeAsync(5000);

  expect(written).toStrictEqual(['old drawing']);
});

test('a failed write is reported, and the next change is written in its place', async () => {
  const errors: string[] = [];
  const written: string[] = [];
  const autosave = createAutosave<string>({
    write: (value) => {
      if (value === 'too big') throw new Error('QuotaExceededError');
      written.push(value);
    },
    onError: (error) => {
      errors.push(error.message);
    },
  });

  autosave.schedule('too big');
  await autosave.flush();
  autosave.schedule('smaller');
  await autosave.dispose();

  expect(errors).toStrictEqual(['QuotaExceededError']);
  expect(written).toStrictEqual(['smaller']);
});
