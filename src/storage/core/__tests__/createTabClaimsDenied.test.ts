/**
 * A tab whose Web Locks are denied, or missing, claims every id and can be
 * asked to release it; one whose locks cannot be listed tells no ids.
 */

import { afterEach, expect, test, vi } from 'vitest';

import { createTabClaims } from '../createTabClaims.ts';

afterEach(() => {
  vi.unstubAllGlobals();
});

test('a frame denied Web Locks claims every id, and releasing one is harmless', async () => {
  const request = vi.fn(() =>
    Promise.reject(new DOMException('denied', 'SecurityError')),
  );
  vi.stubGlobal('navigator', { locks: { request } });
  const claims = createTabClaims('draw:drafts');

  await expect(claims.claim('a')).resolves.toBe(true);
  await expect(claims.claim('a')).resolves.toBe(true);
  expect(request).toHaveBeenCalledOnce();

  claims.release('a');

  await expect(claims.claim('a')).resolves.toBe(true);
  expect(request).toHaveBeenCalledTimes(2);
});

test('without Web Locks a claim released is claimed afresh', async () => {
  vi.stubGlobal('navigator', {});
  const claims = createTabClaims('draw:drafts');
  await claims.claim('a');

  claims.release('a');

  await expect(claims.claim('a')).resolves.toBe(true);
});

test('locks that cannot be listed tell no ids', async () => {
  vi.stubGlobal('navigator', {
    locks: {
      query: () => Promise.reject(new DOMException('denied', 'SecurityError')),
    },
  });

  await expect(createTabClaims('draw:drafts').held()).resolves.toBeUndefined();
});

test('the ids held are read off the lock names of the scope', async () => {
  vi.stubGlobal('navigator', {
    locks: {
      query: () =>
        Promise.resolve({
          held: [
            { name: 'draw:drafts:a' },
            { name: 'pdb:scripts:1ABC' },
            {},
            { name: 'draw:drafts:b' },
          ],
        }),
    },
  });

  await expect(createTabClaims('draw:drafts').held()).resolves.toStrictEqual(
    new Set(['a', 'b']),
  );
});
