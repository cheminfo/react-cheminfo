import { expect, test } from 'vitest';

import { parseShareConfig } from '../config.ts';
import { escapeAttribute, escapeText } from '../escape.ts';
import { buildEmbedCode, buildShareUrl } from '../url.ts';

import { BARE_VOCABULARY, VOCABULARY } from './vocabulary.ts';

const BASE = 'https://chemcalc.org/mf-finder';

test('a link carries the page, its inputs and its configuration', () => {
  const url = buildShareUrl({
    base: BASE,
    search: 'mf=CH4',
    config: {
      embed: true,
      hidden: ['hints'],
      params: { count: 12, zoom: 2, level: 'easy', set: '' },
    },
    vocabulary: VOCABULARY,
  });

  expect(url).toBe(
    'https://chemcalc.org/mf-finder?mf=CH4&embed=1&hide=hints&count=12',
  );
});

test('an unconfigured link is the address alone', () => {
  const url = buildShareUrl({
    base: BASE,
    config: parseShareConfig('', VOCABULARY),
    vocabulary: VOCABULARY,
  });

  expect(url).toBe('https://chemcalc.org/mf-finder');
});

test('the current address can be handed over as it is', () => {
  const url = buildShareUrl({
    base: 'https://example.org/course/?mf=CH4#section',
    search: 'mf=CH4',
    config: parseShareConfig('hide=about', BARE_VOCABULARY),
    vocabulary: BARE_VOCABULARY,
  });

  expect(url).toBe('https://example.org/course/?mf=CH4&hide=about');
});

test('a shared structure keeps its charge', () => {
  const url = buildShareUrl({
    base: BASE,
    search: 'smiles=CC[N+](C)(C)C',
    config: parseShareConfig('embed=1', BARE_VOCABULARY),
    vocabulary: BARE_VOCABULARY,
  });

  expect(url).toBe(
    'https://chemcalc.org/mf-finder?smiles=CC%5BN+%5D(C)(C)C&embed=1',
  );
});

test('the embed code is one iframe loading the shared link', () => {
  expect(
    buildEmbedCode({ url: `${BASE}?embed=1`, title: 'ChemCalc — MF finder' }),
  ).toBe(
    '<iframe src="https://chemcalc.org/mf-finder?embed=1" title="ChemCalc — MF finder" width="100%" height="700" style="border: 1px solid #ddd; border-radius: 8px" loading="lazy"></iframe>',
  );
});

test('the frame takes the size and the border it is given', () => {
  expect(
    buildEmbedCode({
      url: BASE,
      title: 'Exercises',
      height: 480.6,
      width: 640,
      border: '0',
    }),
  ).toBe(
    '<iframe src="https://chemcalc.org/mf-finder" title="Exercises" width="640" height="481" style="border: 0; border-radius: 8px" loading="lazy"></iframe>',
  );
});

test('a height that is not a number falls back rather than writing NaN', () => {
  expect(
    buildEmbedCode({ url: BASE, title: 'Exercises', height: Number.NaN }),
  ).toContain('height="700"');
  expect(
    buildEmbedCode({ url: BASE, title: 'Exercises', height: 0 }),
  ).toContain('height="1"');
});

test('an ampersand or a quote cannot break out of its attribute', () => {
  expect(
    buildEmbedCode({
      url: `${BASE}?mf=CH4&embed=1`,
      title: 'The "gauche" conformer <b>',
    }),
  ).toBe(
    '<iframe src="https://chemcalc.org/mf-finder?mf=CH4&amp;embed=1" title="The &quot;gauche&quot; conformer &lt;b&gt;" width="100%" height="700" style="border: 1px solid #ddd; border-radius: 8px" loading="lazy"></iframe>',
  );
});

test('text is escaped without touching the quotes an attribute cares about', () => {
  expect(escapeText('a & b < c > "d"')).toBe('a &amp; b &lt; c &gt; "d"');
  expect(escapeAttribute('a & b < c > "d"')).toBe(
    'a &amp; b &lt; c &gt; &quot;d&quot;',
  );
});

test('an already escaped value is not escaped twice by accident', () => {
  expect(escapeText('&amp;')).toBe('&amp;amp;');
});
