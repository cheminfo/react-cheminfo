import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { fastify } from 'fastify';
import { afterAll, beforeAll, expect, test } from 'vitest';

import { serializeRouteTable } from '../../seo/core/routeTable.ts';
import type { RouteMeta } from '../../seo/core/routes.ts';
import { spaSite } from '../spaSite.ts';
import type { SpaSiteOptions } from '../spaSiteOptions.ts';

const TEMPLATE =
  '<!doctype html><html lang="en"><head><base href="/" /><!--cheminfo:head--></head><body><div id="root"></div><!--cheminfo:body--></body></html>';

const SNIPPET = '<script defer src="https://datami.example/s.js"></script>';

const ROUTES: RouteMeta[] = [
  {
    path: '/',
    title: 'Dereplicate a mixture from its carbon spectrum',
    description: 'Match the carbon shifts of a mixture against LOTUS.',
  },
  {
    path: '/taxonomy',
    title: 'Natural products by organism',
    description: 'Walk the NCBI taxonomy down to the species.',
  },
  {
    path: '/status',
    title: 'Status of the imports',
    description: 'When each source was last imported.',
    indexed: false,
  },
  {
    path: '/molecules',
    title: 'A natural product',
    description: 'One natural product, its organisms and its shifts.',
    prefix: true,
  },
];

let root: string;

beforeAll(() => {
  root = mkdtempSync(join(tmpdir(), 'spa-site-'));
  mkdirSync(join(root, 'assets'));
  writeFileSync(join(root, 'index.html'), TEMPLATE);
  writeFileSync(join(root, 'routes.json'), serializeRouteTable(ROUTES));
  writeFileSync(join(root, 'assets', 'index-a1b2.js'), 'export {};');
  writeFileSync(join(root, 'favicon.svg'), '<svg></svg>');
});

afterAll(() => {
  rmSync(root, { recursive: true, force: true });
});

async function site(options: Partial<SpaSiteOptions> = {}) {
  const app = fastify();
  app.get('/v1/tools', () => ({ tools: [] }));
  await app.register(spaSite, {
    root,
    site: 'derepflow',
    siteUrl: 'https://derepflow.cheminfo.org',
    ...options,
  });
  return app;
}

function head(html: string) {
  return {
    title: /<title>(?<value>[^<]*)<\/title>/.exec(html)?.groups?.value,
    canonical: /<link rel="canonical" href="(?<value>[^"]*)"/.exec(html)?.groups
      ?.value,
    heading: /<h1>(?<value>[^<]*)<\/h1>/.exec(html)?.groups?.value,
    robots: /<meta name="robots" content="(?<value>[^"]*)"/.exec(html)?.groups
      ?.value,
  };
}

test('every routed address is the page, under its own head', async () => {
  const app = await site();
  const home = await app.inject({ url: '/' });
  const taxonomy = await app.inject({ url: '/taxonomy?rank=genus' });
  const molecule = await app.inject({ url: '/molecules/12' });
  const status = await app.inject({ url: '/status' });

  expect(home.statusCode).toBe(200);
  expect(home.headers['content-type']).toBe('text/html; charset=utf-8');
  expect(home.headers['cache-control']).toBe('no-cache');
  expect(head(home.body)).toStrictEqual({
    title: 'Dereplicate a mixture from its carbon spectrum — DerepFlow',
    canonical: 'https://derepflow.cheminfo.org/',
    heading: 'Dereplicate a mixture from its carbon spectrum',
    robots: undefined,
  });
  expect(head(taxonomy.body)).toStrictEqual({
    title: 'Natural products by organism — DerepFlow',
    canonical: 'https://derepflow.cheminfo.org/taxonomy',
    heading: 'Natural products by organism',
    robots: undefined,
  });
  expect(head(molecule.body)).toStrictEqual({
    title: 'A natural product — DerepFlow',
    canonical: 'https://derepflow.cheminfo.org/molecules',
    heading: 'A natural product',
    robots: undefined,
  });
  expect(head(status.body)).toStrictEqual({
    title: 'Status of the imports — DerepFlow',
    canonical: 'https://derepflow.cheminfo.org/status',
    heading: 'Status of the imports',
    robots: 'noindex, nofollow',
  });
});

test('the crawl path links the indexed pages, and the head the structured data', async () => {
  const app = await site();
  const { body } = await app.inject({ url: '/taxonomy' });

  expect(body).toContain(
    '<li><a href="/">Dereplicate a mixture from its carbon spectrum</a></li>',
  );
  expect(body).toContain('<li><a href="/molecules">A natural product</a></li>');
  expect(body).not.toContain('<a href="/status">');
  expect(body).toContain('"@type": "WebApplication"');
  expect(body).toContain('"url": "https://derepflow.cheminfo.org/"');
});

test('an unknown address and /index.html are the home page', async () => {
  const app = await site();
  const unknown = await app.inject({ url: '/nothing/here' });
  const index = await app.inject({ url: '/index.html' });

  expect(unknown.statusCode).toBe(200);
  expect(head(unknown.body).title).toBe(
    'Dereplicate a mixture from its carbon spectrum — DerepFlow',
  );
  expect(index.statusCode).toBe(200);
  expect(head(index.body).canonical).toBe('https://derepflow.cheminfo.org/');
});

test('the files of the build are served, bundles kept for a year', async () => {
  const app = await site();
  const bundle = await app.inject({ url: '/assets/index-a1b2.js' });
  const icon = await app.inject({ url: '/favicon.svg' });

  expect(bundle.statusCode).toBe(200);
  expect(bundle.body).toBe('export {};');
  expect(bundle.headers['cache-control']).toBe(
    'public, max-age=31536000, immutable',
  );
  expect(icon.body).toBe('<svg></svg>');
  expect(icon.headers['cache-control']).toBe('no-cache');
});

test('the API keeps its routes and its own 404, and only GET is a page', async () => {
  const app = await site();
  const tools = await app.inject({ url: '/v1/tools' });
  const unknown = await app.inject({ url: '/v1/nothing' });
  const docs = await app.inject({ url: '/docs/json' });
  const posted = await app.inject({ method: 'POST', url: '/taxonomy' });

  expect(tools.json()).toStrictEqual({ tools: [] });
  expect(unknown.json()).toStrictEqual({
    message: 'Route GET:/v1/nothing not found',
    error: 'Not Found',
    statusCode: 404,
  });
  expect(docs.statusCode).toBe(404);
  expect(posted.statusCode).toBe(404);
});

test('the snippet is in every page, once', async () => {
  const app = await site({ trackingScript: SNIPPET });
  const pages = [
    await app.inject({ url: '/' }),
    await app.inject({ url: '/taxonomy' }),
    await app.inject({ url: '/nothing' }),
  ];

  expect(pages.map(({ body }) => body.split(SNIPPET).length - 1)).toStrictEqual(
    [1, 1, 1],
  );
});

test('without a configured address the request origin is used, if it is one', async () => {
  const app = fastify({ trustProxy: '127.0.0.1' });
  await app.register(spaSite, { root, site: 'derepflow', siteUrl: ' ' });
  const named = await app.inject({
    url: '/taxonomy',
    headers: { host: 'derepflow.example:8080', 'x-forwarded-proto': 'https' },
  });
  const forged = await app.inject({
    url: '/taxonomy',
    headers: { host: 'evil"><script>' },
  });

  expect(head(named.body).canonical).toBe(
    'https://derepflow.example:8080/taxonomy',
  );
  expect(head(forged.body).canonical).toBe(
    'https://derepflow.cheminfo.org/taxonomy',
  );
});

test('a mounted address writes every canonical under its mount', async () => {
  const app = await site({ siteUrl: 'https://www.cheminfo.org/derepflow/' });
  const taxonomy = await app.inject({ url: '/taxonomy' });
  const robots = await app.inject({ url: '/robots.txt' });

  expect(head(taxonomy.body).canonical).toBe(
    'https://www.cheminfo.org/derepflow/taxonomy',
  );
  expect(robots.body).toBe(
    'User-agent: *\nAllow: /derepflow/\nDisallow: /derepflow/v1/\nDisallow: /derepflow/docs\n\nSitemap: https://www.cheminfo.org/derepflow/sitemap.xml\n',
  );
});

test('the sitemap lists the indexed routes and the addresses the site adds', async () => {
  const app = await site({ sitemapPaths: () => ['/molecules/12'] });
  const sitemap = await app.inject({ url: '/sitemap.xml' });
  const robots = await app.inject({ url: '/robots.txt' });

  expect(sitemap.headers['content-type']).toBe(
    'application/xml; charset=utf-8',
  );
  expect(sitemap.body).toBe(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://derepflow.cheminfo.org/</loc></url>
  <url><loc>https://derepflow.cheminfo.org/taxonomy</loc></url>
  <url><loc>https://derepflow.cheminfo.org/molecules</loc></url>
  <url><loc>https://derepflow.cheminfo.org/molecules/12</loc></url>
</urlset>
`);
  expect(robots.body).toBe(
    'User-agent: *\nAllow: /\nDisallow: /v1/\nDisallow: /docs\n\nSitemap: https://derepflow.cheminfo.org/sitemap.xml\n',
  );
});

test('/health answers the deploy script', async () => {
  const app = await site();
  const response = await app.inject({ url: '/health' });

  expect(response.json()).toStrictEqual({ status: 'ok' });
});

test('without a build the API is served alone', async () => {
  const app = fastify();
  app.get('/v1/tools', () => ({ tools: [] }));
  await app.register(spaSite, { root: join(root, 'missing'), site: 'tex' });

  const tools = await app.inject({ url: '/v1/tools' });
  const health = await app.inject({ url: '/health' });
  const home = await app.inject({ url: '/' });

  expect(tools.statusCode).toBe(200);
  expect(health.statusCode).toBe(200);
  expect(home.statusCode).toBe(404);
});
