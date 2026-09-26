import { expect, test } from 'vitest';

import { MessageCatalog } from '../messageCatalog.ts';
import { setMessageSession } from '../session.ts';

const EN = {
  'greeting.hello': 'Hello',
  'greeting.named': 'Hello {name}',
} as const;

function catalog(): MessageCatalog<keyof typeof EN> {
  return new MessageCatalog<keyof typeof EN>({
    id: 'test',
    repository: 'cheminfo/test',
    directory: 'src/locales',
    source: EN,
    translations: {
      fr: { 'greeting.hello': 'Bonjour' },
      de: async () => ({ default: { 'greeting.hello': 'Hallo' } }),
    },
  });
}

test('a message is read in the language asked for', () => {
  expect(catalog().translate('greeting.hello', 'fr')).toBe('Bonjour');
});

test('a message the translation lacks falls back to English', () => {
  expect(
    catalog().translate('greeting.named', 'fr', { values: { name: 'Ada' } }),
  ).toBe('Hello Ada');
});

test('a language the catalog does not carry reads as English', () => {
  expect(catalog().translate('greeting.hello', 'es')).toBe('Hello');
});

test('a key no catalog declares reads as its fallback, placeholders filled', () => {
  expect(
    catalog().translate('site.surge.tagline', 'fr', {
      fallback: 'A {what}',
      values: { what: 'tagline' },
    }),
  ).toBe('A tagline');
});

test('a key no catalog declares and no fallback names reads as the key', () => {
  expect(catalog().translate('nothing.here', 'fr')).toBe('nothing.here');
});

test('a placeholder the values do not name is left as it is', () => {
  expect(catalog().translate('greeting.named', 'en', { values: {} })).toBe(
    'Hello {name}',
  );
});

test('a language behind a loader is English until it has landed', async () => {
  const messages = catalog();

  expect(messages.translate('greeting.hello', 'de')).toBe('Hello');

  await messages.load('de');

  expect(messages.translate('greeting.hello', 'de')).toBe('Hallo');
});

test('loading the same language twice fetches it once', async () => {
  let fetched = 0;
  const messages = new MessageCatalog<keyof typeof EN>({
    id: 'test',
    repository: 'cheminfo/test',
    directory: 'src/locales',
    source: EN,
    translations: {
      de: async () => {
        fetched++;
        return { default: { 'greeting.hello': 'Hallo' } };
      },
    },
  });
  await Promise.all([messages.load('de'), messages.load('de')]);
  await messages.load('de');

  expect(fetched).toBe(1);
});

test('the languages are those with messages, English included', () => {
  expect(catalog().languages).toStrictEqual(['en', 'fr', 'de']);
});

test('the source a translator edits carries the English messages', () => {
  expect(catalog().source).toStrictEqual({
    id: 'test',
    repository: 'cheminfo/test',
    directory: 'src/locales',
    messages: EN,
  });
});

test('a session formats every message the catalog declares', () => {
  const messages = catalog();
  setMessageSession({
    format: (catalogId, key, values) =>
      `${catalogId}:${key}:${values?.name ?? ''}`,
  });

  expect(
    messages.translate('greeting.named', 'fr', { values: { name: 'Ada' } }),
  ).toBe('test:greeting.named:Ada');
  // A key it does not declare is not the translator's to edit.
  expect(messages.translate('nothing.here', 'fr', { fallback: 'plain' })).toBe(
    'plain',
  );

  setMessageSession(null);

  expect(messages.translate('greeting.hello', 'fr')).toBe('Bonjour');
});

test('an inherited property is never a message', () => {
  expect(catalog().translate('constructor', 'en')).toBe('constructor');
});
