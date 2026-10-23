import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, expect, test } from 'vitest';

import { readRouteTable } from '../../../server/routeTable.ts';
import type { RouteMeta } from '../../core/routes.ts';
import { cheminfoRouteTable } from '../routeTable.ts';

const ROUTES: RouteMeta[] = [
  { path: '/', title: 'Converter', description: 'Convert a structure.' },
  {
    path: '/formats',
    title: 'Formats',
    description: 'Every format.',
    short: 'Formats',
    indexed: true,
  },
];

const made: string[] = [];

afterEach(() => {
  while (made.length > 0) {
    rmSync(made.pop() as string, { force: true, recursive: true });
  }
});

function directory(): string {
  const path = mkdtempSync(join(tmpdir(), 'route-table-'));
  made.push(path);
  return path;
}

type Hook = (...parameters: unknown[]) => void;

function hook(plugin: object, name: string): Hook {
  return (plugin as Record<string, Hook>)[name] as Hook;
}

test('the build writes the table beside the page, and the server reads it', () => {
  const dist = directory();
  const plugin = cheminfoRouteTable({ routes: ROUTES });

  hook(plugin, 'buildStart')();
  hook(plugin, 'writeBundle')({ dir: dist });

  expect(plugin.apply).toBe('build');
  expect(
    JSON.parse(readFileSync(join(dist, 'routes.json'), 'utf8')),
  ).toStrictEqual(ROUTES);
  expect(readRouteTable(dist, [])).toStrictEqual(ROUTES);
});

test('only the fields asked for are written, under the name asked for', () => {
  const dist = directory();
  const plugin = cheminfoRouteTable({
    routes: ROUTES,
    fields: ['short'],
    fileName: 'pages.json',
  });

  hook(plugin, 'writeBundle')({ dir: dist });

  expect(
    JSON.parse(readFileSync(join(dist, 'pages.json'), 'utf8')),
  ).toStrictEqual([
    { path: '/', title: 'Converter', description: 'Convert a structure.' },
    {
      path: '/formats',
      title: 'Formats',
      description: 'Every format.',
      short: 'Formats',
    },
  ]);
});

test('the output directory comes from the resolved config when Rollup names none', () => {
  const project = directory();
  const plugin = cheminfoRouteTable({ routes: ROUTES, fields: [] });

  hook(plugin, 'configResolved')({ root: project, build: { outDir: '.' } });
  hook(plugin, 'writeBundle')({});

  expect(readRouteTable(project, [])).toStrictEqual([
    { path: '/', title: 'Converter', description: 'Convert a structure.' },
    { path: '/formats', title: 'Formats', description: 'Every format.' },
  ]);
});

test('a table naming one address twice fails the build', () => {
  const plugin = cheminfoRouteTable({
    routes: [
      ...ROUTES,
      { path: '/formats/', title: 'Again', description: 'D' },
    ],
  });

  expect(() => hook(plugin, 'buildStart')()).toThrow(
    'a route path is written once: "/formats/"',
  );
});

test('a server falls back on the pages that always exist', () => {
  const fallback: RouteMeta[] = [
    { path: '/', title: 'Home', description: 'The home page.' },
  ];
  const empty = directory();
  const broken = directory();
  writeFileSync(join(broken, 'routes.json'), '{ not json');

  expect(readRouteTable(empty, fallback)).toStrictEqual(fallback);
  expect(readRouteTable(join(empty, 'missing'), fallback)).toStrictEqual(
    fallback,
  );
  expect(readRouteTable(broken, fallback)).toStrictEqual(fallback);
});
