import { expect, test } from 'vitest';

import { ApiError } from '../apiError.ts';
import { fetchJson, readApiError } from '../fetchJson.ts';

interface Sent {
  url: string;
  method: string | undefined;
  accept: string | null;
  contentType: string | null;
  body: unknown;
}

function addressOf(input: RequestInfo | URL): string {
  if (typeof input === 'string') return input;
  return input instanceof URL ? input.href : input.url;
}

function stub(response: Response | Error, sent: Sent[] = []) {
  return (input: RequestInfo | URL, init?: RequestInit) => {
    const headers = new Headers(init?.headers);
    sent.push({
      url: addressOf(input),
      method: init?.method,
      accept: headers.get('Accept'),
      contentType: headers.get('Content-Type'),
      body: init?.body,
    });
    return response instanceof Error
      ? Promise.reject(response)
      : Promise.resolve(response);
  };
}

test('an answer is parsed, and a JSON body is sent with its type', async () => {
  const sent: Sent[] = [];
  const answer = await fetchJson<{ count: number }>('v1/search', {
    method: 'POST',
    json: { mf: 'C6H6' },
    fetch: stub(Response.json({ count: 3 }), sent),
  });

  expect(answer).toStrictEqual({ count: 3 });
  expect(sent).toStrictEqual([
    {
      url: 'v1/search',
      method: 'POST',
      accept: 'application/json',
      contentType: 'application/json',
      body: '{"mf":"C6H6"}',
    },
  ]);
});

test('a refusal carries the server words and its status', async () => {
  const refusal = Response.json(
    { statusCode: 404, error: 'Not Found', message: 'no compound Q42' },
    { status: 404, statusText: 'Not Found' },
  );
  const error = await fetchJson('v1/compounds/Q42', {
    fetch: stub(refusal),
  }).catch((error_: unknown) => error_);

  expect(error).toBeInstanceOf(ApiError);
  expect(error).toMatchObject({
    name: 'ApiError',
    message: 'no compound Q42',
    status: 404,
    statusCode: 404,
    error: 'Not Found',
    body: { statusCode: 404, error: 'Not Found', message: 'no compound Q42' },
  });
});

test('a refusal without an envelope says the status, or a FastAPI detail', async () => {
  const bare = await readApiError(
    new Response('<html>bad gateway</html>', { status: 502 }),
  );
  const detailed = await readApiError(
    Response.json({ detail: 'job still running' }, { status: 400 }),
  );

  expect([bare.message, bare.status, bare.error, bare.body]).toStrictEqual([
    'the server answered 502',
    502,
    '',
    '<html>bad gateway</html>',
  ]);
  expect([detailed.message, detailed.status]).toStrictEqual([
    'job still running',
    400,
  ]);
});

test('an unreachable server is status 0, and an abort passes through untouched', async () => {
  const unreachable = await fetchJson('v1/status', {
    fetch: stub(new TypeError('Failed to fetch')),
  }).catch((error: unknown) => error);

  expect(unreachable).toMatchObject({
    message: 'the server could not be reached',
    status: 0,
    error: 'Network Error',
  });

  const controller = new AbortController();
  controller.abort();
  const abort = new DOMException('The operation was aborted.', 'AbortError');
  const aborted = await fetchJson('v1/status', {
    signal: controller.signal,
    fetch: stub(abort),
  }).catch((error: unknown) => error);

  expect(aborted).toBe(abort);
});

test('an empty answer is undefined, and one that is not JSON is refused', async () => {
  const empty = await fetchJson('v1/session', {
    method: 'DELETE',
    fetch: stub(new Response(null, { status: 204 })),
  });
  const garbled = await fetchJson('v1/status', {
    fetch: stub(new Response('<!doctype html>', { status: 200 })),
  }).catch((error: unknown) => error);

  expect(empty).toBeUndefined();
  expect(garbled).toMatchObject({
    message: 'the server answered with something that is not JSON',
    status: 200,
    body: '<!doctype html>',
  });
});
