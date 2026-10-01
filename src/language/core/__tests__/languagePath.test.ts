import { expect, test } from 'vitest';

import type { Language } from '../../../i18n/core/languages.ts';
import { readLanguagePath, withLanguagePath } from '../languagePath.ts';

const SPOKEN: readonly Language[] = ['en', 'fr', 'de'];

test('a prefixed address names its language and the page under it', () => {
  expect(readLanguagePath('/fr/tutorial', SPOKEN)).toStrictEqual({
    language: 'fr',
    path: '/tutorial',
  });
});

test('a language on its own opens that language at the front page', () => {
  expect(readLanguagePath('/fr', SPOKEN)).toStrictEqual({
    language: 'fr',
    path: '/',
  });
});

test('a trailing slash after the language is still the front page', () => {
  expect(readLanguagePath('/fr/', SPOKEN)).toStrictEqual({
    language: 'fr',
    path: '/',
  });
});

test('an address naming no language is read in the default one', () => {
  expect(readLanguagePath('/tutorial', SPOKEN)).toStrictEqual({
    language: 'en',
    path: '/tutorial',
  });
});

test('the root is the default language', () => {
  expect(readLanguagePath('/', SPOKEN)).toStrictEqual({
    language: 'en',
    path: '/',
  });
});

test('a language the site does not speak is a page of its own', () => {
  expect(readLanguagePath('/it/tutorial', SPOKEN)).toStrictEqual({
    language: 'en',
    path: '/it/tutorial',
  });
});

test('the default language is never read as a prefix, so /en is a page', () => {
  expect(readLanguagePath('/en/tutorial', SPOKEN)).toStrictEqual({
    language: 'en',
    path: '/en/tutorial',
  });
});

test('a deeper address keeps every segment under the language', () => {
  expect(readLanguagePath('/de/exercises/caf%C3%A9', SPOKEN)).toStrictEqual({
    language: 'de',
    path: '/exercises/caf%C3%A9',
  });
});

test('an address is written under the language it is read in', () => {
  expect(withLanguagePath('fr', '/tutorial')).toBe('/fr/tutorial');
});

test('the front page of a language is the language alone', () => {
  expect(withLanguagePath('fr', '/')).toBe('/fr');
});

test('the default language writes no prefix at all', () => {
  expect(withLanguagePath('en', '/tutorial')).toBe('/tutorial');
  expect(withLanguagePath('en', '/')).toBe('/');
});

test('writing then reading an address gives back what went in', () => {
  for (const language of SPOKEN) {
    for (const path of ['/', '/tutorial', '/exercises/1']) {
      expect(
        readLanguagePath(withLanguagePath(language, path), SPOKEN),
      ).toStrictEqual({ language, path });
    }
  }
});
