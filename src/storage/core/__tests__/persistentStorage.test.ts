/**
 * Asking the browser to keep the site's storage, and how much it stores: best
 * effort, so a browser that cannot say, or refuses, is answered without a
 * throw.
 */

import { afterEach, beforeEach, expect, test, vi } from 'vitest';

beforeEach(() => {
  // The request is made once per page, so each test loads a page of its own.
  vi.resetModules();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

async function load() {
  return import('../persistentStorage.ts');
}

test('a browser that does not estimate, or fails to, tells no usage', async () => {
  const { storageUsage } = await load();
  vi.stubGlobal('navigator', {
    storage: { estimate: () => Promise.resolve({ usage: 2048 }) },
  });

  await expect(storageUsage()).resolves.toBeUndefined();

  vi.stubGlobal('navigator', {
    storage: {
      estimate: () => Promise.reject(new DOMException('denied', 'Security')),
    },
  });

  await expect(storageUsage()).resolves.toBeUndefined();

  vi.stubGlobal('navigator', {});

  await expect(storageUsage()).resolves.toBeUndefined();
});

test('a browser that cannot keep storage is not asked', async () => {
  const { requestPersistentStorage } = await load();
  vi.stubGlobal('navigator', { storage: {} });

  await expect(requestPersistentStorage()).resolves.toBe(false);
});

test('storage already kept is not asked for again', async () => {
  const { requestPersistentStorage } = await load();
  const persist = vi.fn(() => Promise.resolve(false));
  vi.stubGlobal('navigator', {
    storage: { persisted: () => Promise.resolve(true), persist },
  });

  await expect(requestPersistentStorage()).resolves.toBe(true);
  expect(persist).not.toHaveBeenCalled();
});

test('a request the browser fails is answered as refused', async () => {
  const { requestPersistentStorage } = await load();
  vi.stubGlobal('navigator', {
    storage: {
      persist: () => Promise.reject(new Error('The visitor dismissed it.')),
    },
  });

  await expect(requestPersistentStorage()).resolves.toBe(false);
});
