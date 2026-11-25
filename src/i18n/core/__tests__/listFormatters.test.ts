import { expect, test } from 'vitest';

import { listFormatters } from '../listFormatters.ts';

test('a language’s lists are written as it writes them, by formatters made once', () => {
  const english = listFormatters('en');
  const french = listFormatters('fr');
  const items = ['a', 'b', 'c'];

  expect([
    listFormatters('en') === english,
    english.names(items),
    english.either(items),
    english.values(items),
    english.narrow(items),
    french.names(items),
  ]).toStrictEqual([
    true,
    'a, b, and c',
    'a, b, or c',
    'a, b, c',
    'a b c',
    'a, b et c',
  ]);
});
