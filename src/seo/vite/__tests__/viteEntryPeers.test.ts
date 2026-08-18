import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

import { expect, test } from 'vitest';

import { ogCardHtml } from '../ogCard.ts';

const ENTRY = resolve(import.meta.dirname, '../../../vite.ts');

const PEERS = new Set(['react', 'react-dom', 'react-dom/server']);

/**
 * Every module a static `import` of the entry point pulls in.
 * @param entry - The file to start from.
 * @returns Each visited file, with the bare specifiers it imports at load time.
 */
function staticGraph(entry: string): Map<string, string[]> {
  const seen = new Map<string, string[]>();
  const queue = [entry];

  while (queue.length > 0) {
    const file = queue.pop() as string;
    if (seen.has(file)) continue;
    const source = readFileSync(file, 'utf8');
    const bare: string[] = [];

    // Static `import ... from '…'` and `export ... from '…'` only: a type-only
    // import is erased, and a dynamic `import('…')` is what this file is about.
    const statements =
      /^(?<kind>import|export)(?<clause>[^'"]*?)from\s*'(?<specifier>[^']+)'/gmu;
    for (const match of source.matchAll(statements)) {
      const { clause, specifier } = match.groups as {
        clause: string;
        specifier: string;
      };
      if (/^\s+type\s/u.test(clause)) continue;
      if (specifier.startsWith('.')) {
        queue.push(join(dirname(file), specifier));
      } else {
        bare.push(specifier);
      }
    }
    seen.set(file, bare);
  }
  return seen;
}

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
