import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { expect, test } from 'vitest';

import type { PrerenderOptions } from '../prerender.ts';

import { PAGE, ROUTES, build, prerendered } from './prerenderHarness.ts';

const OPTIONS: PrerenderOptions = {
  site: '3d',
  routes: ROUTES,
  category: false,
  pages: {
    '/': {
      heading: 'Conformers in 3D',
      paragraphs: ['Draw a structure and the tool turns it in space.'],
    },
  },
};

test('a site passing its pages has each written for, the rest named', async () => {
  const out = mkdtempSync(join(tmpdir(), 'cheminfo-pages-'));
  writeFileSync(join(out, 'index.html'), PAGE);
  await build(OPTIONS, out);
  const home = readFileSync(join(out, 'index.html'), 'utf8');
  const about = readFileSync(join(out, 'about.html'), 'utf8');

  expect(home).toContain('<h1>Conformers in 3D</h1>');
  expect(home).toContain(
    '<p>Draw a structure and the tool turns it in space.</p>',
  );
  expect(about).toContain('<h1>About</h1>');
  expect(about).toContain('<p>What it computes.</p>');
});

test('a content function, when given, is read instead of the pages', async () => {
  const page = await prerendered({
    ...OPTIONS,
    content: () => ({ heading: 'Written by the function' }),
  });

  expect(page).toContain('<h1>Written by the function</h1>');
  expect(page).not.toContain('turns it in space');
});
