import { expect, test } from 'vitest';

import { routeOfTab } from '../routes.ts';

const ROUTES = [
  { tab: 'bench', path: '/' },
  { tab: 'tutorial', path: '/tutorial' },
  { tab: 'about', path: '/about' },
] as const;

test('a tab finds its route, an unknown one the first or the fallback', () => {
  expect(routeOfTab(ROUTES, 'tutorial')).toStrictEqual({
    tab: 'tutorial',
    path: '/tutorial',
  });
  expect(
    routeOfTab<{ tab: string; path: string }>(ROUTES, 'gone'),
  ).toStrictEqual({
    tab: 'bench',
    path: '/',
  });
  expect(
    routeOfTab<{ tab: string; path: string }>(ROUTES, 'gone', ROUTES[2]),
  ).toStrictEqual({ tab: 'about', path: '/about' });
});

test('an empty table answers no route', () => {
  expect(() => routeOfTab<{ tab: string }>([], 'bench')).toThrow(
    'a site answers at least one route',
  );
});
