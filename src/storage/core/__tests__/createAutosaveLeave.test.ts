// @vitest-environment jsdom
/**
 * A change still waiting for its quiet delay is written as the page is left,
 * unless the site writes it itself; disposing writes what is pending.
 */

import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { createAutosave } from '../createAutosave.ts';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

test('leaving the page writes the change at once, rather than after the delay', async () => {
  const written: string[] = [];
  const autosave = createAutosave<string>({
    write: async (value) => {
      written.push(value);
    },
  });
  autosave.schedule('CCO');

  globalThis.dispatchEvent(new Event('pagehide'));
  await vi.advanceTimersByTimeAsync(0);

  expect(written).toStrictEqual(['CCO']);
  expect(autosave.isPending()).toBe(false);

  await autosave.dispose();
  autosave.schedule('CCN');
  globalThis.dispatchEvent(new Event('pagehide'));
  await vi.advanceTimersByTimeAsync(0);

  expect(written).toStrictEqual(['CCO']);
});

test('a site that writes on leaving itself is not written for, and disposing writes what is pending', async () => {
  const written: string[] = [];
  const autosave = createAutosave<string>({
    write: async (value) => {
      written.push(value);
    },
    flushOnLeave: false,
  });
  autosave.schedule('CCO');

  globalThis.dispatchEvent(new Event('pagehide'));
  await vi.advanceTimersByTimeAsync(0);

  expect(written).toStrictEqual([]);

  await autosave.dispose();

  expect(written).toStrictEqual(['CCO']);
});
