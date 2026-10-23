import { expect, test } from 'vitest';

import { createMoleculesClient } from '../moleculesClient.ts';
import type { MoleculesClientOptions } from '../moleculesClientApi.ts';
import { MoleculesError } from '../moleculesClientApi.ts';
import type { RetryDetails } from '../moleculesTypes.ts';

/** A request the fake server received. */
interface Received {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: unknown;
}

/**
 * A server answering each request with the next scripted answer, and keeping
 * what it was sent, its body read back from gzip.
 * @param answers - One per request, in order: a response, or an error thrown.
 * @returns The fetch, and what it received.
 */
function fakeServer(answers: Array<Response | Error>) {
  const received: Received[] = [];
  const fetch = async (
    input: string | URL | Request,
    init: RequestInit = {},
  ): Promise<Response> => {
    const payload = init.body as Uint8Array<ArrayBuffer> | undefined;
    const body =
      payload === undefined
        ? undefined
        : JSON.parse(
            await new Response(
              new Blob([payload])
                .stream()
                .pipeThrough(new DecompressionStream('gzip')),
            ).text(),
          );
    received.push({
      url: input instanceof Request ? input.url : input.toString(),
      method: init.method ?? 'GET',
      headers: init.headers as Record<string, string>,
      body,
    });
    const answer = answers.shift();
    if (answer === undefined) throw new Error('no answer scripted');
    if (answer instanceof Error) throw answer;
    return answer;
  };
  return { fetch, received };
}

function json(value: unknown, status = 200, headers = {}): Response {
  return Response.json(value, { status, headers });
}

// undici's shape: the addresses tried, under an aggregate with no message.
function refused(): AggregateError {
  const error = new AggregateError(
    [new Error('connect ECONNREFUSED')],
    'replaced below',
  );
  error.message = '';
  return error;
}

function client(
  fetch: typeof globalThis.fetch,
  options: Partial<MoleculesClientOptions> = {},
) {
  return createMoleculesClient({
    baseUrl: 'https://molecules.example/',
    token: 'secret',
    fetch,
    initialDelayMs: 1,
    random: () => 1,
    ...options,
  });
}

test('a batch is sent gzipped, with the token, and its answer returned', async () => {
  const summary = {
    total: 1,
    created: 1,
    added: 1,
    moved: 0,
    unchanged: 0,
    failed: 0,
  };
  const answer = { source: 'lotus', results: [{ id: 'L1' }], summary };
  const { fetch, received } = fakeServer([json(answer)]);

  const response = await client(fetch).submit([{ id: 'L1', smiles: 'CCO' }]);

  expect(response).toStrictEqual(answer);
  expect(received).toStrictEqual([
    {
      url: 'https://molecules.example/v1/submit',
      method: 'POST',
      headers: {
        authorization: 'Bearer secret',
        'content-type': 'application/json',
        'content-encoding': 'gzip',
      },
      body: { molecules: [{ id: 'L1', smiles: 'CCO' }], returnInfo: false },
    },
  ]);
});

test('every route names its method, its path and its defaults', async () => {
  const { fetch, received } = fakeServer([
    json({ source: 'lotus', importKey: 4, importStartedAt: 1 }),
    json({ source: 'lotus', importKey: 4 }),
    json({ results: [] }),
    json({ source: 'lotus', importKey: 4, dryRun: true }),
  ]);
  const molecules = client(fetch);

  await molecules.startImport();
  await molecules.importState();
  await molecules.lookup(['CCO'], 'smiles');
  await molecules.purge(4, { dryRun: true });

  expect(
    received.map(({ method, url, body }) => [method, url, body]),
  ).toStrictEqual([
    ['POST', 'https://molecules.example/v1/imports', undefined],
    ['GET', 'https://molecules.example/v1/imports', undefined],
    [
      'POST',
      'https://molecules.example/v1/batch',
      { queries: ['CCO'], kind: 'smiles' },
    ],
    [
      'POST',
      'https://molecules.example/v1/imports/4/purge',
      { dryRun: true, force: false },
    ],
  ]);
});

test('a busy server is asked again, as long as it asks to wait', async () => {
  const retries: RetryDetails[] = [];
  const { fetch, received } = fakeServer([
    json({ message: 'Writing, try again' }, 503, { 'retry-after': '0' }),
    new Error('fetch failed', { cause: refused() }),
    json({ source: 'lotus', importKey: 5, importStartedAt: 2 }),
  ]);

  const started = await client(fetch, {
    onRetry: (details) => retries.push(details),
  }).startImport();

  expect(started).toStrictEqual({
    source: 'lotus',
    importKey: 5,
    importStartedAt: 2,
  });
  expect(received).toHaveLength(3);
  expect(retries).toStrictEqual([
    {
      method: 'POST',
      path: '/v1/imports',
      attempt: 1,
      status: 503,
      reason: 'Writing, try again',
      delayMs: 0,
    },
    {
      method: 'POST',
      path: '/v1/imports',
      attempt: 2,
      status: undefined,
      reason: 'fetch failed: connect ECONNREFUSED',
      delayMs: 2,
    },
  ]);
});

test('a refusal is not asked again', async () => {
  const { fetch, received } = fakeServer([
    json({ message: 'The token was revoked' }, 401),
  ]);

  const failure = await client(fetch)
    .importState()
    .catch((error: unknown) => error);

  expect(failure).toBeInstanceOf(MoleculesError);
  expect((failure as MoleculesError).message).toBe(
    'GET /v1/imports answered 401: The token was revoked',
  );
  expect((failure as MoleculesError).status).toBe(401);
  expect((failure as MoleculesError).body).toBe(
    '{"message":"The token was revoked"}',
  );
  expect(received).toHaveLength(1);
});

test('a server that stays busy past the budget is given up', async () => {
  const { fetch, received } = fakeServer([
    json({ message: 'Busy' }, 503, { 'retry-after': '120' }),
  ]);

  const failure = await client(fetch, { maxRetryMs: 1000 })
    .importState()
    .catch((error: unknown) => error);

  expect(failure).toBeInstanceOf(MoleculesError);
  expect((failure as MoleculesError).message).toBe(
    'GET /v1/imports kept failing for 0 s: Busy',
  );
  expect((failure as MoleculesError).status).toBe(503);
  expect(received).toHaveLength(1);
});

test('an HTTP date in Retry-After is a pause, capped at the longest one', async () => {
  const retries: RetryDetails[] = [];
  const later = new Date(Date.now() + 3_600_000).toUTCString();
  const { fetch } = fakeServer([
    json({ message: 'Throttled' }, 429, { 'retry-after': later }),
    json({ source: 'lotus', importKey: 1 }),
  ]);

  await client(fetch, {
    maxDelayMs: 5,
    onRetry: (details) => retries.push(details),
  }).importState();

  expect(retries.map(({ status, delayMs }) => [status, delayMs])).toStrictEqual(
    [[429, 5]],
  );
});

test('a stopped client stops between two attempts', async () => {
  const controller = new AbortController();
  const { fetch } = fakeServer([json({ message: 'Busy' }, 503)]);

  const failure = await client(fetch, {
    signal: controller.signal,
    initialDelayMs: 60_000,
    onRetry: () => controller.abort(new Error('shutting down')),
  })
    .importState()
    .catch((error: unknown) => error);

  expect(failure).toStrictEqual(new Error('shutting down'));
});
