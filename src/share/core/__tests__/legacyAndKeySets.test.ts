import { expect, test } from 'vitest';

import {
  applyShareConfig,
  formatHiddenParts,
  parseShareConfig,
  readHiddenParts,
} from '../config.ts';
import { keySetParam } from '../keySetParam.ts';
import type { ShareVocabulary } from '../vocabulary.ts';

const parts = [
  { key: 'tabs', label: 'Tabs', description: 'Drops the tab bar.' },
  { key: 'hints', label: 'Hints', description: 'Drops the hints.' },
  { key: 'answer', label: 'Answer', description: 'Drops the answer.' },
];

const vocabulary: ShareVocabulary = {
  parts,
  legacyEmbedParts: ['header', 'menu'],
};

test('an old link hiding the header still opens framed, and is rewritten with embed', () => {
  const config = parseShareConfig('hide=header,hints&smiles=CCO', vocabulary);

  expect(config).toStrictEqual({ embed: true, hidden: ['hints'], params: {} });
  expect(parseShareConfig('?hide=menu', vocabulary).embed).toBe(true);
  expect(parseShareConfig('?hide=hints', vocabulary).embed).toBe(false);
  expect(
    applyShareConfig('hide=header,hints&smiles=CCO', config, vocabulary),
  ).toBe('smiles=CCO&embed=1&hide=hints');
});

test('a vocabulary without legacy parts reads the old key as nothing', () => {
  expect(parseShareConfig('hide=header', { parts }).embed).toBe(false);
});

test('the hide value of a decoded query reads and writes in the vocabulary order', () => {
  expect(readHiddenParts('answer, unknown ,tabs', parts)).toStrictEqual([
    'tabs',
    'answer',
  ]);
  expect(readHiddenParts(undefined, parts)).toStrictEqual([]);
  expect(formatHiddenParts(new Set(['answer', 'hints', 'header']), parts)).toBe(
    'hints,answer',
  );
  expect(formatHiddenParts([], parts)).toBe('');
});

const LAYERS = ['breakdown', 'working', 'valences'] as const;

test('a key set reads ?flags=none as every key off and an absent one as nothing said', () => {
  const flags = keySetParam(LAYERS);

  expect(flags.parse('none')).toStrictEqual(new Set());
  expect(flags.parse(null)).toBeNull();
  expect(flags.parse('')).toBeNull();
  expect(flags.parse('valences,breakdown,retired')).toStrictEqual(
    new Set(['breakdown', 'valences']),
  );
  expect(flags.serialize(new Set())).toBe('none');
  expect(flags.serialize(new Set(['valences', 'breakdown']))).toBe(
    'breakdown,valences',
  );
  expect(flags.serialize(null)).toBeNull();
});

test('a key set at its default leaves the address alone', () => {
  const flags = keySetParam(LAYERS, { default: ['working'], none: 'off' });

  expect(flags.parse(null)).toStrictEqual(new Set(['working']));
  expect(flags.parse('off')).toStrictEqual(new Set());
  expect(flags.serialize(new Set(['working']))).toBeNull();
  expect(flags.serialize(new Set())).toBe('off');
  expect(flags.parse(flags.serialize(new Set(['breakdown'])))).toStrictEqual(
    new Set(['breakdown']),
  );
});

test('a key set can leave its initial keys unwritten and still say nothing when absent', () => {
  const flags = keySetParam(LAYERS, { omitted: ['working'] });

  expect(flags.parse(null)).toBeNull();
  expect(flags.serialize(new Set(['working']))).toBeNull();
  expect(flags.serialize(new Set())).toBe('none');
  expect(flags.serialize(new Set(['working', 'breakdown']))).toBe(
    'breakdown,working',
  );
});

test('a key set round-trips through a vocabulary and a link', () => {
  const withFlags = { parts, params: { flags: keySetParam(LAYERS) } };
  const config = parseShareConfig('flags=none&embed', withFlags);

  expect(config.params.flags).toStrictEqual(new Set());
  expect(applyShareConfig('mf=C6H6', config, withFlags)).toBe(
    'mf=C6H6&embed=1&flags=none',
  );
  expect(parseShareConfig('mf=C6H6', withFlags).params.flags).toBeNull();
});
