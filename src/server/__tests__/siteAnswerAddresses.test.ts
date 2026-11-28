/**
 * Where a tool server's answers point, read off its environment: the cases of
 * the toolAddresses chembio, wikidata, pdb, openbabel and crystals each wrote;
 * a record of a site outside the family stands in for crystals' own.
 */

import { expect, test } from 'vitest';

import { OUTSIDE_SITE } from '../../ecosystem/core/__tests__/outsideSite.ts';
import { siteAnswerAddresses } from '../config.ts';

const CHEMBIO = { site: 'chembio', servesSite: true } as const;

test('a server serving its site is framed on SITE_URL when one is named', () => {
  expect(siteAnswerAddresses({}, { ...CHEMBIO, port: 10_630 })).toStrictEqual({
    siteUrl: 'https://chembio.cheminfo.org/',
    publicUrl: 'http://localhost:10630/',
  });
  expect(
    siteAnswerAddresses(
      { SITE_URL: 'https://chembio.cheminfo.org/' },
      { ...CHEMBIO, port: 1 },
    ),
  ).toStrictEqual({
    siteUrl: 'https://chembio.cheminfo.org/',
    publicUrl: 'https://chembio.cheminfo.org/',
  });
  expect(
    siteAnswerAddresses(
      { SITE_URL: ' ', PUBLIC_URL: 'https://chembio.c6h6.org' },
      { ...CHEMBIO, port: 1 },
    ),
  ).toStrictEqual({
    siteUrl: 'https://chembio.cheminfo.org/',
    publicUrl: 'https://chembio.c6h6.org/',
  });
});

test('unset or blank, the links name the site and the view this server', () => {
  const options = { site: 'wikidata', servesSite: true } as const;

  expect(siteAnswerAddresses({}, { ...options, port: 10_704 })).toStrictEqual({
    siteUrl: 'https://wikidata.cheminfo.org/',
    publicUrl: 'http://localhost:10704/',
  });
  expect(
    siteAnswerAddresses(
      { SITE_URL: ' ', PUBLIC_URL: '' },
      { ...options, port: 10_712 },
    ),
  ).toStrictEqual({
    siteUrl: 'https://wikidata.cheminfo.org/',
    publicUrl: 'http://localhost:10712/',
  });
  expect(
    siteAnswerAddresses(
      { SITE_URL: 'https://wikidata.cheminfo.org' },
      { ...options, port: 10_704 },
    ),
  ).toStrictEqual({
    siteUrl: 'https://wikidata.cheminfo.org/',
    publicUrl: 'https://wikidata.cheminfo.org/',
  });
});

test('a configured address keeps its path, ending in one more slash at most', () => {
  expect(
    siteAnswerAddresses(
      {
        SITE_URL: 'https://wikidata.cheminfo.org/',
        PUBLIC_URL: 'https://wikidata.c6h6.org//',
      },
      { site: 'wikidata', port: 10_704, servesSite: true },
    ),
  ).toStrictEqual({
    siteUrl: 'https://wikidata.cheminfo.org/',
    publicUrl: 'https://wikidata.c6h6.org//',
  });
});

test('a server beside its site is framed on itself, whatever SITE_URL says', () => {
  const options = { site: 'openbabel', port: 20_808 } as const;

  expect(siteAnswerAddresses({}, options)).toStrictEqual({
    siteUrl: 'https://openbabel.cheminfo.org/',
    publicUrl: 'http://localhost:20808/',
  });
  expect(
    siteAnswerAddresses(
      {
        SITE_URL: 'https://openbabel.cheminfo.org/',
        PUBLIC_URL: ' https://openbabel.c6h6.org// ',
      },
      options,
    ),
  ).toStrictEqual({
    siteUrl: 'https://openbabel.cheminfo.org/',
    publicUrl: 'https://openbabel.c6h6.org//',
  });
  expect(
    siteAnswerAddresses(
      { SITE_URL: 'https://openbabel.cheminfo.org/' },
      options,
    ),
  ).toStrictEqual({
    siteUrl: 'https://openbabel.cheminfo.org/',
    publicUrl: 'http://localhost:20808/',
  });
  expect(
    siteAnswerAddresses(
      { SITE_URL: '', PUBLIC_URL: '  ' },
      { site: 'openbabel', port: 1 },
    ),
  ).toStrictEqual({
    siteUrl: 'https://openbabel.cheminfo.org/',
    publicUrl: 'http://localhost:1/',
  });
});

test('with no port, this server is framed on the site, a record of its own', () => {
  const options = { site: OUTSIDE_SITE, servesSite: true } as const;

  expect(siteAnswerAddresses({}, options)).toStrictEqual({
    siteUrl: 'https://spectra.cheminfo.org/',
    publicUrl: 'https://spectra.cheminfo.org/',
  });
  expect(
    siteAnswerAddresses({ SITE_URL: '', PUBLIC_URL: '' }, options),
  ).toStrictEqual({
    siteUrl: 'https://spectra.cheminfo.org/',
    publicUrl: 'https://spectra.cheminfo.org/',
  });
  expect(
    siteAnswerAddresses(
      { SITE_URL: 'https://www.cheminfo.org/spectra' },
      { site: OUTSIDE_SITE },
    ),
  ).toStrictEqual({
    siteUrl: 'https://www.cheminfo.org/spectra/',
    publicUrl: 'https://www.cheminfo.org/spectra/',
  });
});

test('an address that is not http or https is refused at start', () => {
  expect(() =>
    siteAnswerAddresses({ PUBLIC_URL: 'ftp://x.org' }, { ...CHEMBIO, port: 1 }),
  ).toThrow('PUBLIC_URL must be an http(s) address, not "ftp://x.org".');
  expect(() =>
    siteAnswerAddresses(
      { SITE_URL: 'not an address' },
      { site: 'pdb', port: 1, servesSite: true },
    ),
  ).toThrow('SITE_URL must be an http(s) address, not "not an address".');
  expect(() =>
    siteAnswerAddresses(
      { SITE_URL: 'wikidata' },
      { site: 'wikidata', port: 1 },
    ),
  ).toThrow('SITE_URL must be an http(s) address, not "wikidata".');
});
