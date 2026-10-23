import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, expect, test } from 'vitest';

import type { ServerConfig } from '../config.ts';
import { readServerConfig } from '../config.ts';
import type { ToolSiteContext } from '../toolSiteServer.ts';
import { toolSiteServer } from '../toolSiteServer.ts';

let root: string;

beforeAll(() => {
  root = mkdtempSync(join(tmpdir(), 'tool-site-'));
  mkdirSync(join(root, 'assets'));
  writeFileSync(join(root, 'index.html'), page('Home'));
  writeFileSync(join(root, 'titration.html'), page('Titration'));
  writeFileSync(join(root, '404.html'), page('Not found'));
  writeFileSync(join(root, 'assets', 'index-a1b2.js'), 'export {};');
});

afterAll(() => {
  rmSync(root, { recursive: true, force: true });
});

function config(env: Record<string, string> = {}): ServerConfig {
  return readServerConfig(env, { siteId: 'equilibrium', port: 10_602, root });
}

async function server(
  env: Record<string, string> = {},
  redirects: Record<string, string> = {},
): Promise<{ app: FastifyInstance; contexts: ToolSiteContext[] }> {
  const contexts: ToolSiteContext[] = [];
  const app = await toolSiteServer({
    siteId: 'equilibrium',
    config: config(env),
    logger: false,
    version: '2.3.4',
    redirects,
    registerApi: (api, context) => {
      contexts.push(context);
      api.get('/v1/tools', () => ({ tools: [] }));
      api.get('/docs', () => 'documentation');
    },
  });
  return { app, contexts };
}

test('the API is registered with the site, its release and its configuration', async () => {
  const { app, contexts } = await server();

  expect(contexts).toStrictEqual([
    {
      siteId: 'equilibrium',
      name: 'equilibrium.cheminfo.org',
      version: '2.3.4',
      config: config(),
    },
  ]);

  const tools = await app.inject({ url: '/v1/tools' });
  const docs = await app.inject({ url: '/docs' });

  expect(tools.json()).toStrictEqual({ tools: [] });
  expect(docs.body).toBe('documentation');
});

test('the pages are served beside the API, by the static hosts rules', async () => {
  const { app } = await server();

  const titration = await app.inject({ url: '/titration' });
  const missing = await app.inject({ url: '/nothing' });
  const unknownApi = await app.inject({ url: '/v1/nothing' });
  const docsPage = await app.inject({ url: '/docs/nothing' });
  const health = await app.inject({ url: '/health' });

  expect(titration.statusCode).toBe(200);
  expect(titration.body).toBe(page('Titration'));
  expect(missing.statusCode).toBe(404);
  expect(missing.body).toBe(page('Not found'));
  expect(unknownApi.json()).toStrictEqual({
    message: 'Route GET:/v1/nothing not found',
    error: 'Not Found',
    statusCode: 404,
  });
  expect(docsPage.json()).toStrictEqual({
    message: 'Route GET:/docs/nothing not found',
    error: 'Not Found',
    statusCode: 404,
  });
  expect(health.json()).toStrictEqual({ status: 'ok' });
});

test('the snippet and the trusted proxy come from the configuration', async () => {
  const snippet = '<script src="https://datami.example/s.js"></script>';
  const { app } = await server({
    TRACKING_SCRIPT: snippet,
    TRUST_PROXY: '192.168.1.5',
  });
  app.get('/v1/ip', (request) => ({ ip: request.ip }));

  const home = await app.inject({ url: '/' });
  const trusted = await app.inject({
    url: '/v1/ip',
    remoteAddress: '192.168.1.5',
    headers: { 'x-forwarded-for': '203.0.113.7' },
  });
  const untrusted = await app.inject({
    url: '/v1/ip',
    remoteAddress: '198.51.100.9',
    headers: { 'x-forwarded-for': '203.0.113.7' },
  });

  expect(home.body).toBe(page('Home', snippet));
  expect(trusted.json()).toStrictEqual({ ip: '203.0.113.7' });
  expect(untrusted.json()).toStrictEqual({ ip: '198.51.100.9' });
});

test('a mounted deployment stamps its base and redirects under it', async () => {
  const { app } = await server(
    { BASE_PATH: '/equilibrium/' },
    { '/precipitation': '/titration' },
  );

  const home = await app.inject({ url: '/' });
  const retired = await app.inject({ url: '/precipitation?s=Ag%2B' });

  expect(home.body).toBe(page('Home', '', '/equilibrium/'));
  expect(retired.statusCode).toBe(301);
  expect(retired.headers.location).toBe('/equilibrium/titration?s=Ag%2B');
});

function page(title: string, snippet = '', base = '/'): string {
  const head = snippet === '' ? '' : `${snippet}\n`;
  return `<!doctype html><html lang="en"><head><base href="${base}" /><title>${title}</title>${head}</head><body></body></html>`;
}
