import { afterEach, expect, test, vi } from 'vitest';

import { openCacheStore } from '../openCacheStore.ts';
import { isStoreRefusal } from '../storeRefusal.ts';

afterEach(() => {
  vi.unstubAllGlobals();
});

/**
 * What opening a store rejected with.
 * @param name - The store.
 * @returns The refusal's reason and message, or what else was thrown.
 */
async function refusal(name: string): Promise<unknown> {
  try {
    await openCacheStore(name);
  } catch (error) {
    return isStoreRefusal(error) ? [error.reason, error.message] : error;
  }
  return 'opened';
}

test('a page with no Cache Storage, and a browser refusing to open one, refuse as unavailable', async () => {
  // Node, like a page served insecurely, has no Cache Storage.
  const absent = await refusal('models-v1');
  const denied = new DOMException(
    'The operation is insecure.',
    'SecurityError',
  );
  vi.stubGlobal('caches', { open: () => Promise.reject(denied) });
  const refused = await refusal('models-v1');

  expect([absent, refused]).toStrictEqual([
    [
      'unavailable',
      'This page has no Cache Storage: it is not a secure context.',
    ],
    ['unavailable', 'The operation is insecure.'],
  ]);
});

test('a store that opens is handed back, and a defect of the opening is thrown on as it came', async () => {
  const store = { name: 'the store' };
  const defect = new TypeError('open is not a function');
  vi.stubGlobal('caches', {
    open: (name: string) => Promise.resolve({ ...store, opened: name }),
  });
  const opened = await openCacheStore('models-v1');
  vi.stubGlobal('caches', { open: () => Promise.reject(defect) });

  expect(opened).toStrictEqual({ name: 'the store', opened: 'models-v1' });
  await expect(refusal('models-v1')).resolves.toBe(defect);
});
