import { join } from 'node:path';

import { expect, test } from 'vitest';

import { MessageCatalog, catalogTranslate } from '../../core/index.ts';
import { readLocaleCatalog } from '../localeCatalog.ts';

const DATA = join(import.meta.dirname, 'data');

type Key = 'seo.home.title' | 'seo.home.description' | 'greeting.named';

/**
 * A page's catalog, written the way every site writes one.
 * @param directory - Where it says its locale files live.
 * @returns The catalog, with a bare loader the build must never invoke.
 */
function pageCatalog(directory: string) {
  return new MessageCatalog<Key>({
    id: 'equilibrium.cheminfo.org',
    repository: 'cheminfo/equilibrium.cheminfo.org',
    directory,
    source: {
      'seo.home.title': 'Equilibrium in the browser',
      'seo.home.description': 'Draw a titration curve.',
      'greeting.named': 'Hello {name}',
    },
    translations: { fr: async () => ({ default: {} }) },
  });
}

/**
 * The same catalog as the build reads it.
 * @param directory - Where the locale files live, under the fixture root.
 * @returns The catalog, every language on disk already in memory.
 */
function build(directory: string) {
  return readLocaleCatalog<Key>(pageCatalog(directory).source, { root: DATA });
}

test('the build reads every language the site carries', () => {
  expect(build('locales').languages.toSorted()).toStrictEqual([
    'de',
    'en',
    'fr',
  ]);
});

test('a head is written in the language of its address', () => {
  const read = build('locales');

  expect(catalogTranslate(read, 'fr')('seo.home.title')).toBe(
    'L’équilibre dans le navigateur',
  );
  expect(catalogTranslate(read, 'de')('seo.home.description')).toBe(
    'Zeichnen Sie eine Titrationskurve.',
  );
  expect(catalogTranslate(read, 'en')('seo.home.title')).toBe(
    'Equilibrium in the browser',
  );
});

test('a key a translation does not carry is written in English', () => {
  expect(
    catalogTranslate(build('locales'), 'fr')('greeting.named', { name: 'Ada' }),
  ).toBe('Hello Ada');
});

test('a language the site does not carry reads as English', () => {
  const read = build('locales');

  expect(read.languages).not.toContain('it');
  expect(catalogTranslate(read, 'it')('seo.home.title')).toBe(
    'Equilibrium in the browser',
  );
});

test('a site with English alone still builds', () => {
  const read = build('partial');

  expect(read.languages).toStrictEqual(['en']);
  expect(catalogTranslate(read, 'es')('seo.home.title')).toBe(
    'Only English here',
  );
});

test('a key no catalog carries reads as its fallback, never as the key', () => {
  expect(
    catalogTranslate(build('locales'), 'fr').or('seo.ph.title', 'pH'),
  ).toBe('pH');
});

test('the files on disk are the keys, not the page catalog they were named by', () => {
  // The page declares English in its own bundle; the build must read the file.
  // A site that edits `en.json` and forgets to rebuild would otherwise ship a
  // head written from the previous release's keys.
  const read = build('locales');

  expect(read.declares('seo.home.title')).toBe(true);
  expect(read.declares('greeting.absent')).toBe(false);
});

test('the build and the page name one directory, so they cannot drift', () => {
  const page = pageCatalog('locales');
  const read = readLocaleCatalog<Key>(page.source, { root: DATA });

  expect(read.id).toBe(page.id);
  expect(read.source.directory).toBe(page.source.directory);
  expect(read.source.repository).toBe(page.source.repository);
});

test('a directory with no English file is a misconfiguration', () => {
  expect(() =>
    readLocaleCatalog(
      {
        id: 'nowhere.cheminfo.org',
        repository: 'cheminfo/nowhere',
        directory: 'absent',
      },
      { root: DATA },
    ),
  ).toThrow(/no en\.json in .*absent/);
});
