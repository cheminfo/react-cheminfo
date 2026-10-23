import { expect, test } from 'vitest';

import { cardPageUrl, framedPageUrl } from '../cardPageUrl.ts';

const PAGE = 'https://equilibrium.c6h6.org/titration?ind=thymol';

test('the framed page is the page under embed', () => {
  expect(framedPageUrl(PAGE)).toBe(`${PAGE}&embed=1`);
  expect(framedPageUrl('https://vcl.c6h6.org/')).toBe(
    'https://vcl.c6h6.org/?embed=1',
  );
});

test('the parts left out are written with their commas', () => {
  expect(framedPageUrl(PAGE, { hide: ['editor', 'options'] })).toBe(
    `${PAGE}&embed=1&hide=editor,options`,
  );
  expect(framedPageUrl(PAGE, { hide: [] })).toBe(`${PAGE}&embed=1`);
});

test('the card is the framed page with card, then what only it reads', () => {
  expect(cardPageUrl(PAGE)).toBe(`${PAGE}&embed=1&card=1`);
  expect(
    cardPageUrl(PAGE, {
      hide: ['help'],
      extra: { scale: 'methyl red,thymol blue', ph: '7.5,10.5', none: '' },
    }),
  ).toBe(
    `${PAGE}&embed=1&hide=help&card=1&scale=methyl%20red,thymol%20blue&ph=7.5,10.5`,
  );
});

test('a site with several cards names the one it asks for', () => {
  expect(
    cardPageUrl('/compound/5793', {
      card: 'infobox',
      extra: { section: 'Hazards', rows: undefined },
    }),
  ).toBe('/compound/5793?embed=1&card=infobox&section=Hazards');
});

test('a plus is escaped, so every reader of the link reads a plus', () => {
  expect(cardPageUrl('/', { extra: { ion: 'H+' } })).toBe(
    '/?embed=1&card=1&ion=H%2B',
  );
});

test('the parameters go before a fragment, after a dangling separator', () => {
  expect(cardPageUrl('/page?a=1#part')).toBe('/page?a=1&embed=1&card=1#part');
  expect(framedPageUrl('/page?')).toBe('/page?embed=1');
  expect(framedPageUrl('/page?a=1&')).toBe('/page?a=1&embed=1');
});
