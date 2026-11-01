import { afterEach, expect, test, vi } from 'vitest';

import { createTabClaims } from '../createTabClaims.ts';

afterEach(() => {
  vi.unstubAllGlobals();
});

test('an id one tab claims cannot be claimed by another until it is released', async () => {
  const thisTab = createTabClaims('draw:drafts');
  const otherTab = createTabClaims('draw:drafts');

  await expect(thisTab.claim('a')).resolves.toBe(true);
  await expect(thisTab.claim('a')).resolves.toBe(true);
  await expect(otherTab.claim('a')).resolves.toBe(false);
  await expect(otherTab.claim('b')).resolves.toBe(true);
  await expect(thisTab.held()).resolves.toStrictEqual(new Set(['a', 'b']));

  thisTab.release('a');
  await Promise.resolve();

  await expect(otherTab.claim('a')).resolves.toBe(true);

  otherTab.release('a');
  otherTab.release('b');
});

test('the ids held are those of the scope only', async () => {
  const drafts = createTabClaims('draw:drafts');
  const scripts = createTabClaims('pdb:scripts');
  await drafts.claim('a');
  await scripts.claim('1ABC');

  await expect(drafts.held()).resolves.toStrictEqual(new Set(['a']));
  await expect(scripts.held()).resolves.toStrictEqual(new Set(['1ABC']));

  drafts.release('a');
  scripts.release('1ABC');
});

test('without Web Locks every claim holds, and nobody can tell which ids are held', async () => {
  vi.stubGlobal('navigator', {});
  const claims = createTabClaims('draw:drafts');

  await expect(claims.claim('a')).resolves.toBe(true);
  await expect(createTabClaims('draw:drafts').claim('a')).resolves.toBe(true);
  await expect(claims.held()).resolves.toBeUndefined();
});

test('the id a tab works on is remembered in its session storage', () => {
  const entries = new Map<string, string>();
  vi.stubGlobal('sessionStorage', {
    getItem: (key: string) => entries.get(key) ?? null,
    setItem: (key: string, value: string) => entries.set(key, value),
    removeItem: (key: string) => entries.delete(key),
  });
  const claims = createTabClaims('draw:drafts');

  expect(claims.remembered()).toBeUndefined();

  claims.remember('a');

  expect(entries.get('draw:drafts:current')).toBe('a');
  expect(claims.remembered()).toBe('a');

  claims.remember(undefined);

  expect(claims.remembered()).toBeUndefined();
});

test('a tab whose session storage throws remembers nothing, and does not fail', () => {
  vi.stubGlobal('sessionStorage', {
    getItem: () => {
      throw new DOMException('denied', 'SecurityError');
    },
    setItem: () => {
      throw new DOMException('denied', 'SecurityError');
    },
  });
  const claims = createTabClaims('draw:drafts');
  claims.remember('a');

  expect(claims.remembered()).toBeUndefined();
});
