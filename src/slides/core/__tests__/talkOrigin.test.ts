import { expect, test } from 'vitest';

import {
  TALK_ORIGIN_PARAM,
  formatTalkOrigin,
  parseTalkOrigin,
  withTalkOrigin,
} from '../talkOrigin.ts';

test('the parameter is named from', () => {
  expect(TALK_ORIGIN_PARAM).toBe('from');
});

test('an origin on the same site omits the site', () => {
  expect(formatTalkOrigin({ talkId: 'sgms-2026', slide: 3 })).toBe(
    'talk:sgms-2026:3',
  );
});

test('an origin on another site names it', () => {
  expect(
    formatTalkOrigin({ talkId: 'sgms-2026', slide: 3, site: 'chemcalc' }),
  ).toBe('talk:chemcalc:sgms-2026:3');
});

test('the slide never goes below zero', () => {
  expect(formatTalkOrigin({ talkId: 'a', slide: -2 })).toBe('talk:a:0');
});

test('reads back an origin with no site', () => {
  expect(parseTalkOrigin('?from=talk:sgms-2026:3')).toStrictEqual({
    talkId: 'sgms-2026',
    slide: 3,
  });
});

test('reads back an origin naming a site', () => {
  expect(parseTalkOrigin('from=talk:chemcalc:sgms-2026:12')).toStrictEqual({
    talkId: 'sgms-2026',
    slide: 12,
    site: 'chemcalc',
  });
});

test('reads the origin among the tool own parameters', () => {
  expect(
    parseTalkOrigin('?mf=C8H10N4O2&from=talk%3Aa%3A2&ionizations=%2BH'),
  ).toStrictEqual({ talkId: 'a', slide: 2 });
});

test('an address with no origin reads as none', () => {
  expect(parseTalkOrigin('')).toBeNull();
  expect(parseTalkOrigin('?mf=H2O')).toBeNull();
});

test('a malformed origin reads as none rather than throwing', () => {
  expect(parseTalkOrigin('?from=talk:a')).toBeNull();
  expect(parseTalkOrigin('?from=talk:a:b')).toBeNull();
  expect(parseTalkOrigin('?from=slide:a:1')).toBeNull();
  expect(parseTalkOrigin('?from=')).toBeNull();
  expect(parseTalkOrigin('?from=%E0%A4%A')).toBeNull();
});

test('the round trip returns what it was given', () => {
  for (const origin of [
    { talkId: 'sgms-2026', slide: 0 },
    { talkId: 'sgms-2026', slide: 41, site: 'chemcalc' },
  ]) {
    expect(parseTalkOrigin(`?from=${formatTalkOrigin(origin)}`)).toStrictEqual(
      origin,
    );
  }
});

test('a link with no query gets the parameter first', () => {
  expect(withTalkOrigin('/mf-finder', { talkId: 'a', slide: 3 })).toBe(
    '/mf-finder?from=talk:a:3',
  );
});

test('a link with a query keeps its own parameters', () => {
  expect(
    withTalkOrigin('/mf-finder?targetMass=300.123', { talkId: 'a', slide: 3 }),
  ).toBe('/mf-finder?targetMass=300.123&from=talk:a:3');
});

test('an absolute link is treated the same way', () => {
  expect(
    withTalkOrigin('https://chemcalc.org/mf?mf=H2O', {
      talkId: 'a',
      slide: 1,
      site: 'learn',
    }),
  ).toBe('https://chemcalc.org/mf?mf=H2O&from=talk:learn:a:1');
});

test('a fragment stays at the end', () => {
  expect(withTalkOrigin('/mf#results', { talkId: 'a', slide: 1 })).toBe(
    '/mf?from=talk:a:1#results',
  );
});

test('a talk id needing escaping survives the round trip', () => {
  const href = withTalkOrigin('/mf', { talkId: 'a b&c', slide: 2 });

  expect(href).toBe('/mf?from=talk:a%20b%26c:2');
  expect(parseTalkOrigin(href.slice(href.indexOf('?')))).toStrictEqual({
    talkId: 'a b&c',
    slide: 2,
  });
});
