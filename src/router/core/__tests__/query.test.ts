import { expect, test } from 'vitest';

import { formatQueryString, parseQueryString } from '../query.ts';

test('a query is read into decoded entries, the leading ? optional', () => {
  expect(parseQueryString('?mf=C6H6&hide=examples,hints')).toStrictEqual({
    mf: 'C6H6',
    hide: 'examples,hints',
  });
  expect(parseQueryString('mf=C6H6')).toStrictEqual({ mf: 'C6H6' });
  expect(parseQueryString('')).toStrictEqual({});
  expect(parseQueryString('?')).toStrictEqual({});
});

test('a plus stays a plus, so a charged SMILES survives being shared', () => {
  expect(parseQueryString('?smiles=CC[N+](C)(C)C').smiles).toBe(
    'CC[N+](C)(C)C',
  );
  expect(parseQueryString('?smiles=CC%5BN%2B%5D(C)(C)C').smiles).toBe(
    'CC[N+](C)(C)C',
  );
});

test('literalPlus off reads a plus as the space URLSearchParams decodes', () => {
  const options = { literalPlus: false };

  expect(parseQueryString('?q=one+two', options).q).toBe('one two');
  expect(parseQueryString('?q=one%2Btwo', options).q).toBe('one+two');
});

test('a bare key reads as present, a repeated one keeps its last value', () => {
  expect(parseQueryString('?embed&hide=hints')).toStrictEqual({
    embed: '',
    hide: 'hints',
  });
  expect(parseQueryString('?mf=C6H6&mf=C5H12')).toStrictEqual({ mf: 'C5H12' });
});

test('an escape that does not decode is taken literally', () => {
  expect(parseQueryString('?mf=100%')).toStrictEqual({ mf: '100%' });
  expect(parseQueryString('?mf=C%zz')).toStrictEqual({ mf: 'C%zz' });
});

test('a key carrying nothing and an empty key are ignored', () => {
  expect(parseQueryString('?&=value&a=1')).toStrictEqual({ a: '1' });
});

test('writing drops what carries nothing and keeps commas readable', () => {
  expect(
    formatQueryString({
      mf: 'C6H6,C5H12',
      hide: '',
      level: undefined,
      seed: null,
    }),
  ).toBe('mf=C6H6,C5H12');
  expect(formatQueryString({})).toBe('');
});

test('keepEmptyValues writes the bare key a teacher types by hand', () => {
  expect(formatQueryString({ embed: '', mf: 'C6H6' })).toBe('mf=C6H6');
  expect(
    formatQueryString({ embed: '', mf: 'C6H6' }, { keepEmptyValues: true }),
  ).toBe('embed&mf=C6H6');
});

test('a value written out reads back as itself', () => {
  const params = { smiles: 'CC[N+](C)(C)C', hide: 'examples,hints' };
  const search = formatQueryString(params);

  expect(search).toBe('smiles=CC%5BN%2B%5D(C)(C)C&hide=examples,hints');
  expect(parseQueryString(search)).toStrictEqual(params);
});
