import { expect, test } from 'vitest';

import { parseTalk } from '../talk.ts';
import {
  buildTalkManifest,
  parseTalkManifest,
  talkSourceUrl,
  talkSummary,
} from '../talkManifest.ts';

const SOURCE = `---
title: ChemCalc in Action
subtitle: From formula to spectrum
event: SGMS 2026
date: 2026-06-17
location: Beatenberg
author: Luc Patiny
---

# ChemCalc

---

## Mass
`;

test('a summary carries the listing metadata and the slide count', () => {
  expect(talkSummary('sgms-2026', parseTalk(SOURCE))).toStrictEqual({
    id: 'sgms-2026',
    title: 'ChemCalc in Action',
    subtitle: 'From formula to spectrum',
    event: 'SGMS 2026',
    date: '2026-06-17',
    author: 'Luc Patiny',
    slideCount: 2,
  });
});

test('a summary leaves out what the front-matter never said', () => {
  expect(talkSummary('bare', parseTalk('# A'))).toStrictEqual({
    id: 'bare',
    title: '',
    slideCount: 1,
  });
});

test('a manifest lists the talks in the order it was given them', () => {
  const manifest = buildTalkManifest({
    site: 'chemcalc',
    origin: 'https://chemcalc.org',
    talks: [
      { id: 'sgms-2026', ...parseTalk(SOURCE) },
      { id: 'bare', ...parseTalk('# A') },
    ],
  });

  expect(manifest.site).toBe('chemcalc');
  expect(manifest.origin).toBe('https://chemcalc.org');
  expect(manifest.talks.map((talk) => talk.id)).toStrictEqual([
    'sgms-2026',
    'bare',
  ]);
  expect(manifest.talks[1]).toStrictEqual({
    id: 'bare',
    title: '',
    slideCount: 1,
  });
});

test('a manifest survives being written and read back', () => {
  const manifest = buildTalkManifest({
    site: 'chemcalc',
    origin: 'https://chemcalc.org',
    talks: [{ id: 'sgms-2026', ...parseTalk(SOURCE) }],
  });

  const json = JSON.stringify(manifest);

  expect(parseTalkManifest(JSON.parse(json))).toStrictEqual(manifest);
});

test('unknown keys are ignored, on the manifest and on a talk', () => {
  expect(
    parseTalkManifest({
      site: 'chemcalc',
      origin: 'https://chemcalc.org',
      generatedAt: '2026-08-19',
      talks: [{ id: 'a', title: 'A', slideCount: 3, colour: 'pink' }],
    }),
  ).toStrictEqual({
    site: 'chemcalc',
    origin: 'https://chemcalc.org',
    talks: [{ id: 'a', title: 'A', slideCount: 3 }],
  });
});

test('a talk entry missing what a listing needs is dropped', () => {
  expect(
    parseTalkManifest({
      site: 'chemcalc',
      origin: 'https://chemcalc.org',
      talks: [
        { id: 'a', title: 'A', slideCount: 3 },
        { id: 'b', slideCount: 2 },
        { title: 'C', slideCount: 2 },
        { id: 'd', title: 'D', slideCount: 'many' },
        'not a talk',
        null,
      ],
    })?.talks,
  ).toStrictEqual([{ id: 'a', title: 'A', slideCount: 3 }]);
});

test('a slide count is read as a whole, non-negative number', () => {
  expect(
    parseTalkManifest({
      site: 's',
      origin: 'o',
      talks: [{ id: 'a', title: 'A', slideCount: -4.7 }],
    })?.talks,
  ).toStrictEqual([{ id: 'a', title: 'A', slideCount: 0 }]);
});

test('garbage is no manifest at all', () => {
  expect(parseTalkManifest(null)).toBeNull();
  expect(parseTalkManifest('a manifest')).toBeNull();
  expect(parseTalkManifest(42)).toBeNull();
  expect(parseTalkManifest([])).toBeNull();
  expect(parseTalkManifest({ site: 'chemcalc' })).toBeNull();
  expect(parseTalkManifest({ site: 'chemcalc', origin: 'o' })).toBeNull();
  expect(parseTalkManifest({ site: '', origin: 'o', talks: [] })).toBeNull();
});

test('a manifest with no talks parses to an empty list', () => {
  expect(
    parseTalkManifest({ site: 'chemcalc', origin: 'o', talks: [] }),
  ).toStrictEqual({ site: 'chemcalc', origin: 'o', talks: [] });
});

test('a talk source sits under the publishing origin', () => {
  const manifest = {
    site: 'chemcalc',
    origin: 'https://chemcalc.org',
    talks: [],
  };

  expect(talkSourceUrl(manifest, 'sgms-2026')).toBe(
    'https://chemcalc.org/talks/sgms-2026.md',
  );
});

test('a trailing slash on the origin does not double up', () => {
  expect(
    talkSourceUrl(
      { site: 'chemcalc', origin: 'https://chemcalc.org//', talks: [] },
      'a',
    ),
  ).toBe('https://chemcalc.org/talks/a.md');
});
