/**
 * The address arrives from bookmarks, course pages and hand-edited slides, so
 * writing one parameter must leave every other one exactly as it was found —
 * including the ones this version knows nothing about.
 */

import { expect, test } from 'vitest';

import { firstQueryValues, parseQueryEntries } from '../query.ts';
import { setSearchParams, withQueryValue } from '../queryPatch.ts';

function valueOf(search: string, key: string): string | undefined {
  return firstQueryValues(parseQueryEntries(search)).get(key);
}

test('one parameter is written, the others kept, a bare switch included', () => {
  expect(withQueryValue('', 'q', 'nmr')).toBe('?q=nmr');
  expect(withQueryValue('?embed&hide=search&q=ir', 'q', 'nmr')).toBe(
    '?embed&hide=search&q=nmr',
  );
  expect(withQueryValue('?embed&q=ir', 'q', null)).toBe('?embed');
  expect(withQueryValue('?q=ir', 'q', null)).toBe('');
  expect(withQueryValue('', 'q', 'C6H12O6 + water')).toBe(
    '?q=C6H12O6%20%2B%20water',
  );
});

test('a parameter this version never heard of comes back reading as itself', () => {
  expect(withQueryValue('?embed=1&hide=tabs,inchi', 'split', '35')).toBe(
    '?embed=1&hide=tabs,inchi&split=35',
  );

  const carried = withQueryValue('?from=talk:inchi:layers:4', 'split', '70');

  expect(valueOf(carried, 'from')).toBe('talk:inchi:layers:4');
  expect(valueOf(carried, 'split')).toBe('70');
});

test('writing over a parameter moves it last, and null takes it out', () => {
  expect(withQueryValue('?split=35&hide=tabs', 'split', '70')).toBe(
    '?hide=tabs&split=70',
  );
  expect(withQueryValue('?split=35&hide=tabs', 'split', null)).toBe(
    '?hide=tabs',
  );
  expect(withQueryValue('', 'split', null)).toBe('');
  expect(withQueryValue('?embed', 'split', '35')).toBe('?embed&split=35');
});

test('a plus stays a plus, and the ? can be left off', () => {
  const written = withQueryValue('?smiles=CC[N+](C)(C)C', 'split', '35');

  expect(written).toBe('?smiles=CC%5BN%2B%5D(C)(C)C&split=35');
  expect(valueOf(written, 'smiles')).toBe('CC[N+](C)(C)C');
  expect(withQueryValue('a=1', 'span', '7', { prefix: false })).toBe(
    'a=1&span=7',
  );
});

test('setSearchParams writes a value in place, keeping the order', () => {
  expect(
    setSearchParams('targetMass=195.0877&precision=100&range=C0-15', {
      precision: '5',
    }),
  ).toBe('targetMass=195.0877&precision=5&range=C0-15');
});

test('setSearchParams appends a parameter the address does not carry', () => {
  expect(setSearchParams('?targetMass=195.0877', { precision: '5' })).toBe(
    'targetMass=195.0877&precision=5',
  );
});

test('setSearchParams takes out a parameter set to null', () => {
  expect(setSearchParams('a=1&precision=100&b=2', { precision: null })).toBe(
    'a=1&b=2',
  );
});

test('setSearchParams replaces a parameter named twice once', () => {
  expect(
    setSearchParams('level=basic&level=advanced&a=1', { level: 'hard' }),
  ).toBe('level=hard&a=1');
});

test('setSearchParams keeps a plus in another parameter', () => {
  expect(setSearchParams('ionizations=H%2B', { level: 'basic' })).toBe(
    'ionizations=H%2B&level=basic',
  );
});
