import { afterEach, expect, test, vi } from 'vitest';

import {
  fetchSourceLooks,
  readSourceLooks,
  sourceLook,
} from '../moleculesSources.ts';

afterEach(() => {
  vi.unstubAllGlobals();
});

const ANSWER = {
  sources: [
    { name: 'ChEBI', color: '#18974c', logo: '/v1/sources/chebi/logo.svg' },
    { name: 'web', color: null, logo: null },
    { name: 'Odd', color: 'red', logo: 42 },
    { color: '#000000' },
    'not a source',
  ],
};

test('each source is read by its name in lower case, its logo made absolute', () => {
  const looks = readSourceLooks(ANSWER, 'https://molecules.cheminfo.org');

  expect([...looks.keys()]).toStrictEqual(['chebi', 'web', 'odd']);
  expect(looks.get('chebi')).toStrictEqual({
    name: 'ChEBI',
    color: '#18974c',
    logo: 'https://molecules.cheminfo.org/v1/sources/chebi/logo.svg',
  });
  // Anything not shaped like a colour or an address is dropped, not trusted.
  expect(looks.get('odd')).toStrictEqual({
    name: 'Odd',
    color: null,
    logo: null,
  });
});

test('an answer that holds no list of sources holds no look', () => {
  expect(readSourceLooks(null, 'https://x.org').size).toBe(0);
  expect(readSourceLooks({ sources: 'none' }, 'https://x.org').size).toBe(0);
});

test('a source is found in any case, and nothing is found before the read', () => {
  const looks = readSourceLooks(ANSWER, 'https://molecules.cheminfo.org');

  expect(sourceLook(looks, 'CHEBI')?.name).toBe('ChEBI');
  expect(sourceLook(looks, 'pubchem')).toBeUndefined();
  expect(sourceLook(null, 'chebi')).toBeUndefined();
});

test('the looks are read from the address given, and a refusal says so', async () => {
  const fetch = vi.fn(async (address: string) =>
    address === 'https://local.test/v1/sources'
      ? Response.json(ANSWER)
      : new Response('no', { status: 503 }),
  );
  vi.stubGlobal('fetch', fetch);

  const looks = await fetchSourceLooks({ url: 'https://local.test' });

  expect(looks.get('chebi')?.logo).toBe(
    'https://local.test/v1/sources/chebi/logo.svg',
  );
  await expect(fetchSourceLooks({ url: 'https://down.test' })).rejects.toThrow(
    'https://down.test answered 503 for its sources',
  );
});
