import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { expect, test } from 'vitest';

import { staticGraph } from '../../build/vite/__tests__/importGraph.ts';

const ENTRY = resolve(import.meta.dirname, '../../server.ts');

const PEERS = new Set([
  'fastify',
  '@fastify/static',
  '@fastify/type-provider-typebox',
  'react',
  'react-dom',
  'vite',
]);

test('importing react-cheminfo/server loads no optional peer', () => {
  const graph = staticGraph(ENTRY);
  const offenders: string[] = [];
  for (const [file, specifiers] of graph) {
    for (const specifier of specifiers) {
      if (PEERS.has(specifier)) offenders.push(`${file}: ${specifier}`);
    }
  }

  expect(graph.has(resolve(import.meta.dirname, '../spaSite.ts'))).toBe(true);
  expect(graph.has(resolve(import.meta.dirname, '../toolSiteServer.ts'))).toBe(
    true,
  );
  // fastify and @fastify/static are imported on the first call, and the
  // TypeBox provider only ever as a type.
  expect(offenders).toStrictEqual([]);
});

test('what the server imports on its first call is a dependency, never an optional peer', () => {
  const manifest = JSON.parse(
    readFileSync(resolve(import.meta.dirname, '../../../package.json'), 'utf8'),
  ) as { dependencies?: Record<string, string> };
  const onFirstCall = new Set<string>();
  for (const file of staticGraph(ENTRY).keys()) {
    const imports = readFileSync(file, 'utf8').matchAll(
      /\bimport\(\s*'(?<specifier>[^'.][^']*)'\s*\)/gu,
    );
    for (const match of imports) {
      onFirstCall.add((match.groups as { specifier: string }).specifier);
    }
  }

  // A workspace repository hoists react-cheminfo to its root and may keep an
  // optional peer under one workspace, where this import cannot reach it.
  expect([...onFirstCall].toSorted()).toStrictEqual([
    '@fastify/static',
    'fastify',
  ]);
  expect(
    [...onFirstCall].filter((name) => !(name in (manifest.dependencies ?? {}))),
  ).toStrictEqual([]);
});
