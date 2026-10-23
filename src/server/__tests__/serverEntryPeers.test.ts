import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

import { expect, test } from 'vitest';

const ENTRY = resolve(import.meta.dirname, '../../server.ts');

const PEERS = new Set([
  'fastify',
  '@fastify/static',
  '@fastify/type-provider-typebox',
  'react',
  'react-dom',
  'vite',
]);

/**
 * The bare specifiers every module a static `import` of the entry point pulls
 * in reads at load time; a type-only import is erased and skipped.
 * @param entry - The file to start from.
 * @returns Each visited file, with its bare specifiers.
 */
function staticGraph(entry: string): Map<string, string[]> {
  const seen = new Map<string, string[]>();
  const queue = [entry];
  const statements =
    /^(?<kind>import|export)(?<clause>[^'"]*?)from\s*'(?<specifier>[^']+)'/gmu;

  while (queue.length > 0) {
    const file = queue.pop() as string;
    if (seen.has(file)) continue;
    const bare: string[] = [];
    for (const match of readFileSync(file, 'utf8').matchAll(statements)) {
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
