import { expect, test } from 'vitest';

import {
  LANGUAGE_PARAM,
  isLanguageTag,
  readLanguageParam,
  withLanguageParam,
} from '../languageParam.ts';

test('the family carries its language as lang', () => {
  expect(LANGUAGE_PARAM).toBe('lang');
});

test('a canonical BCP 47 tag is a language, and nothing else is', () => {
  expect(isLanguageTag('fr')).toBe(true);
  expect(isLanguageTag('pt-BR')).toBe(true);
  expect(isLanguageTag('zh-Hant')).toBe(true);
  expect(isLanguageTag('FR')).toBe(false);
  expect(isLanguageTag('en_US')).toBe(false);
  expect(isLanguageTag('f')).toBe(false);
  expect(isLanguageTag('')).toBe(false);
});

test('an address names the language it is read in', () => {
  expect(readLanguageParam('?lang=de')).toBe('de');
  expect(readLanguageParam('lang=pt-BR&p=melting')).toBe('pt-BR');
  expect(readLanguageParam('?p=melting')).toBeUndefined();
  expect(readLanguageParam('?lang=en_US')).toBeUndefined();
  expect(readLanguageParam('')).toBeUndefined();
});

test('a link is written with the language the visitor is reading in', () => {
  expect(withLanguageParam('https://chemcalc.org/', 'de')).toBe(
    'https://chemcalc.org/?lang=de',
  );
  expect(withLanguageParam('https://chemcalc.org/?mf=C6H6', 'fr')).toBe(
    'https://chemcalc.org/?mf=C6H6&lang=fr',
  );
  expect(withLanguageParam('/table/Fe', 'es')).toBe('/table/Fe?lang=es');
});

test('a link written twice names the language once', () => {
  const once = withLanguageParam('https://chemcalc.org/', 'fr');

  expect(withLanguageParam(once, 'de')).toBe('https://chemcalc.org/?lang=de');
});

test('a link names no language when there is none to carry', () => {
  expect(withLanguageParam('https://chemcalc.org/', undefined)).toBe(
    'https://chemcalc.org/',
  );
  expect(withLanguageParam('https://chemcalc.org/', 'en_US')).toBe(
    'https://chemcalc.org/',
  );
});
