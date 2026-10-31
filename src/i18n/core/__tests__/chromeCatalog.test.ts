import { expect, test } from 'vitest';

import { ECOSYSTEM_SITES } from '../../../ecosystem/core/sites.ts';
import { UNLISTED_SITES } from '../../../ecosystem/core/unlistedSites.ts';
import { CHROME_CATALOG, CHROME_CATALOG_ID } from '../chromeCatalog.ts';
import { LANGUAGES } from '../languages.ts';
import { loadCatalogs } from '../translateSetup.ts';

test('the chrome reads in English without fetching anything', () => {
  expect(CHROME_CATALOG.translate('share.button', 'en')).toBe('Share');
  expect(CHROME_CATALOG.translate('ecosystem.tools', 'fr')).toBe('Tools');
});

test('every language the family speaks arrives complete', async () => {
  const keys = Object.keys(CHROME_CATALOG.source.messages);
  for (const language of LANGUAGES) {
    // eslint-disable-next-line no-await-in-loop -- one chunk per language, read in turn
    const messages = await CHROME_CATALOG.load(language);

    expect(Object.keys(messages)).toHaveLength(keys.length);
  }

  expect(CHROME_CATALOG.translate('share.button', 'fr')).toBe('Partager');
  expect(CHROME_CATALOG.translate('share.button', 'de')).toBe('Teilen');
  expect(CHROME_CATALOG.translate('share.button', 'es')).toBe('Compartir');
  expect(CHROME_CATALOG.translate('share.button', 'it')).toBe('Condividi');
});

test('every site of the family has its tagline in the catalog, as its record words it', () => {
  const messages: Record<string, string> = CHROME_CATALOG.source.messages;
  const astray: string[] = [];
  for (const site of [...ECOSYSTEM_SITES, ...UNLISTED_SITES]) {
    if (messages[`site.${site.id}.tagline`] !== site.tagline) {
      astray.push(site.id);
    }
  }

  expect(astray).toStrictEqual([]);
});

test('a placeholder survives every translation', () => {
  expect(
    CHROME_CATALOG.translate('periodic.group', 'de', { values: { group: 17 } }),
  ).toBe('Gruppe 17');
});

test('the catalogs a translator is handed name their repository', async () => {
  const loaded = await loadCatalogs([CHROME_CATALOG], 'fr');

  expect(loaded.catalogs).toHaveLength(1);
  expect(loaded.catalogs[0]?.repository).toBe('cheminfo/react-cheminfo');
  expect(loaded.catalogs[0]?.directory).toBe('src/locales');
  expect(loaded.translations[CHROME_CATALOG_ID]?.['share.button']).toBe(
    'Partager',
  );
});

test('a locale the family does not speak is offered nothing published', async () => {
  const loaded = await loadCatalogs([CHROME_CATALOG], 'pt');

  expect(loaded.translations).toStrictEqual({});
});
