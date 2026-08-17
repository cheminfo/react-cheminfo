import { expect, test } from 'vitest';

import { looksLikeSmarts, readStructure } from '../readStructure.ts';

import { BUTANE_V2000 } from './molfiles.ts';

test('nothing typed is neither a structure nor a mistake', () => {
  expect(readStructure('')).toStrictEqual({ kind: 'empty', value: '' });
  expect(readStructure('   \n\t ')).toStrictEqual({ kind: 'empty', value: '' });
});

test('a line notation is trimmed, a molfile is handed over untouched', () => {
  expect(readStructure('  CCCC \n')).toStrictEqual({
    kind: 'smiles',
    value: 'CCCC',
  });
  expect(readStructure(BUTANE_V2000)).toStrictEqual({
    kind: 'molfile',
    value: BUTANE_V2000,
  });
});

test('query syntax makes a line notation a SMARTS', () => {
  expect(readStructure('[CX3](=O)[OX2H1]')).toStrictEqual({
    kind: 'smarts',
    value: '[CX3](=O)[OX2H1]',
  });
  expect(readStructure('c1ccccc1')).toStrictEqual({
    kind: 'smiles',
    value: 'c1ccccc1',
  });
});

test('the SMARTS-only primitives are recognised', () => {
  expect(looksLikeSmarts('C~C')).toBe(true);
  expect(looksLikeSmarts('[C,N]')).toBe(true);
  expect(looksLikeSmarts('[!C]')).toBe(true);
  expect(looksLikeSmarts('[C&H1]')).toBe(true);
  expect(looksLikeSmarts('[C;H1]')).toBe(true);
  expect(looksLikeSmarts('[$(CC)]')).toBe(true);
  expect(looksLikeSmarts('[#6]')).toBe(true);
  expect(looksLikeSmarts('[CX4]')).toBe(true);
  expect(looksLikeSmarts('[CD2]')).toBe(true);
  expect(looksLikeSmarts('[CR1]')).toBe(true);
  expect(looksLikeSmarts('[Cr5]')).toBe(true);
  expect(looksLikeSmarts('[Cv4]')).toBe(true);
  expect(looksLikeSmarts('[Ch1]')).toBe(true);
  expect(looksLikeSmarts('[Cx2]')).toBe(true);
  expect(looksLikeSmarts('[*]')).toBe(true);
  expect(looksLikeSmarts('[a]')).toBe(true);
  expect(looksLikeSmarts('Ca')).toBe(false);
});

test('an element whose symbol holds a query letter stays an element', () => {
  expect(looksLikeSmarts('[Na+]')).toBe(false);
  expect(looksLikeSmarts('[Xe]')).toBe(false);
  expect(looksLikeSmarts('[Rn]')).toBe(false);
  expect(looksLikeSmarts('[13CH4]')).toBe(false);
  expect(looksLikeSmarts('CCCC')).toBe(false);
});

test('a word holding an a is not a wildcard', () => {
  expect(looksLikeSmarts('CAS')).toBe(false);
  expect(looksLikeSmarts('name')).toBe(false);
  expect(looksLikeSmarts('C-A-C')).toBe(true);
});
