// @vitest-environment jsdom
import { afterEach, expect, test, vi } from 'vitest';

import { createTabClaims } from '../createTabClaims.ts';

afterEach(() => {
  vi.unstubAllGlobals();
});

/**
 * Web Locks as one browser keeps them: a lock is granted when free, and
 * freed when the promise its holder returned settles.
 * @returns The locks, and the names held.
 */
function fakeLocks() {
  const held = new Set<string>();
  const locks = {
    request: (
      name: string,
      _options: { ifAvailable: boolean },
      callback: (lock: { name: string } | null) => Promise<void> | undefined,
    ) => {
      if (held.has(name)) return Promise.resolve(callback(null));
      held.add(name);
      const holding = callback({ name }) ?? Promise.resolve();
      return holding.then(() => {
        held.delete(name);
      });
    },
    query: () => Promise.resolve({ held: [...held].map((name) => ({ name })) }),
  };
  return { locks, held };
}

test('a page going away for good lets go of its claims, so the next page of the tab takes its own id; one kept for the back button keeps them', async () => {
  const { locks, held } = fakeLocks();
  vi.stubGlobal('navigator', { locks });
  const leaving = createTabClaims('image');
  await leaving.claim('kept');
  globalThis.dispatchEvent(
    new PageTransitionEvent('pagehide', { persisted: true }),
  );
  await Promise.resolve();
  const afterBackCache = [...held];
  globalThis.dispatchEvent(
    new PageTransitionEvent('pagehide', { persisted: false }),
  );
  await Promise.resolve();
  await Promise.resolve();
  const next = createTabClaims('image');

  expect({
    afterBackCache,
    afterLeaving: [...held],
    nextClaims: await next.claim('kept'),
  }).toStrictEqual({
    afterBackCache: ['image:kept'],
    afterLeaving: [],
    nextClaims: true,
  });
});
