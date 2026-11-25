import { expect, test } from 'vitest';

import { MessageCatalog } from '../messageCatalog.ts';
import { pluralCategory, pluralFamily } from '../plural.ts';

const EN = {
  'objects.kept_one': '1 object kept',
  'objects.kept_other': '{count} objects kept',
  'objects.found': 'Found {count}',
} as const;

function catalog(): MessageCatalog<keyof typeof EN> {
  return new MessageCatalog<keyof typeof EN>({
    id: 'plural-test',
    repository: 'cheminfo/test',
    directory: 'src/locales',
    source: EN,
    translations: {
      fr: {
        'objects.kept_one': '{count} objet gardé',
        'objects.kept_other': '{count} objets gardés',
      },
    },
    formatNumber: (value, language) =>
      value.toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US'),
  });
}

test('the CLDR category of a count is the language’s: French reads 0 and 1.5 as one', () => {
  expect(
    [0, 1, 1.5, 2].map((count) => [
      pluralCategory(count, 'en'),
      pluralCategory(count, 'fr'),
    ]),
  ).toStrictEqual([
    ['other', 'one'],
    ['one', 'one'],
    ['other', 'one'],
    ['other', 'other'],
  ]);
});

function read(count: number, language: 'en' | 'fr' | 'de'): string {
  return catalog().translate('objects.kept', language, { values: { count } });
}

test('a family is read by its base key, its branch chosen by the count in the language asked', () => {
  expect([
    read(0, 'en'),
    read(1, 'en'),
    read(1234, 'en'),
    read(0, 'fr'),
    read(1.5, 'fr'),
    read(3, 'fr'),
    read(1, 'de'),
  ]).toStrictEqual([
    '0 objects kept',
    '1 object kept',
    '1,234 objects kept',
    '0 objet gardé',
    '1,5 objet gardé',
    '3 objets gardés',
    '1 object kept',
  ]);
});

test('a family read without a numeric count reads its other branch, and is declared by its base key', () => {
  const kept = catalog();

  expect([
    kept.translate('objects.kept', 'en'),
    kept.translate('objects.kept', 'en', { values: { count: 'many' } }),
    kept.translate('objects.found', 'en', { values: { count: 12_000 } }),
    kept.declares('objects.kept'),
    kept.declares('objects.lost'),
    pluralFamily('objects.kept_few'),
    pluralFamily('objects.kept'),
  ]).toStrictEqual([
    '{count} objects kept',
    'many objects kept',
    'Found 12,000',
    true,
    false,
    'objects.kept',
    undefined,
  ]);
});

test('the key a message is read under is its own, or its family’s branch for the count', () => {
  const kept = catalog();

  expect([
    kept.resolvedKey('objects.kept', 'en', { count: 1 }),
    kept.resolvedKey('objects.kept', 'fr', { count: 0 }),
    kept.resolvedKey('objects.kept', 'en', { count: 7 }),
    kept.resolvedKey('objects.found', 'en', { count: 1 }),
    kept.resolvedKey('objects.lost', 'en'),
  ]).toStrictEqual([
    'objects.kept_one',
    'objects.kept_one',
    'objects.kept_other',
    'objects.found',
    'objects.lost',
  ]);
});
