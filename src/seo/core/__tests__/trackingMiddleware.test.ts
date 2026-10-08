import { expect, test } from 'vitest';

import { trackingScriptMiddleware } from '../trackingMiddleware.ts';

const PAGE = '<html><head><title>t</title></head><body></body></html>';
const SNIPPET =
  '<script defer src="https://stats.example.org/s.js" data-website-id="a&b"></script>';

function serve(
  response: Response,
  snippet?: string,
  method = 'GET',
): Promise<Response> {
  return trackingScriptMiddleware({
    request: new Request('https://site.example.org/about', { method }),
    env: { TRACKING_SCRIPT: snippet },
    next: () => Promise.resolve(response),
  });
}

function html(body: string, status = 200): Response {
  return new Response(body, {
    status,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'content-length': String(body.length),
      etag: '"abc"',
    },
  });
}

test('a page is served with the snippet at the end of its head', async () => {
  const response = await serve(html(PAGE), SNIPPET);

  expect(response.status).toBe(200);
  await expect(response.text()).resolves.toBe(
    `<html><head><title>t</title>${SNIPPET}\n</head><body></body></html>`,
  );
  expect(response.headers.get('content-type')).toBe('text/html; charset=utf-8');
  expect(response.headers.get('etag')).toBe('"abc"');
  expect(response.headers.has('content-length')).toBe(false);
});

test('the 404 page is counted too, and stays a 404', async () => {
  const response = await serve(html(PAGE, 404), SNIPPET);

  expect(response.status).toBe(404);
  await expect(response.text()).resolves.toContain(SNIPPET);
});

test('with no snippet, the build is served exactly as it is', async () => {
  const page = html(PAGE);

  await expect(serve(page)).resolves.toBe(page);
  await expect(serve(page, '  ')).resolves.toBe(page);
});

test('anything that is not a page passes through untouched', async () => {
  const script = new Response('export {}', {
    headers: { 'content-type': 'text/javascript' },
  });
  const unchanged = new Response(null, {
    status: 304,
    headers: { 'content-type': 'text/html' },
  });
  const head = html(PAGE);

  await expect(serve(script, SNIPPET)).resolves.toBe(script);
  await expect(serve(unchanged, SNIPPET)).resolves.toBe(unchanged);
  await expect(serve(head, SNIPPET, 'HEAD')).resolves.toBe(head);
});
