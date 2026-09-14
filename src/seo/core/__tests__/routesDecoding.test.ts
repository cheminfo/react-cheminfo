import { expect, test } from 'vitest';

import type { RouteMeta } from '../routes.ts';
import { pageMetaFor, routeFor } from '../routes.ts';

const ROUTES: RouteMeta[] = [
  { path: '/', title: 'Home', description: 'The tool.' },
  { path: '/exercises/café', title: 'Café', description: 'An exercise.' },
  { path: '/a/b', title: 'Nested', description: 'Two segments.' },
  { path: '/c%2Fd', title: 'Slashed', description: 'One segment.' },
  {
    path: '/names/α-pinene',
    title: 'Pinene',
    description: 'A section.',
    prefix: true,
  },
];

test('an address a browser percent-encodes names the route written plainly', () => {
  expect(pageMetaFor(ROUTES, '/exercises/caf%C3%A9?embed=1').title).toBe(
    'Café',
  );
  expect(routeFor(ROUTES, '/exercises/caf%C3%A9/')?.title).toBe('Café');
  expect(pageMetaFor(ROUTES, '/names/%CE%B1-pinene/3d').title).toBe('Pinene');
});

test('an encoded slash stays inside its segment', () => {
  expect(routeFor(ROUTES, '/a/b')?.title).toBe('Nested');
  expect(routeFor(ROUTES, '/a%2Fb')).toBeUndefined();
  expect(pageMetaFor(ROUTES, '/a%2Fb').title).toBe('Home');
  expect(routeFor(ROUTES, '/c%2Fd')?.title).toBe('Slashed');
  expect(routeFor(ROUTES, '/c/d')).toBeUndefined();
});

test('an escape that does not decode names no route', () => {
  expect(pageMetaFor(ROUTES, '/exercises/caf%E9').title).toBe('Home');
  expect(routeFor(ROUTES, '/exercises/caf%E9')).toBeUndefined();
});
