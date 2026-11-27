import { resolve } from 'node:path';

import { expect, test } from 'vitest';

import { staticGraph } from '../../../build/vite/__tests__/importGraph.ts';
import { ogCardHtml } from '../ogCard.ts';

const ENTRY = resolve(import.meta.dirname, '../../../vite.ts');

const PEERS = new Set(['react', 'react-dom', 'react-dom/server']);

test('importing react-cheminfo/vite loads no peer dependency', () => {
  const graph = staticGraph(ENTRY);

  expect(graph.size).toBeGreaterThan(1);

  const offenders: string[] = [];
  for (const [file, specifiers] of graph) {
    for (const specifier of specifiers) {
      if (PEERS.has(specifier)) offenders.push(`${file}: ${specifier}`);
    }
  }

  // `cheminfoPrerender` must be importable by a site that installed none of the
  // optional peers, so nothing on this entry point's load path may name one.
  expect(offenders).toStrictEqual([]);
});

test('ogCardHtml reaches for react on the call, not on the import', async () => {
  const html = await ogCardHtml({ site: '3d' });

  expect(html.startsWith('<!doctype html>')).toBe(true);
  expect(html).toContain('<svg');
  expect(html).toContain(
    '<h1><span class="lead">3d</span><span class="dot">.</span><span class="alt">cheminfo</span></h1>',
  );
});
