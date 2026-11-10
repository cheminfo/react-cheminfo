/**
 * A framed tool that never answered is told apart by its server: down, up with
 * a build record, or up with none this page can read.
 */

import { afterEach, expect, test, vi } from 'vitest';

import { probeDeployment } from '../probeDeployment.ts';

const URL_FRAMED = 'https://pdb.cheminfo.org/scripting?embed=1';
const RECORD = {
  version: '1.1.1',
  builtAt: '2026-11-09T21:37:02Z',
  commit: '53cfc02cdcdea00911c7f5a85e9d0651675ce99a',
};

afterEach(() => {
  vi.unstubAllGlobals();
});

function stubFetch(answer: (url: string, init?: RequestInit) => Response) {
  const fetch = vi.fn(async (input: URL | string, init?: RequestInit) =>
    answer(String(input), init),
  );
  vi.stubGlobal('fetch', fetch);
  return fetch;
}

test('a server publishing its record is up, with that build', async () => {
  const fetch = stubFetch(() => Response.json(RECORD));

  await expect(probeDeployment(URL_FRAMED)).resolves.toStrictEqual({
    reachable: true,
    build: RECORD,
  });
  expect(fetch).toHaveBeenCalledOnce();
  expect(fetch.mock.calls[0]?.[0].toString()).toBe(
    'https://pdb.cheminfo.org/build-info.json',
  );
});

test('a server answering anything else is up, with no build to name', async () => {
  stubFetch(() => new Response('<!doctype html>', { status: 404 }));

  await expect(probeDeployment(URL_FRAMED)).resolves.toStrictEqual({
    reachable: true,
    build: undefined,
  });
});

test('a record refused across origins falls back on an opaque request', async () => {
  const fetch = stubFetch((url, init) => {
    if (init?.mode !== 'no-cors') throw new TypeError('Failed to fetch');

    expect(url).toBe('https://pdb.cheminfo.org');

    return new Response(null, { status: 200 });
  });

  await expect(probeDeployment(URL_FRAMED)).resolves.toStrictEqual({
    reachable: true,
    build: undefined,
  });
  expect(fetch).toHaveBeenCalledTimes(2);
});

test('a server nothing answers at is unreachable', async () => {
  stubFetch(() => {
    throw new TypeError('Failed to fetch');
  });

  await expect(probeDeployment(URL_FRAMED)).resolves.toStrictEqual({
    reachable: false,
  });
});
