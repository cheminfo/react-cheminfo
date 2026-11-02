import { afterEach, expect, expectTypeOf, test } from 'vitest';

import {
  holdPageAddress,
  releasePageAddress,
} from '../../../router/core/pageAddress.ts';
import { createPageShareConfig } from '../pageShareConfig.ts';
import type { ShareVocabulary } from '../vocabulary.ts';

import { BARE_VOCABULARY, VOCABULARY } from './vocabulary.ts';

afterEach(() => {
  releasePageAddress();
});

test('the page asks the configuration its address carries', () => {
  const share = createPageShareConfig(VOCABULARY, '?embed=1&hide=hints,menu');

  expect(share.isEmbedded()).toBe(true);
  expect(share.isHidden('hints')).toBe(true);
  expect(share.isHidden('menu')).toBe(true);
  expect(share.isHidden('answers')).toBe(false);
  expect(share.config).toStrictEqual({
    embed: true,
    hidden: ['menu', 'hints'],
    params: { count: null, zoom: 2, level: 'easy', set: '' },
  });
});

test('reading another address replaces the configuration', () => {
  const share = createPageShareConfig(BARE_VOCABULARY, '?embed&hide=about');

  expect(share.read('?hide=menu')).toStrictEqual({
    embed: false,
    hidden: ['menu'],
    params: {},
  });
  expect(share.isEmbedded()).toBe(false);
  expect(share.isHidden('about')).toBe(false);
  expect(share.isHidden('menu')).toBe(true);
});

test('with no address given, the page reads its own when first asked', () => {
  const share = createPageShareConfig(BARE_VOCABULARY);
  // A router adopting an old address, or a sealed link opened, after the
  // module holding the configuration was loaded.
  holdPageAddress('/tool?embed=1&hide=about');

  expect(share.isEmbedded()).toBe(true);
  expect(share.isHidden('about')).toBe(true);

  holdPageAddress('/tool');

  expect(share.isEmbedded()).toBe(true);
  expect(share.read().embed).toBe(false);
});

test('outside a browser, an unconfigured page is read', () => {
  const share = createPageShareConfig(BARE_VOCABULARY);

  expect(share.config).toStrictEqual({ embed: false, hidden: [], params: {} });
});

test('the parts a vocabulary lists are the keys a page may ask about', () => {
  const vocabulary = {
    parts: [
      { key: 'editor', label: 'Editor', description: 'The canvas.' },
      { key: 'hints', label: 'Hints', description: 'The hint ladder.' },
    ],
  } as const satisfies ShareVocabulary;
  const share = createPageShareConfig(vocabulary, '');

  expectTypeOf(share.isHidden).parameter(0).toEqualTypeOf<'editor' | 'hints'>();
  expectTypeOf(createPageShareConfig(BARE_VOCABULARY).isHidden)
    .parameter(0)
    .toEqualTypeOf<string>();
});
