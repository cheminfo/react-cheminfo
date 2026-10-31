import { expect, test } from 'vitest';

import {
  CARD_PARAM,
  ONLY_PARAM,
  isCardAddress,
  parseOnlyParam,
  sitePageUrl,
} from '../cardAddress.ts';

const ORIGIN = 'https://equilibrium.cheminfo.org';

test('the card is asked for by the presence of its parameter', () => {
  expect(CARD_PARAM).toBe('card');
  expect(isCardAddress('?ph=7&embed=1&card=1')).toBe(true);
  expect(isCardAddress('card')).toBe(true);
  expect(isCardAddress('?cards=1&embed=1')).toBe(false);
  expect(isCardAddress('')).toBe(false);
});

test('the page behind a card drops card, embed and hide, and keeps the rest as written', () => {
  const page = sitePageUrl({
    origin: ORIGIN,
    pathname: '/titration',
    search: '?ind=methyl%20red&embed=1&hide=a,b&smiles=CC[N+](C)(C)C&card=1',
  });

  expect(page).toBe(
    `${ORIGIN}/titration?ind=methyl%20red&smiles=CC[N+](C)(C)C`,
  );
});

test('the page behind a card drops what the question singled out', () => {
  expect(ONLY_PARAM).toBe('only');
  expect(
    sitePageUrl({
      origin: ORIGIN,
      pathname: '/compound/14034',
      search: '?embed=1&card=1&only=formula,mass',
    }),
  ).toBe(`${ORIGIN}/compound/14034`);
});

test('only names the facts the card knows, each once, in the order written', () => {
  const known = ['formula', 'mass', 'names'] as const;

  expect(parseOnlyParam('mass,formula', known)).toStrictEqual([
    'mass',
    'formula',
  ]);
  expect(parseOnlyParam(' formula , renamed,formula', known)).toStrictEqual([
    'formula',
  ]);
  expect(parseOnlyParam('renamed', known)).toStrictEqual([]);
  expect(parseOnlyParam('', known)).toStrictEqual([]);
  expect(parseOnlyParam(null, known)).toStrictEqual([]);
  expect(parseOnlyParam(undefined, known)).toStrictEqual([]);
});

test('a card with nothing of its own opens the bare page', () => {
  expect(
    sitePageUrl({ origin: ORIGIN, pathname: '/', search: '?embed&card' }),
  ).toBe(`${ORIGIN}/`);
  expect(sitePageUrl({ origin: ORIGIN, pathname: '/ph', search: '' })).toBe(
    `${ORIGIN}/ph`,
  );
});

test('what only the card reads is left out with it', () => {
  const page = sitePageUrl(
    {
      origin: ORIGIN,
      pathname: '/titration',
      search: 'ind=thymol&card=1&scale=methyl red&ph=7.5,10.5&embed=1',
    },
    { cardParams: ['scale', 'ph'] },
  );

  expect(page).toBe(`${ORIGIN}/titration?ind=thymol`);
});

/**
 * The InChI a tutorial step goes without, which the converter reads.
 * @param key - A parameter of the card's address.
 * @param pathname - The card's path.
 * @returns True for the InChI on a tutorial step.
 */
function isCardOnly(key: string, pathname: string): boolean {
  return key === 'inchi' && pathname.includes('/tutorial/');
}

test('a parameter one page does not read is left out on that page only', () => {
  const options = { isCardOnly };

  expect(
    sitePageUrl(
      {
        origin: 'https://inchi.cheminfo.org',
        pathname: '/tutorial/anatomy',
        search: '?smiles=CCO&card=1&inchi=InChI%3D1S',
      },
      options,
    ),
  ).toBe('https://inchi.cheminfo.org/tutorial/anatomy?smiles=CCO');
  expect(
    sitePageUrl(
      {
        origin: 'https://inchi.cheminfo.org',
        pathname: '/',
        search: '?inchi=InChI%3D1S&card=1',
      },
      options,
    ),
  ).toBe('https://inchi.cheminfo.org/?inchi=InChI%3D1S');
});

test('a URL is a location, the mount and its path included', () => {
  const card = new URL(
    'https://www.cheminfo.org/periodic-table/table/Fe?card=1&embed=1#top',
  );

  expect(sitePageUrl(card)).toBe(
    'https://www.cheminfo.org/periodic-table/table/Fe',
  );
});

test('empty parts of a hand-typed query are dropped, never doubled', () => {
  expect(
    sitePageUrl({
      origin: ORIGIN,
      pathname: '/ph',
      search: '?&s=OH-:10&&card=1&',
    }),
  ).toBe(`${ORIGIN}/ph?s=OH-:10`);
});

test('a key is read with a literal plus unless the site writes spaces as plus', () => {
  const location = { origin: ORIGIN, pathname: '/', search: '?a+b=1&card=1' };

  expect(sitePageUrl(location, { cardParams: ['a b'] })).toBe(
    `${ORIGIN}/?a+b=1`,
  );
  expect(
    sitePageUrl(location, { cardParams: ['a b'], literalPlus: false }),
  ).toBe(`${ORIGIN}/`);
});
