import { expect, test } from 'vitest';

import {
  answerAddresses,
  joinAddress,
  viewOrigins,
} from '../answerAddresses.ts';

test('the two addresses are written alike, ending in a slash', () => {
  expect(
    answerAddresses({
      siteUrl: 'https://equilibrium.cheminfo.org',
      publicUrl: ' https://equilibrium.c6h6.org/ ',
    }),
  ).toStrictEqual({
    siteUrl: 'https://equilibrium.cheminfo.org/',
    publicUrl: 'https://equilibrium.c6h6.org/',
  });
});

test('a mount is kept, and a query or a fragment is not', () => {
  expect(
    answerAddresses({
      siteUrl: new URL('https://www.cheminfo.org/isomers?x=1#top'),
      publicUrl: 'http://localhost:10321',
    }),
  ).toStrictEqual({
    siteUrl: 'https://www.cheminfo.org/isomers/',
    publicUrl: 'http://localhost:10321/',
  });
});

test('an address that is not http or https is refused', () => {
  expect(() =>
    answerAddresses({ siteUrl: 'isomers.cheminfo.org', publicUrl: 'http://a' }),
  ).toThrow('siteUrl is not an address: isomers.cheminfo.org');
  expect(() =>
    answerAddresses({
      siteUrl: 'https://a.org',
      publicUrl: 'ftp://surge.c6h6.org',
    }),
  ).toThrow('publicUrl is not an http or https address: ftp://surge.c6h6.org');
});

test('a page is joined with one slash, whichever way the base is written', () => {
  for (const base of ['https://x.org/surge', 'https://x.org/surge/']) {
    expect(joinAddress(base, '/generator?mf=C6H6')).toBe(
      'https://x.org/surge/generator?mf=C6H6',
    );
    expect(joinAddress(base, 'generator')).toBe(
      'https://x.org/surge/generator',
    );
    expect(joinAddress(base, '/')).toBe('https://x.org/surge/');
    expect(joinAddress(base, '?mf=C6H6')).toBe('https://x.org/surge/?mf=C6H6');
  }

  expect(joinAddress('https://3d.cheminfo.org', '/conformers')).toBe(
    'https://3d.cheminfo.org/conformers',
  );
});

test('the view frames each origin once, this server first', () => {
  expect(
    viewOrigins({
      siteUrl: 'https://lcao.cheminfo.org/',
      publicUrl: 'https://lcao.c6h6.org/',
    }),
  ).toStrictEqual(['https://lcao.c6h6.org', 'https://lcao.cheminfo.org']);
  expect(
    viewOrigins({
      siteUrl: 'https://chembio.cheminfo.org',
      publicUrl: 'https://chembio.cheminfo.org/',
    }),
  ).toStrictEqual(['https://chembio.cheminfo.org']);
});
