import { expect, test } from 'vitest';

import { framedLocally } from '../localFrame.ts';
import {
  followTalkOrigin,
  resolveTalkAddress,
  slideOriginOf,
} from '../talkOrigin.ts';

test('a slide’s origin names its site only when the deck is played elsewhere', () => {
  expect(slideOriginOf({ talkId: 'a', slideIndex: 4 })).toStrictEqual({
    talkId: 'a',
    slide: 4,
  });
  expect(
    slideOriginOf({ talkId: 'a', slideIndex: 4, site: 'chemcalc' }),
  ).toStrictEqual({ talkId: 'a', slide: 4, site: 'chemcalc' });
});

test('an address of the deck is resolved against the site that published it', () => {
  expect(
    resolveTalkAddress('/images/nmr.jpg', 'https://drugs.cheminfo.org/'),
  ).toBe('https://drugs.cheminfo.org/images/nmr.jpg');
  expect(
    resolveTalkAddress('/mf-finder?mass=300', 'https://www.chemcalc.org'),
  ).toBe('https://www.chemcalc.org/mf-finder?mass=300');
});

test('an address played on its own site, or already absolute, is left as written', () => {
  expect(resolveTalkAddress('/images/nmr.jpg')).toBe('/images/nmr.jpg');
  expect(
    resolveTalkAddress(
      'https://example.org/photo.jpg',
      'https://drugs.cheminfo.org',
    ),
  ).toBe('https://example.org/photo.jpg');
  expect(
    resolveTalkAddress('//example.org/photo.jpg', 'https://drugs.cheminfo.org'),
  ).toBe('//example.org/photo.jpg');
  expect(resolveTalkAddress('images/a.png', 'https://drugs.cheminfo.org')).toBe(
    'images/a.png',
  );
});

test('a demo link leaves the way back to its slide, until a talk opens again', () => {
  const origin = { talkId: '20261026_esc_project', slide: 4 };

  const first = followTalkOrigin(null, '?from=talk:20261026_esc_project:4', {
    onTalkPage: false,
  });

  expect(first).toStrictEqual(origin);
  expect(followTalkOrigin(first, '', { onTalkPage: false })).toBe(first);
  expect(followTalkOrigin(first, '?slide=5', { onTalkPage: true })).toBeNull();
});

test('only a slide of this site is a way back from here, when the site is named', () => {
  const options = { onTalkPage: false, site: 'drugs' };

  expect(
    followTalkOrigin(null, '?from=talk:chemcalc:20260824_IMSC:2', options),
  ).toBeNull();
  expect(
    followTalkOrigin(null, '?from=talk:drugs:20261026_esc_project:2', options),
  ).toStrictEqual({ talkId: '20261026_esc_project', slide: 2, site: 'drugs' });
  expect(
    followTalkOrigin(null, 'from=talk:chemcalc:20260824_IMSC:2', {
      onTalkPage: false,
    }),
  ).toStrictEqual({ talkId: '20260824_IMSC', slide: 2, site: 'chemcalc' });
});

test('the published address frames the site serving the deck', () => {
  const body = 'Draw it.\n\nhttps://draw.cheminfo.org/?embed=1&hide=panels';

  expect(
    framedLocally(body, 'draw.cheminfo.org', 'http://localhost:11029'),
  ).toBe('Draw it.\n\nhttp://localhost:11029/?embed=1&hide=panels');
});

test('an address of another site of the family is left as written', () => {
  const body = 'https://www.chemcalc.org/?mf=C8H10N4O2';

  expect(
    framedLocally(body, 'draw.cheminfo.org', 'http://localhost:11029'),
  ).toBe(body);
  expect(framedLocally(body, 'www.chemcalc.org')).toBe(body);
});
