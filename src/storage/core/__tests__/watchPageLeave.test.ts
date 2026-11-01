import { afterEach, expect, test, vi } from 'vitest';

import {
  requestPersistentStorage,
  storageUsage,
} from '../persistentStorage.ts';
import { watchPageLeave } from '../watchPageLeave.ts';

afterEach(() => {
  vi.unstubAllGlobals();
});

function fakePage() {
  const page = Object.assign(new EventTarget(), {
    visibilityState: 'visible',
  });
  const window = new EventTarget();
  vi.stubGlobal('document', page);
  vi.stubGlobal('addEventListener', window.addEventListener.bind(window));
  vi.stubGlobal('removeEventListener', window.removeEventListener.bind(window));
  return { page, window };
}

test('the page is heard when it is hidden or left, and no more once stopped', () => {
  const { page, window } = fakePage();
  const leaves: string[] = [];
  const stop = watchPageLeave(() => {
    leaves.push(page.visibilityState);
  });

  page.dispatchEvent(new Event('visibilitychange'));
  page.visibilityState = 'hidden';
  page.dispatchEvent(new Event('visibilitychange'));
  window.dispatchEvent(new Event('pagehide'));
  stop();
  page.dispatchEvent(new Event('visibilitychange'));
  window.dispatchEvent(new Event('pagehide'));

  expect(leaves).toStrictEqual(['hidden', 'hidden']);
});

test('without a document there is nothing to hear', () => {
  vi.stubGlobal('document', undefined);
  const stop = watchPageLeave(() => {
    throw new Error('never called');
  });

  expect(stop()).toBeUndefined();
});

test('a browser that tells nothing about its storage gets an undefined usage', async () => {
  vi.stubGlobal('navigator', {});

  await expect(storageUsage()).resolves.toBeUndefined();
});

test('the usage is what the browser estimates', async () => {
  vi.stubGlobal('navigator', {
    storage: { estimate: () => Promise.resolve({ usage: 2048, quota: 1e9 }) },
  });

  await expect(storageUsage()).resolves.toStrictEqual({
    usage: 2048,
    quota: 1e9,
  });
});

test('persistent storage is asked for once per page', async () => {
  const persist = vi.fn(() => Promise.resolve(true));
  vi.stubGlobal('navigator', {
    storage: { persisted: () => Promise.resolve(false), persist },
  });

  await expect(requestPersistentStorage()).resolves.toBe(true);
  await expect(requestPersistentStorage()).resolves.toBe(true);
  expect(persist).toHaveBeenCalledOnce();
});
