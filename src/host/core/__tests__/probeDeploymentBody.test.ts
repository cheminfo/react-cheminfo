/**
 * A server that answers its build record's address with something that is not
 * JSON — a proxy's error page served as a success — is up, with no build to
 * name.
 */

import { afterEach, expect, test, vi } from 'vitest';

import { probeDeployment } from '../probeDeployment.ts';

afterEach(() => {
  vi.unstubAllGlobals();
});

test('a record that is no JSON names no build, and nothing else is asked', async () => {
  const fetch = vi.fn(
    async () =>
      new Response('<!doctype html><title>Moved</title>', { status: 200 }),
  );
  vi.stubGlobal('fetch', fetch);

  await expect(
    probeDeployment('https://pdb.cheminfo.org/scripting?embed=1'),
  ).resolves.toStrictEqual({ reachable: true, build: undefined });
  expect(fetch).toHaveBeenCalledOnce();
});
