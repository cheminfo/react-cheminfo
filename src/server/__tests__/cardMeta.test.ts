import { EMBED_META_KEY } from 'cheminfo-mcp-server';
import { expect, test } from 'vitest';

import { cardMeta, pageAnswer } from '../cardMeta.ts';

const ADDRESSES = {
  siteUrl: 'https://equilibrium.cheminfo.org',
  publicUrl: 'https://equilibrium.c6h6.org/',
};

test('the meta names the card inline and the framed page over the screen', () => {
  expect(cardMeta(ADDRESSES, '/titration?ind=thymol')).toStrictEqual({
    [EMBED_META_KEY]: {
      url: 'https://equilibrium.c6h6.org/titration?ind=thymol&embed=1&card=1',
      page: 'https://equilibrium.c6h6.org/titration?ind=thymol&embed=1',
    },
  });
});

test('the parts left out go on both, what only the card reads on the card', () => {
  expect(
    cardMeta(ADDRESSES, '/compound/5793', {
      hide: ['similar', 'sources'],
      card: 'infobox',
      extra: { section: 'Hazards' },
    }),
  ).toStrictEqual({
    [EMBED_META_KEY]: {
      url: 'https://equilibrium.c6h6.org/compound/5793?embed=1&hide=similar,sources&card=infobox&section=Hazards',
      page: 'https://equilibrium.c6h6.org/compound/5793?embed=1&hide=similar,sources',
    },
  });
});

test('a card address longer than the limit is not carried', () => {
  const pattern = 'a'.repeat(7960);

  expect(cardMeta(ADDRESSES, `/playground?pattern=${pattern}`)).toBeUndefined();
  expect(
    cardMeta(ADDRESSES, `/playground?pattern=${pattern}`, { maxLength: 9000 }),
  ).toStrictEqual({
    [EMBED_META_KEY]: {
      url: `https://equilibrium.c6h6.org/playground?pattern=${pattern}&embed=1&card=1`,
      page: `https://equilibrium.c6h6.org/playground?pattern=${pattern}&embed=1`,
    },
  });
});

test('an answer links to the static site and frames this server', () => {
  expect(
    pageAnswer(ADDRESSES, '/titration', {
      ind: 'phenolphthalein',
      smiles: 'CC[N+](C)(C)C',
      list: 'a,b',
      unset: undefined,
      blank: '',
    }),
  ).toStrictEqual({
    link: 'https://equilibrium.cheminfo.org/titration?ind=phenolphthalein&smiles=CC%5BN%2B%5D(C)(C)C&list=a,b',
    meta: {
      [EMBED_META_KEY]: {
        url: 'https://equilibrium.c6h6.org/titration?ind=phenolphthalein&smiles=CC%5BN%2B%5D(C)(C)C&list=a,b&embed=1&card=1',
        page: 'https://equilibrium.c6h6.org/titration?ind=phenolphthalein&smiles=CC%5BN%2B%5D(C)(C)C&list=a,b&embed=1',
      },
    },
  });
});

test('a page with no query links to its bare address', () => {
  expect(
    pageAnswer(
      {
        siteUrl: 'https://www.cheminfo.org/surge/',
        publicUrl: 'http://localhost:10321',
      },
      '/',
    ),
  ).toStrictEqual({
    link: 'https://www.cheminfo.org/surge/',
    meta: {
      [EMBED_META_KEY]: {
        url: 'http://localhost:10321/?embed=1&card=1',
        page: 'http://localhost:10321/?embed=1',
      },
    },
  });
});

test('a card too long to carry still gives the link', () => {
  const answer = pageAnswer(
    ADDRESSES,
    '/playground',
    { pattern: 'b'.repeat(100) },
    { maxLength: 100 },
  );

  expect(answer).toStrictEqual({
    link: `https://equilibrium.cheminfo.org/playground?pattern=${'b'.repeat(100)}`,
    meta: undefined,
  });
});
