import { afterEach, expect, test, vi } from 'vitest';

import { openingRoute, readRoute, writeRoute } from '../history.ts';
import {
  holdPageAddress,
  pageLocation,
  releasePageAddress,
} from '../pageAddress.ts';
import { createTabRouter } from '../tabRouter.ts';

import { installBrowser } from './browserStub.ts';

type Tab = 'convert' | 'tutorial' | 'exercises';

const router = createTabRouter<Tab>({
  tabs: ['convert', { id: 'tutorial', takesId: true }, 'exercises'],
  home: 'convert',
  languages: ['en', 'fr', 'de'],
  keepEmptyValues: true,
  adoptLegacyHash: true,
});

afterEach(() => {
  vi.unstubAllGlobals();
  releasePageAddress();
});

test('a prefixed address round-trips with its language', () => {
  const route = router.parse('/fr/tutorial/3?embed&smiles=CC[N+](C)(C)C');

  expect(route).toStrictEqual({
    tab: 'tutorial',
    id: '3',
    params: { embed: '', smiles: 'CC[N+](C)(C)C' },
    language: 'fr',
  });
  expect(router.format(route)).toBe(
    '/fr/tutorial/3?embed&smiles=CC%5BN%2B%5D(C)(C)C',
  );
  expect(router.format({ tab: 'convert', language: 'de' })).toBe('/de');
  expect(router.format({ tab: 'exercises' })).toBe('/exercises');
  expect(router.parse('/de/')).toStrictEqual({
    tab: 'convert',
    id: null,
    params: {},
    language: 'de',
  });
});

test('a mounted site writes the prefix between the mount and the tab', () => {
  const mounted = createTabRouter<Tab>({
    tabs: ['convert', 'exercises'],
    home: 'convert',
    basePath: '/surge',
    languages: ['en', 'fr'],
  });

  expect(mounted.format({ tab: 'exercises', language: 'fr' })).toBe(
    '/surge/fr/exercises',
  );
  expect(mounted.parse('/surge/fr/exercises').language).toBe('fr');
  expect(mounted.basePath).toBe('/surge');
});

test('a language the site does not speak is never written as a prefix', () => {
  expect(router.format({ tab: 'exercises', language: 'it' })).toBe(
    '/exercises',
  );
  expect(router.parse('/it/exercises')).toStrictEqual({
    tab: 'convert',
    id: null,
    params: {},
    language: 'en',
  });
});

test('a ?lang= is read where the prefix names none, and the prefix wins', () => {
  expect(router.parse('/tutorial/2?lang=fr&embed')).toStrictEqual({
    tab: 'tutorial',
    id: '2',
    params: { embed: '' },
    language: 'fr',
  });
  expect(router.parse('/de/tutorial/2?lang=fr')).toStrictEqual({
    tab: 'tutorial',
    id: '2',
    params: {},
    language: 'de',
  });
  expect(router.parse('/tutorial/2?lang=ja')).toStrictEqual({
    tab: 'tutorial',
    id: '2',
    params: { lang: 'ja' },
    language: 'en',
  });
});

test('a router given no languages reads and writes none', () => {
  const plain = createTabRouter<Tab>({ tabs: ['exercises'], home: 'convert' });

  expect(plain.parse('/fr/exercises?lang=fr')).toStrictEqual({
    tab: 'convert',
    id: null,
    params: { lang: 'fr' },
  });
  expect(plain.format({ tab: 'exercises', language: 'fr' })).toBe('/exercises');
  expect(plain.languageAddress?.('/exercises?lang=fr')).toBeNull();
});

test('the address adopting a ?lang= keeps every other part as written', () => {
  expect(router.languageAddress?.('/tutorial/3?embed&lang=fr#steps')).toBe(
    '/fr/tutorial/3?embed#steps',
  );
  expect(router.languageAddress?.('/retired?lang=de&x=a+b')).toBe(
    '/de/retired?x=a%2Bb',
  );
  expect(router.languageAddress?.('/fr/tutorial/3?lang=de')).toBe(
    '/fr/tutorial/3',
  );
  expect(router.languageAddress?.('/tutorial/3?lang=ja')).toBeNull();
  expect(router.languageAddress?.('/tutorial/3')).toBeNull();
});

test('readRoute moves a handed-over language into the path, once', () => {
  const browser = installBrowser('/tutorial/3?lang=fr&embed');

  expect(readRoute(router)).toStrictEqual({
    tab: 'tutorial',
    id: '3',
    params: { embed: '' },
    language: 'fr',
  });
  expect(readRoute(router).language).toBe('fr');
  expect(browser.moves).toStrictEqual([
    { kind: 'replace', address: '/fr/tutorial/3?embed' },
  ]);
});

test('a deep link keeps its language, whatever ?lang= or the reader prefers', () => {
  const browser = installBrowser('/fr/tutorial/3?lang=de');

  expect(openingRoute(router, 'de')).toStrictEqual({
    tab: 'tutorial',
    id: '3',
    params: {},
    language: 'fr',
  });
  expect(browser.moves).toStrictEqual([
    { kind: 'replace', address: '/fr/tutorial/3' },
  ]);
});

test('an unprefixed deep link opens in English for everybody', () => {
  const browser = installBrowser('/tutorial/3');

  expect(openingRoute(router, 'fr').language).toBe('en');
  expect(browser.moves).toStrictEqual([]);
});

test('only a bare root opens in the language the reader last chose', () => {
  const browser = installBrowser('/');

  expect(openingRoute(router, 'de')).toStrictEqual({
    tab: 'convert',
    id: null,
    params: {},
    language: 'de',
  });
  expect(browser.moves).toStrictEqual([{ kind: 'replace', address: '/de' }]);

  const configured = installBrowser('/?embed');

  expect(openingRoute(router, 'de').language).toBe('en');
  expect(openingRoute(router, undefined).language).toBe('en');
  expect(configured.moves).toStrictEqual([]);

  const unspoken = installBrowser('/');

  expect(openingRoute(router, 'it').language).toBe('en');
  expect(unspoken.moves).toStrictEqual([]);
});

test('a move keeps the language on screen, and a language change pushes', () => {
  const browser = installBrowser('/fr/tutorial/2?embed');

  writeRoute(router, { tab: 'tutorial', id: '3' });
  writeRoute(router, { tab: 'exercises' });
  writeRoute(router, { tab: 'exercises', language: 'de' });

  expect(browser.moves).toStrictEqual([
    { kind: 'replace', address: '/fr/tutorial/3?embed' },
    { kind: 'push', address: '/fr/exercises?embed' },
    { kind: 'push', address: '/de/exercises?embed' },
  ]);
});

test('a legacy hash link handing over a language lands on its prefixed path', () => {
  const browser = installBrowser('/?lang=fr#/tutorial/3');

  expect(readRoute(router).language).toBe('fr');
  expect(browser.moves).toStrictEqual([
    { kind: 'replace', address: '/fr/tutorial/3' },
  ]);
});

test('a sealed link adopts the language in memory, never in the bar', () => {
  holdPageAddress('/tutorial/1?lang=de');

  expect(readRoute(router).language).toBe('de');
  expect(pageLocation()?.pathname).toBe('/de/tutorial/1');
  expect(pageLocation()?.search).toBe('');
});
