import { expect, test } from 'vitest';

import { catalogFile, isCatalogDirectory } from '../catalog.ts';

test('a relative path ending in locales names a catalog directory', () => {
  expect(isCatalogDirectory('frontend/src/locales')).toBe(true);
  expect(isCatalogDirectory('locales')).toBe(true);
  expect(isCatalogDirectory('src/share/locales')).toBe(true);
});

test('a path that could escape, is absolute, or is not a locales directory is refused', () => {
  expect(isCatalogDirectory('../locales')).toBe(false);
  expect(isCatalogDirectory('src/./locales')).toBe(false);
  expect(isCatalogDirectory('/src/locales')).toBe(false);
  expect(isCatalogDirectory('src/messages')).toBe(false);
  expect(isCatalogDirectory('src//locales')).toBe(false);
});

test('a locale file sits in the catalog directory, named after the locale', () => {
  expect(catalogFile('frontend/src/locales', 'pt-BR')).toBe(
    'frontend/src/locales/pt-BR.json',
  );
});
