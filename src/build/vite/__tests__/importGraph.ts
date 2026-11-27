import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

/**
 * Every module a static `import` of an entry point pulls in, with the bare
 * specifiers each reads at load time. Static `import ... from '…'` and
 * `export ... from '…'` only: a type-only import is erased, and a dynamic
 * `import('…')` is what the entry tests are about.
 * @param entry - The file to start from.
 * @returns Each visited file, with its bare specifiers.
 */
export function staticGraph(entry: string): Map<string, string[]> {
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
