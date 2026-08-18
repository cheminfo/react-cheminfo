import { expect, test } from 'vitest';

import type { RouteMeta } from '../routes.ts';
import { homeRoute, routeFor, trimTrailingSlash } from '../routes.ts';

const ROUTES: RouteMeta[] = [
  { path: '/', title: 'Home', description: 'The home page.' },
  { path: '/about', title: 'About', description: 'What it computes.' },
];

test('an address names its route', () => {
  expect(routeFor(ROUTES, '/about')).toStrictEqual(ROUTES[1]);
});

test('a trailing slash names the same page', () => {
  expect(routeFor(ROUTES, '/about/')).toStrictEqual(ROUTES[1]);
});

test('an address the site does not know names no route', () => {
  expect(routeFor(ROUTES, '/nonsense')).toBeUndefined();
});

test('a site naming no root falls back to its first page', () => {
  const routes: RouteMeta[] = [
    { path: '/first', title: 'First', description: 'One.' },
  ];

  expect(homeRoute(routes)).toStrictEqual(routes[0]);
});

test('a site answering nothing is a mistake, not a fallback', () => {
  expect(() => homeRoute([])).toThrow('a site answers at least one route');
});

test('only a trailing slash is dropped, and never the root itself', () => {
  expect(trimTrailingSlash('/about/')).toBe('/about');
  expect(trimTrailingSlash('/')).toBe('/');
  expect(trimTrailingSlash('https://3d.cheminfo.org/')).toBe(
    'https://3d.cheminfo.org',
  );
});

const SECTIONS: RouteMeta[] = [
  { path: '/', title: 'Home', description: 'The home page.' },
  {
    path: '/molecules',
    title: 'The ligands',
    description: 'Every chemical component.',
    prefix: true,
  },
  {
    path: '/molecules/hem',
    title: 'HEM',
    description: 'One ligand.',
  },
];

test('a section answers every address beneath it', () => {
  expect(routeFor(SECTIONS, '/molecules/CLR')).toStrictEqual(SECTIONS[1]);
  expect(routeFor(SECTIONS, '/molecules/CLR/atoms')).toStrictEqual(SECTIONS[1]);
});

test('an address a page claims exactly beats the section it sits in', () => {
  expect(routeFor(SECTIONS, '/molecules/hem')).toStrictEqual(SECTIONS[2]);
  expect(routeFor(SECTIONS, '/molecules')).toStrictEqual(SECTIONS[1]);
});

test('the longer of two sections claiming an address answers it', () => {
  const routes: RouteMeta[] = [
    { path: '/', title: 'Home', description: 'The home page.', prefix: true },
    {
      path: '/exercises',
      title: 'Exercises',
      description: 'Write it yourself.',
      prefix: true,
    },
    {
      path: '/exercises/patterns',
      title: 'Patterns',
      description: 'Write a SMARTS.',
      prefix: true,
    },
  ];

  expect(routeFor(routes, '/exercises/patterns/3')).toStrictEqual(routes[2]);
  expect(routeFor(routes, '/exercises/smiles')).toStrictEqual(routes[1]);
  expect(routeFor(routes, '/anything')).toStrictEqual(routes[0]);
});

test('a section only claims a path of its own, never a longer name', () => {
  const routes: RouteMeta[] = [
    { path: '/', title: 'Home', description: 'The home page.' },
    {
      path: '/surge',
      title: 'Surge',
      description: 'Isomers.',
      prefix: true,
    },
  ];

  expect(routeFor(routes, '/surgeon')).toBeUndefined();
  expect(routeFor(routes, '/surge/exercises')).toStrictEqual(routes[1]);
});

test('every trailing slash is dropped, so an origin composes one address', () => {
  expect(trimTrailingSlash('https://learn.cheminfo.org/surge//')).toBe(
    'https://learn.cheminfo.org/surge',
  );
  expect(trimTrailingSlash('/about///')).toBe('/about');
  expect(trimTrailingSlash('//')).toBe('/');
  expect(trimTrailingSlash('')).toBe('');
});
