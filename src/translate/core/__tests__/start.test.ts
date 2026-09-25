import { expect, test } from 'vitest';

import { readTranslateLocale } from '../start.ts';

test('a page is in translate mode when its address names a language', () => {
  expect(readTranslateLocale('?translate=fr')).toBe('fr');
  expect(readTranslateLocale('?p=melting&translate=pt-BR')).toBe('pt-BR');
});

test('a page is not in translate mode for English, or for nonsense', () => {
  expect(readTranslateLocale('?translate=en')).toBeUndefined();
  expect(readTranslateLocale('?translate=')).toBeUndefined();
  expect(readTranslateLocale('?translate=en_US')).toBeUndefined();
  expect(readTranslateLocale('?p=melting')).toBeUndefined();
  expect(readTranslateLocale('')).toBeUndefined();
});
