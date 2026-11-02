import { afterEach, expect, test, vi } from 'vitest';

import { installBrowser } from './browserStub.ts';
import type { PageRoute } from './siteRouters.ts';
import { pages, tools } from './siteRouters.ts';

afterEach(() => {
  vi.unstubAllGlobals();
});

test('the browser is read under the mount, and a hash link is adopted in place', () => {
  const browser = installBrowser('/dbe/#/exercises/mf-dmso?seed=4271');

  expect(pages.read()).toStrictEqual({
    tab: 'exercises',
    id: 'mf-dmso',
    query: { seed: '4271' },
  });
  expect(browser.moves).toStrictEqual([
    { kind: 'replace', address: '/dbe/exercises/mf-dmso?seed=4271' },
  ]);
});

test('the route written is the whole address, under the mount', () => {
  const browser = installBrowser('/dbe/learn/sulfur?embed=1&hide=list');

  pages.write({ tab: 'learn', id: 'phosphorus', query: { embed: '1' } });
  pages.write({
    tab: 'exercises',
    id: null,
    query: { smiles: 'CC[N+](C)C' },
  });

  expect(browser.moves).toStrictEqual([
    { kind: 'replace', address: '/dbe/learn/phosphorus?embed=1' },
    { kind: 'push', address: '/dbe/exercises?smiles=CC%5BN%2B%5D(C)C' },
  ]);
});

test('a subscriber hears the browser move, never the app writing its state', () => {
  installBrowser('/dbe/learn/sulfur');
  const heard: PageRoute[] = [];
  const stop = pages.subscribe((route) => {
    heard.push(route);
  });

  pages.write({ tab: 'learn', id: 'phosphorus', query: {} });
  globalThis.history.pushState(null, '', '/dbe/exercises?seed=4271');
  globalThis.dispatchEvent(new Event('popstate'));
  stop();
  globalThis.dispatchEvent(new Event('popstate'));

  expect(heard).toStrictEqual([
    { tab: 'exercises', id: null, query: { seed: '4271' } },
  ]);
});

test('a bare root opens in the language last chosen, then names its home', () => {
  const browser = installBrowser('/');

  expect(tools.opening('it')).toStrictEqual({
    tab: 'table',
    id: null,
    query: {},
    language: 'it',
  });
  expect(browser.moves).toStrictEqual([
    { kind: 'replace', address: '/it' },
    { kind: 'replace', address: '/it/table' },
  ]);
});

test('a sibling’s ?lang= moves into the path when the site opens', () => {
  const browser = installBrowser('/table/Ag?lang=de&color=density');

  expect(tools.opening('en')).toStrictEqual({
    tab: 'table',
    id: 'Ag',
    query: { color: 'density' },
    language: 'de',
  });
  expect(browser.moves).toStrictEqual([
    { kind: 'replace', address: '/de/table/Ag?color=density' },
  ]);
});

test('a deep link is never steered, and a front page keeps its query', () => {
  const deep = installBrowser('/table/Ag');

  expect(tools.opening('fr').language).toBe('en');
  expect(deep.moves).toStrictEqual([]);

  const configured = installBrowser('/?embed=1');

  expect(tools.opening('fr')).toStrictEqual({
    tab: 'table',
    id: null,
    query: { embed: '1' },
    language: 'en',
  });
  expect(configured.moves).toStrictEqual([
    { kind: 'replace', address: '/table?embed=1' },
  ]);

  const root = installBrowser('/dbe/');

  expect(pages.opening(undefined)).toStrictEqual({
    tab: 'calculator',
    id: null,
    query: {},
  });
  expect(root.moves).toStrictEqual([]);
});
