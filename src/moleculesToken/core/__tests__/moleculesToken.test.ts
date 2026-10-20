import { expect, test } from 'vitest';

import type { MoleculesTokenCheck } from '../moleculesToken.ts';
import {
  checkMoleculesToken,
  checkMoleculesTokens,
  publicTokenCheck,
} from '../moleculesToken.ts';

const NOW = 1_792_500_000_000;

/** What molecules.cheminfo.org answers for a token issued for NP Atlas. */
const NP_ATLAS = {
  id: 7,
  source: 'NP Atlas',
  isPublic: true,
  email: 'chembio@cheminfo.org',
  hint: 'mct_1a2b3c4d',
  createdAt: 1_790_000_000,
  lastUsedAt: 1_792_400_000,
  revokedAt: null,
};

/**
 * A fetch answering every request the same way, and remembering them.
 * @param answer - What it answers.
 * @returns The fetch, and the requests it saw.
 */
function fakeFetch(answer: () => Promise<Response>) {
  const requests: Array<{ url: string; headers: Record<string, string> }> = [];
  const fetch: typeof globalThis.fetch = async (input, init) => {
    requests.push({
      url: input instanceof Request ? input.url : input.toString(),
      headers: init?.headers as Record<string, string>,
    });
    return answer();
  };
  return { fetch, requests };
}

const json = (status: number, body: unknown) => async () =>
  Response.json(body, { status });

const options = (fetch: typeof globalThis.fetch) => ({
  baseUrl: 'https://molecules.cheminfo.org/',
  fetch,
  now: () => NOW,
});

test('a token issued for its source is ok, and molecules says who holds it', async () => {
  const { fetch, requests } = fakeFetch(json(200, NP_ATLAS));

  const check = await checkMoleculesToken(
    {
      variable: 'MOLECULES_TOKEN_NPATLAS',
      token: ' mct_1a2b3c4d5e6f ',
      sources: ['np atlas'],
    },
    options(fetch),
  );

  expect(requests).toStrictEqual([
    {
      url: 'https://molecules.cheminfo.org/v1/token',
      headers: {
        accept: 'application/json',
        authorization: 'Bearer mct_1a2b3c4d5e6f',
      },
    },
  ]);
  expect(check).toStrictEqual<MoleculesTokenCheck>({
    variable: 'MOLECULES_TOKEN_NPATLAS',
    sources: ['np atlas'],
    verdict: 'ok',
    message: null,
    source: 'NP Atlas',
    hint: 'mct_1a2b3c4d',
    email: 'chembio@cheminfo.org',
    issuedAt: 1_790_000_000_000,
    lastUsedAt: 1_792_400_000_000,
    checkedAt: NOW,
  });
});

test('a token issued for another source says whose it is', async () => {
  const { fetch } = fakeFetch(json(200, { ...NP_ATLAS, lastUsedAt: null }));

  const check = await checkMoleculesToken(
    { variable: 'MOLECULES_TOKEN_LOTUS', token: 'x', sources: ['LOTUS'] },
    options(fetch),
  );

  expect([check.verdict, check.source, check.lastUsedAt]).toStrictEqual([
    'otherSource',
    'NP Atlas',
    null,
  ]);
});

test('a token for any source is ok whatever its source', async () => {
  const { fetch } = fakeFetch(json(200, NP_ATLAS));

  const check = await checkMoleculesToken(
    { variable: 'MOLECULES_TOKEN', token: 'x' },
    options(fetch),
  );

  expect([check.verdict, check.sources]).toStrictEqual(['ok', []]);
});

test('a revoked or unknown token is refused, with what molecules said', async () => {
  const { fetch } = fakeFetch(
    json(401, {
      statusCode: 401,
      error: 'Unauthorized',
      message: 'this token was revoked',
    }),
  );

  const check = await checkMoleculesToken(
    { variable: 'MOLECULES_TOKEN_LOTUS', token: 'x', sources: ['LOTUS'] },
    options(fetch),
  );

  expect([check.verdict, check.message, check.source]).toStrictEqual([
    'refused',
    'this token was revoked',
    null,
  ]);
});

test('a token answered as revoked is refused too', async () => {
  const { fetch } = fakeFetch(
    json(200, { ...NP_ATLAS, revokedAt: 1_792_000_000 }),
  );

  const check = await checkMoleculesToken(
    { variable: 'MOLECULES_TOKEN_NPATLAS', token: 'x', sources: ['NP Atlas'] },
    options(fetch),
  );

  expect([check.verdict, check.message]).toStrictEqual([
    'refused',
    'this token was revoked',
  ]);
});

test('an unset or blank token is not sent at all', async () => {
  const { fetch, requests } = fakeFetch(json(200, NP_ATLAS));

  const checks = await checkMoleculesTokens(
    [
      { variable: 'MOLECULES_TOKEN_LOTUS', token: undefined },
      { variable: 'MOLECULES_TOKEN_NPASS', token: '  ' },
    ],
    options(fetch),
  );

  expect(requests).toHaveLength(0);
  expect(checks.map((check) => check.verdict)).toStrictEqual([
    'unset',
    'unset',
  ]);
});

test('a molecules.cheminfo.org without GET /v1/token cannot check it', async () => {
  const { fetch } = fakeFetch(json(404, { message: 'Route not found' }));

  const check = await checkMoleculesToken(
    { variable: 'MOLECULES_TOKEN', token: 'x' },
    options(fetch),
  );

  expect([check.verdict, check.message]).toStrictEqual([
    'uncheckable',
    'GET /v1/token answered 404',
  ]);
});

test('a failure, a silence or a stranger answer is no answer', async () => {
  const failing = fakeFetch(json(503, { message: 'busy' }));
  const silent = fakeFetch(async () => {
    throw new DOMException('The operation timed out.', 'TimeoutError');
  });
  const offline = fakeFetch(async () => {
    throw new TypeError('fetch failed');
  });
  const stranger = fakeFetch(json(200, { source: 'NP Atlas' }));
  const entry = { variable: 'MOLECULES_TOKEN', token: 'x' };

  const checks = await Promise.all(
    [failing, silent, offline, stranger].map(({ fetch }) =>
      checkMoleculesToken(entry, { ...options(fetch), timeoutMs: 2000 }),
    ),
  );

  expect(checks.map((check) => [check.verdict, check.message])).toStrictEqual([
    ['unanswered', 'GET /v1/token answered 503'],
    ['unanswered', 'no answer within 2000 ms'],
    ['unanswered', 'fetch failed'],
    ['unanswered', 'GET /v1/token answered no token'],
  ]);
});

test('every token is checked, in the order given', async () => {
  const { fetch, requests } = fakeFetch(json(200, NP_ATLAS));

  const checks = await checkMoleculesTokens(
    [
      {
        variable: 'MOLECULES_TOKEN_NPATLAS',
        token: 'a',
        sources: ['NP Atlas'],
      },
      { variable: 'MOLECULES_TOKEN_LOTUS', token: 'b', sources: ['LOTUS'] },
    ],
    options(fetch),
  );

  expect(
    requests.map((request) => request.headers.authorization),
  ).toStrictEqual(['Bearer a', 'Bearer b']);
  expect(checks.map((check) => check.verdict)).toStrictEqual([
    'ok',
    'otherSource',
  ]);
});

test('a public page shows neither who holds a token nor its first characters', async () => {
  const { fetch } = fakeFetch(json(200, NP_ATLAS));
  const check = await checkMoleculesToken(
    { variable: 'MOLECULES_TOKEN', token: 'x' },
    options(fetch),
  );

  expect(publicTokenCheck(check)).toStrictEqual({
    ...check,
    email: null,
    hint: null,
  });
});
