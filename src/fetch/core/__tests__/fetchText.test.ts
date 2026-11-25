import { expect, test } from 'vitest';

import { ApiError } from '../apiError.ts';
import { fetchText } from '../fetchText.ts';

function answer(body: string, status = 200) {
  return () => Promise.resolve(new Response(body, { status }));
}

async function failure(promise: Promise<string>): Promise<string> {
  try {
    await promise;
    return 'read';
  } catch (error) {
    if (error instanceof ApiError) return `api ${error.status}`;
    return error instanceof Error ? error.name : 'other';
  }
}

test('a file comes as its UTF-8 text, and a refusal, an unreachable server and an abort are told apart', async () => {
  const aborted = new AbortController();
  aborted.abort();

  expect([
    await fetchText('https://example.org/a.json', { fetch: answer('{"µ":1}') }),
    await failure(
      fetchText('https://example.org/b.json', { fetch: answer('', 404) }),
    ),
    await failure(
      fetchText('https://example.org/c.json', {
        fetch: () => Promise.reject(new TypeError('Failed to fetch')),
      }),
    ),
    await failure(
      fetchText('https://example.org/d.json', {
        signal: aborted.signal,
        fetch: () =>
          Promise.reject(
            new DOMException('The fetch was aborted', 'AbortError'),
          ),
      }),
    ),
  ]).toStrictEqual(['{"µ":1}', 'api 404', 'api 0', 'AbortError']);
});

test('only the network failure fetch reports is an unreachable server; anything else it throws is passed on', async () => {
  const defect = new RangeError('a defect of the page');

  await expect(
    fetchText('https://example.org/e.json', {
      fetch: () => Promise.reject(defect),
    }).catch((error: unknown) => error),
  ).resolves.toBe(defect);
});
