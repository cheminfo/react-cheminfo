import { expect, test } from 'vitest';

import { createTabRouter } from '../tabRouter.ts';

type Tab = 'convert' | 'tutorial' | 'exercises' | 'cheatsheet';

function router() {
  return createTabRouter<Tab>({
    tabs: [
      'convert',
      { id: 'tutorial', takesId: true },
      { id: 'exercises', takesId: true },
      'cheatsheet',
    ],
    home: 'convert',
  });
}

test('an address names a tab, its item and its configuration', () => {
  expect(router().parse('/tutorial/3?hide=hints')).toStrictEqual({
    tab: 'tutorial',
    id: '3',
    params: { hide: 'hints' },
  });
  expect(router().parse('/cheatsheet')).toStrictEqual({
    tab: 'cheatsheet',
    id: null,
    params: {},
  });
});

test('the home tab is the root, and answers its own name too', () => {
  expect(router().parse('/')).toStrictEqual({
    tab: 'convert',
    id: null,
    params: {},
  });
  expect(router().parse('/convert').tab).toBe('convert');
  expect(router().format({ tab: 'convert' })).toBe('/');
});

test('an unknown address opens the home tab, keeping its query', () => {
  expect(router().parse('/nowhere?hide=hints')).toStrictEqual({
    tab: 'convert',
    id: null,
    params: { hide: 'hints' },
  });
  expect(router().parse('')).toStrictEqual({
    tab: 'convert',
    id: null,
    params: {},
  });
});

test('a second segment is kept only by a tab that addresses its items', () => {
  expect(router().parse('/cheatsheet/nonsense').id).toBeNull();
  expect(router().parse('/exercises/word-boundary').id).toBe('word-boundary');
  expect(router().format({ tab: 'cheatsheet', id: 'nonsense' })).toBe(
    '/cheatsheet',
  );
});

test('a trailing slash, a fragment and an encoded item all resolve', () => {
  expect(router().parse('/tutorial/').id).toBeNull();
  expect(router().parse('/exercises/a%20b').id).toBe('a b');
  expect(router().parse('/exercises/one#results').id).toBe('one');
  expect(router().parse('/exercises/100%').id).toBe('100%');
});

test('a route is written back as the address that parses to it', () => {
  const address = router().format({
    tab: 'exercises',
    id: 'word boundary',
    params: { hide: 'hints,examples', embed: '' },
  });

  expect(address).toBe('/exercises/word%20boundary?hide=hints,examples');
  expect(router().parse(address)).toStrictEqual({
    tab: 'exercises',
    id: 'word boundary',
    params: { hide: 'hints,examples' },
  });
});

test('a tab the router does not know is written as the home tab', () => {
  expect(router().format({ tab: 'nowhere' as Tab, params: { a: '1' } })).toBe(
    '/?a=1',
  );
  expect(router().isTab('tutorial')).toBe(true);
  expect(router().isTab('nowhere')).toBe(false);
});

test('a mount path is stripped on the way in and written on the way out', () => {
  const mounted = createTabRouter<Tab>({
    tabs: ['convert', { id: 'tutorial', takesId: true }],
    home: 'convert',
    basePath: '/surge/',
  });

  expect(mounted.parse('/surge/tutorial/3').id).toBe('3');
  expect(mounted.parse('/surge').tab).toBe('convert');
  expect(mounted.format({ tab: 'tutorial', id: '3' })).toBe(
    '/surge/tutorial/3',
  );
  expect(mounted.format({ tab: 'convert' })).toBe('/surge/');
});

test('hash mode reads and writes the fragment, with or without its #', () => {
  const hash = createTabRouter<Tab>({
    tabs: ['convert', { id: 'tutorial', takesId: true }],
    home: 'convert',
    mode: 'hash',
  });

  expect(hash.parse('#/tutorial/3?hide=hints')).toStrictEqual({
    tab: 'tutorial',
    id: '3',
    params: { hide: 'hints' },
  });
  expect(hash.parse('/tutorial/3').id).toBe('3');
  expect(hash.format({ tab: 'tutorial', id: '3' })).toBe('#/tutorial/3');
  expect(hash.format({ tab: 'convert' })).toBe('#/');
});

test('a legacy hash link opens the page it named, when adoption is on', () => {
  const adopting = createTabRouter<Tab>({
    tabs: ['convert', { id: 'tutorial', takesId: true }],
    home: 'convert',
    adoptLegacyHash: true,
  });

  expect(adopting.parse('/#/tutorial/3')).toStrictEqual({
    tab: 'tutorial',
    id: '3',
    params: {},
  });
  expect(adopting.parse('/?embed=1#/tutorial/3').params).toStrictEqual({
    embed: '1',
  });
  expect(router().parse('/#/tutorial/3').tab).toBe('convert');
});

test('a path tab declared under another address keeps that address', () => {
  const aliased = createTabRouter<'prediction' | 'apiDocs'>({
    tabs: ['prediction', { id: 'apiDocs', path: '/api-docs' }],
    home: 'prediction',
  });

  expect(aliased.parse('/api-docs').tab).toBe('apiDocs');
  expect(aliased.format({ tab: 'apiDocs' })).toBe('/api-docs');
});

test('a shared SMILES survives the round trip through the address', () => {
  const address = router().format({
    tab: 'convert',
    params: { smiles: 'CC[N+](C)(C)C' },
  });

  expect(router().parse(address).params.smiles).toBe('CC[N+](C)(C)C');
  expect(router().parse('/?smiles=CC[N+](C)(C)C').params.smiles).toBe(
    'CC[N+](C)(C)C',
  );
});

test('keepEmptyValues writes the flag a teacher typed back into the link', () => {
  const flagging = createTabRouter<Tab>({
    tabs: ['convert', 'cheatsheet'],
    home: 'convert',
    keepEmptyValues: true,
  });

  expect(flagging.format({ tab: 'cheatsheet', params: { embed: '' } })).toBe(
    '/cheatsheet?embed',
  );
  expect(flagging.parse('/cheatsheet?embed').params).toStrictEqual({
    embed: '',
  });
});
