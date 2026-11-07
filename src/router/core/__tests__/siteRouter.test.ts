import { expect, test } from 'vitest';

import type { PageRoute } from './siteRouters.ts';
import { conformers, pages, plain, tools } from './siteRouters.ts';

test('a route carries exactly the parts its site declares', () => {
  expect(plain.parse('/compare?axes=logP,logS')).toStrictEqual({
    tab: 'compare',
    query: { axes: 'logP,logS' },
  });
  expect(pages.parse('/learn/sulfur?embed')).toStrictEqual({
    tab: 'learn',
    id: 'sulfur',
    query: { embed: '' },
  });
  expect(conformers.parse('/fr/about')).toStrictEqual({
    tab: 'about',
    query: {},
    language: 'fr',
  });
  expect(tools.parse('/de/orbitals/Fe?subshell=3d')).toStrictEqual({
    tab: 'orbitals',
    id: 'Fe',
    query: { subshell: '3d' },
    language: 'de',
  });
});

test('the home tab is the root, and its own name opens it too', () => {
  const home: PageRoute = { tab: 'calculator', id: null, query: {} };

  expect(pages.parse('')).toStrictEqual(home);
  expect(pages.parse('/calculator')).toStrictEqual(home);
  expect(pages.parse('/Learn')).toStrictEqual(home);
  expect(pages.format({ tab: 'calculator', id: 'benzene', query: {} })).toBe(
    '/',
  );
  expect(pages.pathOf('calculator')).toBe('/');
  expect(pages.pathOf('exercises')).toBe('/exercises');
});

test('a home written under its own name leaves the root a front page opening it', () => {
  expect(tools.parse('/')).toStrictEqual({
    tab: 'table',
    id: null,
    query: {},
    language: 'en',
  });
  expect(tools.parse('/it')).toStrictEqual({
    tab: 'table',
    id: null,
    query: {},
    language: 'it',
  });
  expect(tools.format(tools.parse('/table/Ag?color=density'))).toBe(
    '/table/Ag?color=density',
  );
  expect(
    tools.format({
      tab: 'scatter',
      id: null,
      query: { x: 'Z' },
      language: 'de',
    }),
  ).toBe('/de/scatter?x=Z');
  expect(tools.pathOf('table')).toBe('/table');
});

test('a translated site’s query never carries the language parameter', () => {
  expect(tools.parse('/scatter?lang=fr&x=Z')).toStrictEqual({
    tab: 'scatter',
    id: null,
    query: { x: 'Z' },
    language: 'fr',
  });
  expect(tools.parse('/scatter?lang=eo&x=Z')).toStrictEqual({
    tab: 'scatter',
    id: null,
    query: { x: 'Z' },
    language: 'en',
  });
  expect(plain.parse('/compare?lang=fr').query).toStrictEqual({ lang: 'fr' });
});

test('only the tabs given an id keep a second segment', () => {
  expect(pages.takesId('learn')).toBe(true);
  expect(pages.takesId('calculator')).toBe(false);
  expect(plain.takesId('compare')).toBe(false);
  expect(pages.parse('/about/team')).toStrictEqual({
    tab: 'about',
    id: null,
    query: {},
  });
  expect(pages.format({ tab: 'about', id: 'team', query: {} })).toBe('/about');
});

test('an empty value is carried, unless the site ignores empty values', () => {
  expect(pages.parse('/?mf=&embed').query).toStrictEqual({ mf: '', embed: '' });
  expect(
    conformers.parse('/conformers?smiles=&id=2&embed&hide=').query,
  ).toStrictEqual({ id: '2', embed: '' });
  expect(
    conformers.format({
      tab: 'conformers',
      query: { smiles: '', id: '2' },
      language: 'en',
    }),
  ).toBe('/conformers?id=2');
});
