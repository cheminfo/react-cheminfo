/**
 * A link written when a site routed by the hash still opens: the fragment
 * naming a tab becomes the path the router writes for it.
 */

import { afterEach, expect, test, vi } from 'vitest';

import { adoptLegacyTabAddress, legacyTabAddress } from '../legacyHash.ts';
import { createTabRouter } from '../tabRouter.ts';

import { installBrowser } from './browserStub.ts';

const router = createTabRouter({
  tabs: [
    'builder',
    { id: 'help', takesId: true },
    { id: 'exercises', takesId: true },
  ],
  home: 'builder',
});

afterEach(() => {
  vi.unstubAllGlobals();
});

test('a fragment naming a tab opens its page, the home tab at the root', () => {
  expect(legacyTabAddress(router, '#/help')).toBe('/help');
  expect(legacyTabAddress(router, '#/help/draw-the-core')).toBe(
    '/help/draw-the-core',
  );
  expect(legacyTabAddress(router, '#/exercises/digit')).toBe(
    '/exercises/digit',
  );
  expect(legacyTabAddress(router, '#/builder')).toBe('/');
});

test('a fragment naming no tab is an anchor, and no fragment is no link', () => {
  expect(legacyTabAddress(router, '#/nowhere')).toBeNull();
  expect(legacyTabAddress(router, '#results')).toBeNull();
  expect(legacyTabAddress(router, '')).toBeNull();
});

test('the query a link carried stays with it, the fragment’s own first', () => {
  expect(legacyTabAddress(router, '/?embed=1#/help/core')).toBe(
    '/help/core?embed=1',
  );
  expect(legacyTabAddress(router, '/?embed=1#/help?hide=tabs')).toBe(
    '/help?hide=tabs',
  );
});

test('the address in the bar is replaced once, under the mount', () => {
  const browser = installBrowser('/?embed=1#/exercises/digit');
  adoptLegacyTabAddress(router, (path) => `/vcl${path}`);

  expect(browser.moves).toStrictEqual([
    { kind: 'replace', address: '/vcl/exercises/digit?embed=1' },
  ]);

  adoptLegacyTabAddress(router);

  expect(browser.moves).toHaveLength(1);
});

test('without a browser nothing happens', () => {
  expect(() => {
    adoptLegacyTabAddress(router);
  }).not.toThrow();
});
