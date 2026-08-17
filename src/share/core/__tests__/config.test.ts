import { expect, test } from 'vitest';

import {
  applyShareConfig,
  isHidden,
  isShareConfigured,
  parseShareConfig,
  suggestedShareConfig,
} from '../config.ts';
import { parseQuery } from '../query.ts';

import { BARE_VOCABULARY, VOCABULARY } from './vocabulary.ts';

test('an address that configures nothing reads as an unconfigured page', () => {
  const config = parseShareConfig('', VOCABULARY);

  expect(config).toStrictEqual({
    embed: false,
    hidden: [],
    params: { count: null, zoom: 2, level: 'easy', set: '' },
  });
  expect(isShareConfigured(config, VOCABULARY)).toBe(false);
});

test.each([
  ['embed=1', true],
  ['?embed=1', true],
  ['embed', true],
  ['embed=', true],
  ['embed=0', false],
  ['', false],
])('%s reads embed as %s', (search, expected) => {
  expect(parseShareConfig(search, BARE_VOCABULARY).embed).toBe(expected);
});

test('the parts a link switches off are read in the vocabulary order', () => {
  // Two links ticking the same boxes are the same link, whatever order the
  // person building them clicked in.
  expect(
    parseShareConfig('hide=answers,menu,hints', VOCABULARY).hidden,
  ).toStrictEqual(['menu', 'hints', 'answers']);
});

test('a key this version does not know is ignored, so an old link still opens', () => {
  const config = parseShareConfig(
    'embed=1&hide=hints,diagram,answers',
    VOCABULARY,
  );

  expect(config.embed).toBe(true);
  expect(config.hidden).toStrictEqual(['hints', 'answers']);
});

test('a key named twice is switched off once, and blanks are not part of a key', () => {
  expect(parseShareConfig('hide=hints,hints', VOCABULARY).hidden).toStrictEqual(
    ['hints'],
  );
  expect(
    parseShareConfig('hide= hints , answers ', VOCABULARY).hidden,
  ).toStrictEqual(['hints', 'answers']);
});

test('an empty hide switches nothing off', () => {
  expect(parseShareConfig('hide=', VOCABULARY).hidden).toStrictEqual([]);
  expect(parseShareConfig('hide=,,', VOCABULARY).hidden).toStrictEqual([]);
});

test('a number above the maximum is clamped, not rejected', () => {
  expect(parseShareConfig('count=4000', VOCABULARY).params.count).toBe(100);
  expect(parseShareConfig('count=0', VOCABULARY).params.count).toBe(1);
  expect(parseShareConfig('zoom=9', VOCABULARY).params.zoom).toBe(3);
});

test('a malformed number falls back to its default', () => {
  expect(parseShareConfig('count=lots', VOCABULARY).params.count).toBeNull();
  expect(parseShareConfig('zoom=', VOCABULARY).params.zoom).toBe(2);
  expect(parseShareConfig('zoom=2.4', VOCABULARY).params.zoom).toBe(2);
});

test('an unknown name of a fixed set falls back, and a long value is cut', () => {
  expect(parseShareConfig('level=fiendish', VOCABULARY).params.level).toBe(
    'easy',
  );
  expect(parseShareConfig('level=hard', VOCABULARY).params.level).toBe('hard');
  expect(
    parseShareConfig('set=alkanes-and-alkenes', VOCABULARY).params.set,
  ).toBe('alkanes-');
});

test('what is left at its default is deleted rather than written', () => {
  const search = 'mf=CH4&embed=1&hide=hints&zoom=3&count=12&level=hard';
  const written = applyShareConfig(
    search,
    {
      embed: false,
      hidden: [],
      params: { count: null, zoom: 2, level: 'easy', set: '' },
    },
    VOCABULARY,
  );

  expect(written).toBe('mf=CH4');
});

test('a configuration is written after the inputs it travels with', () => {
  const written = applyShareConfig(
    'mf=CH4',
    {
      embed: true,
      hidden: ['answers', 'hints'],
      params: { count: 12, zoom: 2, level: 'hard', set: '' },
    },
    VOCABULARY,
  );

  expect(written).toBe('mf=CH4&embed=1&hide=hints,answers&count=12&level=hard');
});

test('a part the vocabulary does not list is never written into a link', () => {
  const written = applyShareConfig(
    '',
    {
      embed: false,
      hidden: ['diagram', 'menu'],
      params: { count: null, zoom: 2, level: 'easy', set: '' },
    },
    VOCABULARY,
  );

  expect(written).toBe('hide=menu');
});

test('parse, apply and parse again is stable', () => {
  const search = 'mf=CH4&embed=1&hide=answers,hints&count=4000&level=hard';
  const first = parseShareConfig(search, VOCABULARY);
  const written = applyShareConfig(search, first, VOCABULARY);
  const second = parseShareConfig(written, VOCABULARY);

  expect(written).toBe(
    'mf=CH4&embed=1&hide=hints,answers&count=100&level=hard',
  );
  expect(second).toStrictEqual(first);
  expect(applyShareConfig(written, second, VOCABULARY)).toBe(written);
});

test('a shared structure survives being written and read back', () => {
  const written = applyShareConfig(
    'smiles=CC[N+](C)(C)C',
    {
      embed: true,
      hidden: ['hints'],
      params: { count: null, zoom: 2, level: 'easy', set: '' },
    },
    VOCABULARY,
  );

  expect(written).toBe('smiles=CC%5BN+%5D(C)(C)C&embed=1&hide=hints');
  expect(parseQuery(written)[0]).toStrictEqual(['smiles', 'CC[N+](C)(C)C']);
});

test('a link is configured when it embeds, when it hides, or when it carries a value', () => {
  const plain = parseShareConfig('', VOCABULARY);

  expect(isShareConfigured(plain, VOCABULARY)).toBe(false);
  expect(isShareConfigured({ ...plain, embed: true }, VOCABULARY)).toBe(true);
  expect(isShareConfigured({ ...plain, hidden: ['menu'] }, VOCABULARY)).toBe(
    true,
  );
  expect(
    isShareConfigured(
      { ...plain, params: { ...plain.params, zoom: 3 } },
      VOCABULARY,
    ),
  ).toBe(true);
});

test('a hidden part is the one the link named', () => {
  const config = parseShareConfig('hide=hints', VOCABULARY);

  expect(isHidden(config, 'hints')).toBe(true);
  expect(isHidden(config, 'answers')).toBe(false);
  expect(isHidden(config, 'diagram')).toBe(false);
});

test('the dialog opens framed, on the parts a host page has no use for', () => {
  expect(suggestedShareConfig(VOCABULARY)).toStrictEqual({
    embed: true,
    hidden: ['hints'],
    params: { count: null, zoom: 2, level: 'easy', set: '' },
  });
  expect(suggestedShareConfig(BARE_VOCABULARY)).toStrictEqual({
    embed: true,
    hidden: [],
    params: {},
  });
});

test('a tool with nothing of its own carries only embed and hide', () => {
  const config = parseShareConfig('page=3&hide=about', BARE_VOCABULARY);

  expect(config).toStrictEqual({
    embed: false,
    hidden: ['about'],
    params: {},
  });
  expect(applyShareConfig('page=3', config, BARE_VOCABULARY)).toBe(
    'page=3&hide=about',
  );
});
