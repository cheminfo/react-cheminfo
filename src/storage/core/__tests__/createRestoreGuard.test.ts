import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { createRestoreGuard } from '../createRestoreGuard.ts';

const entries = new Map<string, string>();

beforeEach(() => {
  entries.clear();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => entries.get(key) ?? null,
    setItem: (key: string, value: string) => entries.set(key, value),
    removeItem: (key: string) => entries.delete(key),
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

test('a restore that finished leaves nothing behind', () => {
  const guard = createRestoreGuard('draw:drafts');
  guard.begin('a');
  guard.finish('a');

  expect(guard.crashedOn('a')).toBe(false);
  expect([...entries.keys()]).toStrictEqual([]);
});

test('a restore the page died during is remembered on the next load, for that id only', () => {
  createRestoreGuard('draw:drafts').begin('a');

  const nextLoad = createRestoreGuard('draw:drafts');

  expect(nextLoad.crashedOn('a')).toBe(true);
  expect(nextLoad.crashedOn('b')).toBe(false);
  expect(createRestoreGuard('pdb:scripts').crashedOn('a')).toBe(false);

  nextLoad.begin('a');
  nextLoad.finish('a');

  expect(nextLoad.crashedOn('a')).toBe(false);
});

test('where storage is refused, nothing ever reads as crashed', () => {
  vi.stubGlobal('localStorage', {
    getItem: () => {
      throw new DOMException('denied', 'SecurityError');
    },
    setItem: () => {
      throw new DOMException('denied', 'SecurityError');
    },
    removeItem: () => {
      throw new DOMException('denied', 'SecurityError');
    },
  });
  const guard = createRestoreGuard('draw:drafts');
  guard.begin('a');

  expect(guard.crashedOn('a')).toBe(false);
});
