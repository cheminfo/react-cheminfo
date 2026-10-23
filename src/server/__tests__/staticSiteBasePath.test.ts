import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { fastify } from 'fastify';
import { afterAll, beforeAll, expect, test } from 'vitest';

import { staticSite } from '../staticSite.ts';

let root: string;

beforeAll(() => {
  root = mkdtempSync(join(tmpdir(), 'static-base-'));
  writeFileSync(join(root, 'index.html'), page('Home', '/'));
  writeFileSync(join(root, '404.html'), page('Not found', '/'));
  writeFileSync(join(root, 'plain.html'), '<p>no head</p>');
});

afterAll(() => {
  rmSync(root, { recursive: true, force: true });
});

async function site(basePath?: string) {
  const app = fastify();
  await app.register(staticSite, {
    root,
    basePath,
    redirects: {
      '/old': '/',
      '/elsewhere': 'https://equilibrium.cheminfo.org/titration',
    },
  });
  return app;
}

test('every page of a mounted deployment resolves under its mount', async () => {
  const app = await site('osiris/');
  const home = await app.inject({ url: '/' });
  const missing = await app.inject({ url: '/nothing' });
  const plain = await app.inject({ url: '/plain' });

  expect(home.body).toBe(page('Home', '/osiris/'));
  expect(missing.statusCode).toBe(404);
  expect(missing.body).toBe(page('Not found', '/osiris/'));
  expect(plain.body).toBe('<p>no head</p>');
});

test('a retired address is sent under the mount, an absolute one as written', async () => {
  const app = await site('/osiris');
  const old = await app.inject({ url: '/old?x=1' });
  const elsewhere = await app.inject({ url: '/elsewhere' });

  expect(old.headers.location).toBe('/osiris/?x=1');
  expect(elsewhere.headers.location).toBe(
    'https://equilibrium.cheminfo.org/titration',
  );
});

test('a site owning its host keeps the build as it is', async () => {
  const unmounted = await site();
  const slash = await site('/');

  const unmountedHome = await unmounted.inject({ url: '/' });
  const slashHome = await slash.inject({ url: '/' });
  const slashOld = await slash.inject({ url: '/old' });

  expect(unmountedHome.body).toBe(page('Home', '/'));
  expect(slashHome.body).toBe(page('Home', '/'));
  expect(slashOld.headers.location).toBe('/');
});

function page(title: string, base: string): string {
  return `<!doctype html><html lang="en"><head><base href="${base}" /><title>${title}</title></head><body></body></html>`;
}
