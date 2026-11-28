import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { expect, test } from 'vitest';

import type { RouteMeta } from '../../core/routes.ts';

import { PAGE, build } from './prerenderHarness.ts';

const ROOT = resolve(import.meta.dirname, '../../../..');

// Descriptions a result has room for, so the build is clean but for what the
// page not found could break.
const ROUTES: RouteMeta[] = [
  {
    path: '/',
    title: 'Conformers in 3D',
    description:
      'Draw a structure and turn its conformers in three dimensions, ranked by their energy, then measure a distance, an angle or a dihedral.',
  },
  {
    path: '/about',
    title: 'About',
    description:
      'Who made the conformer playground, what it is built on, and how to cite it when a structure from it reaches a publication or a course.',
  },
];

test('a build carrying the page not found passes check-seo', async () => {
  const out = mkdtempSync(join(tmpdir(), 'cheminfo-not-found-seo-'));
  writeFileSync(join(out, 'index.html'), PAGE);
  writeFileSync(join(out, 'og.png'), '');
  await build({ site: '3d', routes: ROUTES, notFound: true }, out);

  // The published bin reads the built library; this checkout has only its
  // sources, so the one import is resolved to them, as check-messages does.
  const hook = join(
    mkdtempSync(join(tmpdir(), 'cheminfo-check-seo-')),
    'hook.mjs',
  );
  writeFileSync(
    hook,
    `import { registerHooks } from 'node:module';
const BIN = ${JSON.stringify(pathToFileURL(join(ROOT, 'bin/')).href)};
const SOURCE = ${JSON.stringify(pathToFileURL(join(ROOT, 'src/core.ts')).href)};
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === '../lib/core.js' && context.parentURL?.startsWith(BIN)) {
      return nextResolve(SOURCE, context);
    }
    return nextResolve(specifier, context);
  },
});
`,
  );
  const report = execFileSync(
    process.execPath,
    [
      '--import',
      pathToFileURL(hook).href,
      join(ROOT, 'bin/check-seo.mjs'),
      out,
    ],
    { encoding: 'utf8' },
  );

  // The page not found is no address of the sitemap, so it is not counted
  // among the pages; it is read for shipped sources like every other file.
  expect(report).toBe('no indexing problem in 2 pages\n');
}, 60_000);
