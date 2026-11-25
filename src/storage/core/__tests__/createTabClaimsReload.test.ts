// @vitest-environment jsdom
import { afterEach, expect, test, vi } from 'vitest';

import { createTabClaims } from '../createTabClaims.ts';

afterEach(() => {
  vi.unstubAllGlobals();
});

type Callback = (lock: { name: string } | null) => Promise<void> | undefined;

/**
 * Web Locks whose releases reach the lock manager only when the test says so,
 * as a page going away may let go of its locks after the next page asked: a
 * request that may wait queues until the lock is free.
 * @returns The locks, the names held, and how to deliver the releases.
 */
function slowLocks() {
  const held = new Set<string>();
  const waiting: Array<{ name: string; grant: () => void }> = [];
  const delivered: Array<() => void> = [];
  const grant = (name: string, callback: Callback) => {
    held.add(name);
    const holding = callback({ name }) ?? Promise.resolve();
    return holding.then(
      () =>
        new Promise<void>((settled) => {
          delivered.push(() => {
            held.delete(name);
            const next = waiting.findIndex((one) => one.name === name);
            if (next !== -1) waiting.splice(next, 1)[0]?.grant();
            settled();
          });
        }),
    );
  };
  const locks = {
    request: (
      name: string,
      options: { ifAvailable?: boolean },
      callback: Callback,
    ) => {
      if (!held.has(name)) return grant(name, callback);
      if (options.ifAvailable) return Promise.resolve(callback(null));
      return new Promise<void>((done) => {
        waiting.push({
          name,
          grant: () => {
            void grant(name, callback).then(done);
          },
        });
      });
    },
    query: () => Promise.resolve({ held: [...held].map((name) => ({ name })) }),
  };
  const deliver = () => {
    for (const release of delivered.splice(0)) release();
  };
  return { locks, held, deliver };
}

function sessionStorageOf(entries: Map<string, string>) {
  return {
    getItem: (key: string) => entries.get(key) ?? null,
    setItem: (key: string, value: string) => entries.set(key, value),
    removeItem: (key: string) => entries.delete(key),
  };
}

test('a reloaded tab waits for the id its previous page lets go of, however late the release arrives', async () => {
  const { locks, held, deliver } = slowLocks();
  vi.stubGlobal('navigator', { locks });
  vi.stubGlobal('sessionStorage', sessionStorageOf(new Map()));
  const before = createTabClaims('image');
  await before.claim('s1');
  before.remember('s1');
  globalThis.dispatchEvent(
    new PageTransitionEvent('pagehide', { persisted: false }),
  );
  await Promise.resolve();
  const after = createTabClaims('image');
  const claimed = after.claim('s1');
  const stillHeld = [...held];
  await Promise.resolve();
  deliver();

  expect({ stillHeld, claimed: await claimed, held: [...held] }).toStrictEqual({
    stillHeld: ['image:s1'],
    claimed: true,
    held: ['image:s1'],
  });
});

test('a duplicated tab does not wait for the id its original holds', async () => {
  const { locks } = slowLocks();
  vi.stubGlobal('navigator', { locks });
  const original = createTabClaims('image');
  await original.claim('s1');
  vi.stubGlobal(
    'sessionStorage',
    sessionStorageOf(new Map([['image:current', 's1']])),
  );
  const duplicate = createTabClaims('image');

  await expect(duplicate.claim('s1')).resolves.toBe(false);
  await expect(duplicate.claim('s2')).resolves.toBe(true);
});
