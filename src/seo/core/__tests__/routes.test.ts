import { expect, test } from 'vitest';

import type { RouteMeta } from '../routes.ts';
import {
  homeRoute,
  pageMetaFor,
  routeFor,
  trimTrailingSlash,
} from '../routes.ts';

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

test('the query string and the fragment never reach the lookup', () => {
  expect(pageMetaFor(ROUTES, '/about?smiles=CCO')).toStrictEqual(ROUTES[1]);
  expect(pageMetaFor(ROUTES, '/about#section')).toStrictEqual(ROUTES[1]);
});

test('an unknown address is described as the home page', () => {
  expect(pageMetaFor(ROUTES, '/nonsense')).toStrictEqual(ROUTES[0]);
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
