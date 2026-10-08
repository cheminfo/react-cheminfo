import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { expect, test } from 'vitest';

import type { PageContent } from '../../core/pageProse.ts';
import type { RouteMeta } from '../../core/routes.ts';
import type { PrerenderOptions } from '../prerender.ts';

import { PAGE, ROUTES, build, prerendered } from './prerenderHarness.ts';

const CONTENT: Record<string, PageContent> = {
  '/': {
    heading: 'Conformers in 3D',
    paragraphs: ['Draw a structure and the tool turns it in three dimensions.'],
  },
  '/about': {
    heading: 'About the conformer generator',
    paragraphs: ['MMFF94 ranks the geometries it generates.'],
    table: {
      columns: ['Molecule', 'Conformers'],
      rows: [['n-butane', '3']],
    },
  },
};

const OPTIONS: PrerenderOptions = {
  site: '3d',
  routes: ROUTES,
  category: false,
  content: (route: RouteMeta) => CONTENT[route.path],
};

/**
 * Every page a build writes, by the address it answers.
 * @param options - What the build was configured with.
 * @returns The two prerendered pages, keyed by their address.
 */
async function pages(
  options: PrerenderOptions,
): Promise<Record<string, string>> {
  const out = mkdtempSync(join(tmpdir(), 'cheminfo-content-'));
  writeFileSync(join(out, 'index.html'), PAGE);
  await build(options, out);
  return {
    '/': readFileSync(join(out, 'index.html'), 'utf8'),
    '/about': readFileSync(join(out, 'about.html'), 'utf8'),
  };
}

test('each address carries its own text, not the text of the home page', async () => {
  const written = await pages(OPTIONS);

  expect(written['/']).toContain('<h1>Conformers in 3D</h1>');
  expect(written['/']).toContain(
    '<p>Draw a structure and the tool turns it in three dimensions.</p>',
  );
  expect(written['/']).not.toContain('MMFF94');

  expect(written['/about']).toContain('<h1>About the conformer generator</h1>');
  expect(written['/about']).toContain(
    '<p>MMFF94 ranks the geometries it generates.</p>',
  );
  expect(written['/about']).toContain('<td>n-butane</td><td>3</td>');
  expect(written['/about']).not.toContain('turns it in three dimensions');
});

test('the crawl path is still under the text, on every address', async () => {
  const written = await pages(OPTIONS);
  for (const page of Object.values(written)) {
    expect(page).toContain('<li><a href="/about">About</a></li>');
    expect(page).toContain('these are the pages it offers:');
  }
});

test('a page the site writes nothing for keeps the menu it had', async () => {
  const page = await prerendered({ ...OPTIONS, content: () => undefined });

  expect(page).toContain('<h1>3d.cheminfo.org</h1>');
  expect(page).not.toContain('<p>Draw a structure and the tool turns');
});

test('a site that writes no content at all is prerendered exactly as before', async () => {
  const { content, ...without } = OPTIONS;

  await expect(
    prerendered({ ...without, content: () => undefined }),
  ).resolves.toBe(await prerendered(without));
});

test('a site with no crawl path is left without the text too', async () => {
  const page = await prerendered({ ...OPTIONS, noscript: false });

  expect(page).not.toContain('<noscript>');
  expect(page).not.toContain('Conformers in 3D</h1>');
});
