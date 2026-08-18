import { expect, test } from 'vitest';

import type { RouteMeta } from '../routes.ts';
import { assertRoutes } from '../routes.ts';

const ROUTES: RouteMeta[] = [
  { path: '/', title: 'Home', description: 'The home page.' },
  { path: '/about', title: 'About', description: 'What it computes.' },
];

const SECTIONS: RouteMeta[] = [
  { path: '/', title: 'Home', description: 'The home page.' },
  {
    path: '/molecules',
    title: 'The ligands',
    description: 'Every chemical component.',
    prefix: true,
  },
  { path: '/molecules/hem', title: 'HEM', description: 'One ligand.' },
];

test('a route table names each address once', () => {
  expect(() =>
    assertRoutes([
      { path: '/', title: 'Home', description: 'The home page.' },
      { path: '/about', title: 'About', description: 'One.' },
      { path: '/about', title: 'About again', description: 'Two.' },
    ]),
  ).toThrow('a route path is written once: "/about"');
});

test('a trailing slash does not make a second page of one', () => {
  expect(() =>
    assertRoutes([
      { path: '/about', title: 'About', description: 'One.' },
      { path: '/about/', title: 'About', description: 'Two.' },
    ]),
  ).toThrow('a route path is written once: "/about/"');
});

test('a route path that walks out of the build output is refused', () => {
  expect(() =>
    assertRoutes([{ path: '/../escaped', title: 'Out', description: 'No.' }]),
  ).toThrow('a route path stays inside the site: "/../escaped"');
  expect(() =>
    assertRoutes([{ path: '/a/../../b', title: 'Out', description: 'No.' }]),
  ).toThrow('a route path stays inside the site: "/a/../../b"');
});

test('a route path starts at the site root', () => {
  expect(() =>
    assertRoutes([{ path: 'about', title: 'About', description: 'One.' }]),
  ).toThrow('a route path starts at the site root: "about"');
});

test('a route path is not an address with a query string on it', () => {
  expect(() =>
    assertRoutes([
      { path: '/about?tab=1', title: 'About', description: 'One.' },
    ]),
  ).toThrow(
    'a route path carries no query string and no fragment: "/about?tab=1"',
  );
  expect(() =>
    assertRoutes([
      { path: '/about#cite', title: 'About', description: 'One.' },
    ]),
  ).toThrow(
    'a route path carries no query string and no fragment: "/about#cite"',
  );
});

test('a site answering nothing has no table to check', () => {
  expect(() => assertRoutes([])).toThrow('a site answers at least one route');
});

test('the table a site actually ships is accepted', () => {
  expect(() => assertRoutes(ROUTES)).not.toThrow();
  expect(() => assertRoutes(SECTIONS)).not.toThrow();
});

test('an address carrying an empty segment is refused', () => {
  expect(() =>
    assertRoutes([
      { path: '//about', title: 'About', description: 'One.' },
      { path: '/about', title: 'About again', description: 'Two.' },
    ]),
  ).toThrow('a route path names no empty segment: "//about"');
  expect(() =>
    assertRoutes([{ path: '/a//b', title: 'Deep', description: 'One.' }]),
  ).toThrow('a route path names no empty segment: "/a//b"');
});

test('two addresses differing only in case name one file, so one is refused', () => {
  expect(() =>
    assertRoutes([
      { path: '/About', title: 'About', description: 'One.' },
      { path: '/about', title: 'About again', description: 'Two.' },
    ]),
  ).toThrow(
    'two route paths name one file on a case-insensitive disk: "/About" and "/about"',
  );
  expect(() =>
    assertRoutes([
      { path: '/', title: 'Home', description: 'The home page.' },
      { path: '/Molecules/HEM', title: 'HEM', description: 'One.' },
      { path: '/molecules/hem/', title: 'HEM again', description: 'Two.' },
    ]),
  ).toThrow(
    'two route paths name one file on a case-insensitive disk: "/Molecules/HEM" and "/molecules/hem/"',
  );
});

test('a table naming each address once in its own case is accepted', () => {
  expect(() =>
    assertRoutes([
      { path: '/', title: 'Home', description: 'The home page.' },
      { path: '/About', title: 'About', description: 'One.' },
      { path: '/aboutUs', title: 'About us', description: 'Two.' },
    ]),
  ).not.toThrow();
});
