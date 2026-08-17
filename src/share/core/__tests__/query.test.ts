import { expect, test } from 'vitest';

import { firstValues, parseQuery, serializeQuery } from '../query.ts';

test('an empty query has no pairs', () => {
  expect(parseQuery('')).toStrictEqual([]);
  expect(parseQuery('?')).toStrictEqual([]);
  expect(serializeQuery([])).toBe('');
});

test('the leading question mark is optional', () => {
  expect(parseQuery('?mf=CH4')).toStrictEqual([['mf', 'CH4']]);
  expect(parseQuery('mf=CH4')).toStrictEqual([['mf', 'CH4']]);
});

test('a key without a value reads as an empty value', () => {
  expect(parseQuery('embed&mf=CH4')).toStrictEqual([
    ['embed', ''],
    ['mf', 'CH4'],
  ]);
});

test('a plus inside a value stays a plus, never a space', () => {
  // `URLSearchParams` would read this as `CC[N ](C)(C)C`, a different molecule.
  expect(parseQuery('smiles=CC[N+](C)(C)C')).toStrictEqual([
    ['smiles', 'CC[N+](C)(C)C'],
  ]);
  expect(new URLSearchParams('smiles=CC[N+](C)(C)C').get('smiles')).toBe(
    'CC[N ](C)(C)C',
  );
});

test('a plus and a comma are written literally, everything else is escaped', () => {
  expect(
    serializeQuery([
      ['smiles', 'CC[N+](C)(C)C'],
      ['hide', 'hints,answers'],
    ]),
  ).toBe('smiles=CC%5BN+%5D(C)(C)C&hide=hints,answers');
});

test('a space is written as %20, so it can never be read back as a plus', () => {
  expect(serializeQuery([['name', 'ethyl acetate']])).toBe(
    'name=ethyl%20acetate',
  );
  expect(parseQuery('name=ethyl%20acetate')).toStrictEqual([
    ['name', 'ethyl acetate'],
  ]);
});

test('a value that reads as an escape sequence survives the round trip', () => {
  const written = serializeQuery([['note', '100%2B of it']]);

  expect(written).toBe('note=100%252B%20of%20it');
  expect(parseQuery(written)).toStrictEqual([['note', '100%2B of it']]);
});

test('a malformed escape is kept as written rather than throwing', () => {
  expect(parseQuery('mf=%ZZ')).toStrictEqual([['mf', '%ZZ']]);
});

test('the first value wins when a link names a key twice', () => {
  const values = firstValues(parseQuery('mf=CH4&mf=C2H6&hide=menu'));

  expect(values.get('mf')).toBe('CH4');
  expect(values.get('hide')).toBe('menu');
  expect(values.size).toBe(2);
});
