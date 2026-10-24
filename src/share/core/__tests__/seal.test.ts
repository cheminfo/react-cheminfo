import { expect, test } from 'vitest';

import { sealQuery, sealShareUrl, sealedToken, unsealQuery } from '../seal.ts';

// An 8-byte tag and a header byte around the body.
const OVERHEAD = 9;

function base64UrlLength(bytes: number): number {
  return Math.ceil((bytes * 4) / 3);
}

test('a sealed query opens to exactly what was sealed', async () => {
  const query = 'formulas=C4H10O,C5H12&hide=answers,hints&embed=1';

  const token = await sealQuery(query);

  expect(token).toMatch(/^e1\.[\w-]+$/);
  expect(token).not.toContain('C4H10O');
  await expect(unsealQuery(token)).resolves.toStrictEqual({ ok: true, query });
});

test('a short query is not compressed, since deflate would lengthen it', async () => {
  const query = 'embed=1&hide=list,answers&formulas=C4H10O';

  const token = await sealQuery(query);

  expect(token).toHaveLength(3 + base64UrlLength(OVERHEAD + query.length));
});

test('a long query is compressed below its own length', async () => {
  const formulas: string[] = [];
  for (let carbons = 1; carbons <= 40; carbons++) {
    formulas.push(`C${carbons}H${2 * carbons + 2}`);
  }
  const query = `embed=1&hide=answers&formulas=${formulas.join(',')}`;

  const token = await sealQuery(query);

  expect(query).toHaveLength(297);
  expect(token.length).toBeLessThan(query.length);
  await expect(unsealQuery(token)).resolves.toStrictEqual({ ok: true, query });
});

test('one query always seals to the same token, and another to another', async () => {
  const first = await sealQuery('mf=C6H12O6&embed=1');
  const again = await sealQuery('mf=C6H12O6&embed=1');
  const other = await sealQuery('mf=C6H12O5&embed=1');

  expect(again).toBe(first);
  expect(other).not.toBe(first);
});

// Minted on 2026-10-14. Links like it are handed out and must open for ever,
// so this token is never regenerated: a change that breaks it breaks them all.
test('a token minted by e1 still opens, at the length it had', async () => {
  const token =
    'e1.x9dasYuwqR9SZzwWP3Fm_HpZQ4UK6ecpSEvsqW0nZYP7wGAS302KozCPIZ3OS5TanBpLVvjbBKN_c0tT71Z-ubFKSTWCgHp4KEREzaCybGw625bFp0LuMXFlqwFvY5J-3WJpmXlh8J1YieLlocZfSPOiWDrMTLoXsUq6mNwG';
  const query =
    'exercise=C4H10O&formulas=C3H8,CH5N,C3H6,C2H7N,C5H12,C3H4,C3H8O,C3H9N,C6H14,C4H8,C4H10O,C4H11N,C7H16,C3H6O,C4H8Cl2,C5H10,C3H8O2,C3H7N,C5H12O,C8H18,C6H12,C4H8O,C5H8&embed=1';

  expect(token).toHaveLength(171);
  await expect(unsealQuery(token)).resolves.toStrictEqual({ ok: true, query });
});

test('a plus, an escape and an accent come back as written', async () => {
  const query = 'smiles=CC[N+](C)(C)C&ion=H%2B&note=éthanol';

  const token = await sealQuery(query);

  await expect(unsealQuery(token)).resolves.toStrictEqual({ ok: true, query });
});

test('a token with one character changed is refused as tampered', async () => {
  const token = await sealQuery('seed=42&embed=1&hide=answers');
  const at = 20;
  const swapped = token[at] === 'A' ? 'B' : 'A';
  const edited = `${token.slice(0, at)}${swapped}${token.slice(at + 1)}`;

  await expect(unsealQuery(edited)).resolves.toStrictEqual({
    ok: false,
    problem: 'tampered',
  });
});

test('a token moved under another version is refused', async () => {
  const token = await sealQuery('seed=42');

  await expect(unsealQuery(`e9${token.slice(2)}`)).resolves.toStrictEqual({
    ok: false,
    problem: 'unsupported',
  });
});

test('a token that is not one is refused as malformed', async () => {
  for (const token of ['garbage', 'e1.', 'e1.***', 'e1.AAAA', 'e1.A']) {
    // eslint-disable-next-line no-await-in-loop -- one assertion per token, in order
    await expect(unsealQuery(token)).resolves.toStrictEqual({
      ok: false,
      problem: 'malformed',
    });
  }
});

test('the token of an address is the value of s', () => {
  expect(sealedToken('?s=e1.abc_-&embed=1')).toBe('e1.abc_-');
  expect(sealedToken('s=e1.first&s=e1.second')).toBe('e1.first');
  expect(sealedToken('?embed=1&hide=answers')).toBeNull();
  expect(sealedToken('')).toBeNull();
});

test('a sealed share link keeps the page and carries only s', async () => {
  const sealed = await sealShareUrl(
    'https://isomers.cheminfo.org/fr/exercises?formulas=C4H10O,C5H12&embed=0&hide=answers#top',
  );

  const address = new URL(sealed);

  expect(address.origin).toBe('https://isomers.cheminfo.org');
  expect(address.pathname).toBe('/fr/exercises');
  expect(address.hash).toBe('#top');
  expect([...address.searchParams.keys()]).toStrictEqual(['s']);
  await expect(
    unsealQuery(address.searchParams.get('s') ?? ''),
  ).resolves.toStrictEqual({
    ok: true,
    query: 'formulas=C4H10O,C5H12&hide=answers&embed=1',
  });
});

test('sealing a sealed link seals what it says, not the old token', async () => {
  const sealed = await sealShareUrl(
    'https://smiles.cheminfo.org/exercises?s=e1.old&mf=C2H6O',
  );

  const token = new URL(sealed).searchParams.get('s') ?? '';

  await expect(unsealQuery(token)).resolves.toStrictEqual({
    ok: true,
    query: 'mf=C2H6O&embed=1',
  });
});
