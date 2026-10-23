import { expect, test } from 'vitest';

import { parseRouteTable, serializeRouteTable } from '../routeTable.ts';
import type { RouteMeta } from '../routes.ts';

const ROUTES: RouteMeta[] = [
  { path: '/', title: 'Editor', description: 'Write LaTeX.', short: 'Editor' },
  {
    path: '/admin',
    title: 'Curation',
    description: 'The queue.',
    indexed: false,
  },
  {
    path: '/molecules',
    title: 'A molecule',
    description: 'One molecule.',
    prefix: true,
    note: 'one page per structure',
  },
];

test('a table is written with every field it carries, in a fixed order', () => {
  expect(JSON.parse(serializeRouteTable(ROUTES))).toStrictEqual(ROUTES);
  expect(serializeRouteTable([{ path: '/', title: 'T', description: 'D' }]))
    .toBe(`[
  {
    "path": "/",
    "title": "T",
    "description": "D"
  }
]
`);
});

test('the fields asked for are written, and never fewer than a route needs', () => {
  expect(JSON.parse(serializeRouteTable(ROUTES, ['indexed']))).toStrictEqual([
    { path: '/', title: 'Editor', description: 'Write LaTeX.' },
    {
      path: '/admin',
      title: 'Curation',
      description: 'The queue.',
      indexed: false,
    },
    { path: '/molecules', title: 'A molecule', description: 'One molecule.' },
  ]);
});

test('a table reads back as it was written, and nothing else', () => {
  const written: unknown = JSON.parse(serializeRouteTable(ROUTES));
  const extra = [{ ...ROUTES[0], step: 3 }];

  expect(parseRouteTable(written)).toStrictEqual(ROUTES);
  expect(parseRouteTable(extra)).toStrictEqual([ROUTES[0]]);
});

test('anything the build did not write is refused', () => {
  expect(parseRouteTable(undefined)).toBeUndefined();
  expect(parseRouteTable({ path: '/' })).toBeUndefined();
  expect(parseRouteTable([])).toBeUndefined();
  expect(parseRouteTable([{ path: '/', title: 'T' }])).toBeUndefined();
  expect(
    parseRouteTable([
      { path: '/', title: 'T', description: 'D', indexed: 'no' },
    ]),
  ).toBeUndefined();
  expect(
    parseRouteTable([
      { path: '/a', title: 'A', description: 'D' },
      { path: '/a/', title: 'A again', description: 'D' },
    ]),
  ).toBeUndefined();
  expect(
    parseRouteTable([{ path: 'about', title: 'A', description: 'D' }]),
  ).toBeUndefined();
});
