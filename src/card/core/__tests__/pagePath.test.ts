/**
 * A page and its parameters, as the tool servers' link builders wrote them:
 * chembio's and wikidata's searchPath, pdb's browsePath, openbabel's
 * formatsPath.
 */

import { expect, test } from 'vitest';

import { pagePath, withQuery } from '../pagePath.ts';

test('a search keeps its commas and escapes a plus, as the page reads it', () => {
  expect(pagePath('/', { q: 'C[N+](C)(C)C', taxon: '3311,3469' })).toBe(
    '/?q=C%5BN%2B%5D(C)(C)C&taxon=3311,3469',
  );
  expect(pagePath('/', { name: undefined })).toBe('/');
});

test('a search address escapes a plus and a space, keeps a comma, drops the unset', () => {
  expect(
    pagePath('/', {
      q: 'sodium chloride',
      smiles: 'C[N+](C)(C)C',
      infobox: 'chembox,drugbox',
      mode: undefined,
      sort: '',
    }),
  ).toBe(
    '/?q=sodium%20chloride&smiles=C%5BN%2B%5D(C)(C)C&infobox=chembox,drugbox',
  );
  expect(pagePath('/', { q: undefined })).toBe('/');
});

test('the formats page names only the search it shows', () => {
  expect(pagePath('/formats', { q: undefined, direction: undefined })).toBe(
    '/formats',
  );
  expect(
    pagePath('/formats', { q: 'gaussian input', direction: 'write' }),
  ).toBe('/formats?q=gaussian%20input&direction=write');
});

test('a browser narrowed to one entry, and a page of ligands', () => {
  expect(pagePath('/browse', { smart: 'id:=4HHB' })).toBe(
    '/browse?smart=id%3A%3D4HHB',
  );
  expect(pagePath('/molecules', { q: 'HEM', hidden: null })).toBe(
    '/molecules?q=HEM',
  );
});

test('a query is appended only when there is one', () => {
  expect(withQuery('https://pdb.cheminfo.org/browse', '')).toBe(
    'https://pdb.cheminfo.org/browse',
  );
  expect(withQuery('/titration', 'ind=phenolphthalein')).toBe(
    '/titration?ind=phenolphthalein',
  );
});
