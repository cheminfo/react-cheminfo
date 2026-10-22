import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { fastify } from 'fastify';
import { afterAll, beforeAll, expect, test } from 'vitest';

import { resolveAddress } from '../siteFiles.ts';
import { staticSite } from '../staticSite.ts';

const SNIPPET =
  '<script defer src="https://datami.example/script.js"></script>';

let root: string;

beforeAll(() => {
  root = mkdtempSync(join(tmpdir(), 'static-site-'));
  const pages: Record<string, string> = {
    'index.html': page('Home'),
    'titration.html': page('Titration'),
    '404.html': page('Not found'),
    'fr/index.html': page('Accueil'),
  };
  mkdirSync(join(root, 'fr'));
  mkdirSync(join(root, 'assets'));
  mkdirSync(join(root, 'demo'));
  for (const [file, html] of Object.entries(pages)) {
    writeFileSync(join(root, file), html);
  }
  writeFileSync(join(root, 'assets', 'index-a1b2.js'), 'export {};');
  writeFileSync(join(root, 'demo', 'hcl-by-naoh.csv'), 'volume,pH\n0,1\n');
});

afterAll(() => {
  rmSync(root, { recursive: true, force: true });
});

async function site(options: { trackingScript?: string } = {}) {
  const app = fastify();
  app.get('/v1/tools', () => ({ tools: [] }));
  await app.register(staticSite, {
    root,
    redirects: { '/precipitation': '/equilibrium' },
    ...options,
  });
  return app;
}

test('an address is its page, without a redirect, revalidated on every visit', async () => {
  const app = await site();
  const response = await app.inject({ url: '/titration?a=OH-' });

  expect(response.statusCode).toBe(200);
  expect(response.headers['content-type']).toBe('text/html; charset=utf-8');
  expect(response.headers['cache-control']).toBe('no-cache');
  expect(response.body).toBe(page('Titration'));
});

test('the root and a directory are their index', async () => {
  const app = await site();

  const home = await app.inject({ url: '/' });
  const french = await app.inject({ url: '/fr/' });
  const frenchBare = await app.inject({ url: '/fr' });

  expect(home.body).toBe(page('Home'));
  expect(french.body).toBe(page('Accueil'));
  expect(frenchBare.body).toBe(page('Accueil'));
});

test('a page the browser holds is answered with a 304', async () => {
  const app = await site();
  const first = await app.inject({ url: '/titration' });
  const again = await app.inject({
    url: '/titration',
    headers: { 'if-none-match': first.headers.etag },
  });

  expect(first.headers.etag).toMatch(/^"[\da-f]{24}"$/);
  expect(again.statusCode).toBe(304);
  expect(again.body).toBe('');
});

test('a hashed bundle is kept for a year, any other file is revalidated', async () => {
  const app = await site();
  const bundle = await app.inject({ url: '/assets/index-a1b2.js' });
  const data = await app.inject({ url: '/demo/hcl-by-naoh.csv' });

  expect(bundle.statusCode).toBe(200);
  expect(bundle.headers['cache-control']).toBe(
    'public, max-age=31536000, immutable',
  );
  expect(bundle.headers['access-control-allow-origin']).toBe('*');
  expect(bundle.body).toBe('export {};');
  expect(data.headers['cache-control']).toBe('no-cache');
  expect(data.body).toBe('volume,pH\n0,1\n');
});

test('an unknown address is the 404 page, never the home page', async () => {
  const app = await site();
  const response = await app.inject({ url: '/nothing-here' });

  expect(response.statusCode).toBe(404);
  expect(response.body).toBe(page('Not found'));
});

test('a path climbing out of the build names nothing', async () => {
  const app = await site();
  const response = await app.inject({ url: '/..%2f..%2fetc%2fpasswd' });

  expect(response.statusCode).toBe(404);
  expect(response.body).toBe(page('Not found'));
});

test('a retired address moves to its page, with its query', async () => {
  const app = await site();
  const response = await app.inject({ url: '/precipitation/?s=Ag%2B:0.1' });

  expect(response.statusCode).toBe(301);
  expect(response.headers.location).toBe('/equilibrium?s=Ag%2B:0.1');
});

test('the API keeps its own routes and its own 404', async () => {
  const app = await site();

  const tools = await app.inject({ url: '/v1/tools' });

  expect(tools.json()).toStrictEqual({ tools: [] });

  const unknown = await app.inject({ url: '/v1/nothing' });

  expect(unknown.statusCode).toBe(404);
  expect(unknown.json()).toStrictEqual({
    message: 'Route GET:/v1/nothing not found',
    error: 'Not Found',
    statusCode: 404,
  });
});

test('every page carries the analytics snippet, once', async () => {
  const app = await site({ trackingScript: SNIPPET });
  const home = await app.inject({ url: '/' });
  const missing = await app.inject({ url: '/nothing-here' });

  expect(home.body).toBe(page('Home', SNIPPET));
  expect(missing.body).toBe(page('Not found', SNIPPET));
});

test('the deploy script finds /health', async () => {
  const app = await site();
  const response = await app.inject({ url: '/health' });

  expect(response.statusCode).toBe(200);
  expect(response.json()).toStrictEqual({ status: 'ok' });
});

test('without a build the API is served alone', async () => {
  const app = fastify();
  app.get('/v1/tools', () => ({ tools: [] }));
  await app.register(staticSite, { root: join(root, 'missing') });

  const tools = await app.inject({ url: '/v1/tools' });
  const health = await app.inject({ url: '/health' });
  const home = await app.inject({ url: '/' });

  expect(tools.statusCode).toBe(200);
  expect(health.statusCode).toBe(200);
  expect(home.statusCode).toBe(404);
});

test('an address resolves as the static hosts resolve it', () => {
  const files = new Set(['index.html', 'ph.html', 'fr/index.html', 'og.png']);

  expect(resolveAddress(files, '/')).toBe('index.html');
  expect(resolveAddress(files, '/ph')).toBe('ph.html');
  expect(resolveAddress(files, '/ph.html')).toBe('ph.html');
  expect(resolveAddress(files, '/fr')).toBe('fr/index.html');
  expect(resolveAddress(files, '/og.png')).toBe('og.png');
  expect(resolveAddress(files, '/ph/')).toBeUndefined();
  expect(resolveAddress(files, '/%E0%A4%A')).toBeUndefined();
});

function page(title: string, snippet = ''): string {
  const head = snippet === '' ? '' : `${snippet}\n`;
  return `<!doctype html><html lang="en"><head><title>${title}</title>${head}</head><body></body></html>`;
}
