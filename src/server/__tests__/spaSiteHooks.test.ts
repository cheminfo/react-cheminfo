import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { fastify } from 'fastify';
import { afterAll, beforeAll, expect, test } from 'vitest';

import type { RouteMeta } from '../../seo/core/routes.ts';
import { spaSite } from '../spaSite.ts';
import type { SpaPage, SpaSiteOptions } from '../spaSiteOptions.ts';

const TEMPLATE =
  '<!doctype html><html lang="en"><head><!--cheminfo:head--></head><body><!--cheminfo:body--></body></html>';

const ROUTES: RouteMeta[] = [
  {
    path: '/',
    title: 'Wikipedia chemistry',
    description: 'Every Wikipedia compound with a Chembox.',
  },
  { path: '/about', title: 'About', description: 'Where the data comes from.' },
];

let root: string;
let bare: string;

beforeAll(() => {
  root = mkdtempSync(join(tmpdir(), 'spa-hooks-'));
  writeFileSync(join(root, 'index.html'), TEMPLATE);
  bare = mkdtempSync(join(tmpdir(), 'spa-bare-'));
  writeFileSync(
    join(bare, 'index.html'),
    '<html><head><title>translate</title></head><body></body></html>',
  );
});

afterAll(() => {
  rmSync(root, { recursive: true, force: true });
  rmSync(bare, { recursive: true, force: true });
});

async function site(options: Partial<SpaSiteOptions> = {}) {
  const app = fastify();
  await app.register(spaSite, {
    root,
    site: 'chemcalc',
    routes: ROUTES,
    siteUrl: 'https://www.chemcalc.org',
    ...options,
  });
  return app;
}

function titleOf(html: string): string | undefined {
  return /<title>(?<value>[^<]*)<\/title>/.exec(html)?.groups?.value;
}

test('a page the database names is indexed under its own name and text', async () => {
  let summary = 'A stimulant.';
  const page = (url: string): SpaPage | undefined =>
    url.startsWith('/compound/1')
      ? {
          meta: {
            path: '/compound/1',
            title: 'Caffeine — properties from Wikipedia',
            description: 'Caffeine (C8H10N4O2, 194.19 g/mol).',
          },
          content: { heading: 'Caffeine', paragraphs: [summary] },
        }
      : undefined;
  const app = await site({ page });

  const first = await app.inject({ url: '/compound/1?tab=infobox' });
  summary = 'A stimulant of the central nervous system.';
  const again = await app.inject({ url: '/compound/1' });
  const other = await app.inject({ url: '/about' });

  expect(first.statusCode).toBe(200);
  expect(titleOf(first.body)).toBe(
    'Caffeine — properties from Wikipedia — ChemCalc',
  );
  expect(first.body).toContain(
    '<link rel="canonical" href="https://www.chemcalc.org/compound/1" />',
  );
  expect(first.body).toContain('<p>A stimulant.</p>');
  expect(again.body).toContain(
    '<p>A stimulant of the central nervous system.</p>',
  );
  expect(titleOf(other.body)).toBe('About — ChemCalc');
});

test('an address the app does not route answers the status asked for', async () => {
  const app = await site({ notFoundStatus: 404 });
  const known = await app.inject({ url: '/about/' });
  const unknown = await app.inject({ url: '/nothing' });

  expect(known.statusCode).toBe(200);
  expect(unknown.statusCode).toBe(404);
  expect(titleOf(unknown.body)).toBe('Wikipedia chemistry — ChemCalc');
});

test('the site may say which addresses it routes', async () => {
  const app = await site({
    notFoundStatus: 404,
    knownRoute: (path) => /^\/exercise\/[a-z]+$/.test(path),
  });

  const exercise = await app.inject({ url: '/exercise/mass' });
  const about = await app.inject({ url: '/about' });

  expect(exercise.statusCode).toBe(200);
  expect(about.statusCode).toBe(404);
});

test('the structured data may be written by the site, or left out', async () => {
  const written = await site({
    structuredData: (origin) =>
      `<script type="application/ld+json">{"url":"${origin}/"}</script>`,
  });
  const none = await site({ structuredData: false });
  const ownBlock = await written.inject({ url: '/' });
  const noBlock = await none.inject({ url: '/' });

  expect(ownBlock.body).toContain(
    '<script type="application/ld+json">{"url":"https://www.chemcalc.org/"}</script>',
  );
  expect(noBlock.body).not.toContain('application/ld+json');
});

test('a site nobody is meant to find says so everywhere', async () => {
  const app = fastify();
  await app.register(spaSite, {
    root: bare,
    site: 'chemcalc',
    routes: ROUTES,
    indexed: false,
  });

  const page = await app.inject({ url: '/projects/3' });
  const robots = await app.inject({ url: '/robots.txt' });
  const sitemap = await app.inject({ url: '/sitemap.xml' });

  expect(page.statusCode).toBe(200);
  expect(page.headers['x-robots-tag']).toBe('noindex, nofollow');
  expect(page.body).toBe(
    '<html><head><title>translate</title></head><body></body></html>',
  );
  expect(robots.body).toBe('User-agent: *\nDisallow: /\n');
  expect(sitemap.statusCode).toBe(404);
});

test('an indexed site whose page has no head marker refuses to start', async () => {
  const app = fastify();

  await expect(
    app.register(spaSite, { root: bare, site: 'chemcalc', routes: ROUTES }),
  ).rejects.toThrow('the page carries no <!--cheminfo:head-->');
});

test('without a route table the site is its home page, named by its tagline', async () => {
  const app = fastify();
  await app.register(spaSite, { root, site: 'chemcalc' });

  const home = await app.inject({ url: '/' });

  expect(titleOf(home.body)).toBe(
    'Molecular formula, exact mass and isotopic distribution — ChemCalc',
  );
});
