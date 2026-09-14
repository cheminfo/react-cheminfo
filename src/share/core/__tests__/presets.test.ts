import { expect, test } from 'vitest';

import { applyShareConfig, parseShareConfig } from '../config.ts';
import { integerParam } from '../params.ts';
import type { SharePreset } from '../presets.ts';
import { applySharePreset, findSharePreset } from '../presets.ts';
import type { ShareVocabulary } from '../vocabulary.ts';

const PARAMS = {
  count: integerParam({ min: 1, max: 100, default: null }),
  seed: integerParam({ min: 0, max: 1000, default: 0 }),
};

const VOCABULARY: ShareVocabulary<typeof PARAMS> = {
  parts: [
    { key: 'tabs', label: 'Tabs', description: 'The tabs.', inHeader: true },
    { key: 'editor', label: 'Editor', description: 'The editor.' },
    { key: 'list', label: 'List', description: 'The list.' },
  ],
  params: PARAMS,
};

const FIGURE: SharePreset<typeof PARAMS> = {
  key: 'figure',
  label: 'Figure',
  description: 'One structure, nothing to change.',
  hidden: ['list', 'editor', 'viewer'],
  params: { count: 1 },
};

const FULL_SITE: SharePreset<typeof PARAMS> = {
  key: 'site',
  label: 'Whole site',
  description: 'Everything, chrome included.',
  embed: false,
};

test('a preset embeds by default and lists its parts in vocabulary order', () => {
  const draft = parseShareConfig('seed=7', VOCABULARY);

  expect(applySharePreset(draft, FIGURE, VOCABULARY)).toStrictEqual({
    embed: true,
    hidden: ['editor', 'list'],
    params: { count: 1, seed: 7 },
  });
});

test('a preset that names no part and no parameter resets the parts only', () => {
  const draft = parseShareConfig('embed=1&hide=list&count=5', VOCABULARY);

  expect(applySharePreset(draft, FULL_SITE, VOCABULARY)).toStrictEqual({
    embed: false,
    hidden: [],
    params: { count: 5, seed: 0 },
  });
});

test('the link a preset writes pins the parameters it names', () => {
  const draft = parseShareConfig('', VOCABULARY);
  const config = applySharePreset(draft, FIGURE, VOCABULARY);

  expect(applyShareConfig('smiles=CCO', config, VOCABULARY)).toBe(
    'smiles=CCO&embed=1&hide=editor,list&count=1',
  );
});

test('a draft is recognised as the preset writing the same link', () => {
  const draft = parseShareConfig(
    'embed=1&hide=list,editor&count=1',
    VOCABULARY,
  );

  expect(findSharePreset(draft, [FULL_SITE, FIGURE], VOCABULARY)).toBe(FIGURE);
});

test('a header part does not tell an embedded draft from its preset', () => {
  const draft = parseShareConfig(
    'embed=1&hide=tabs,editor,list&count=1',
    VOCABULARY,
  );

  expect(findSharePreset(draft, [FIGURE], VOCABULARY)).toBe(FIGURE);
});

test('a draft that differs by one part or one parameter is no preset', () => {
  const onePart = parseShareConfig('embed=1&hide=list&count=1', VOCABULARY);
  const oneParam = parseShareConfig('embed=1&hide=editor,list', VOCABULARY);

  expect(
    findSharePreset(onePart, [FIGURE, FULL_SITE], VOCABULARY),
  ).toBeUndefined();
  expect(
    findSharePreset(oneParam, [FIGURE, FULL_SITE], VOCABULARY),
  ).toBeUndefined();
});
