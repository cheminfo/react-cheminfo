import { expect, test } from 'vitest';

import { fragmentQuery, sameFragmentQuery } from '../fragmentQuery.ts';

import { BUTANE_V2000 } from './molfiles.ts';

test('an erased canvas turns the filter off', () => {
  expect(fragmentQuery('d@')).toStrictEqual({
    kind: 'empty',
    value: '',
    isEmpty: true,
  });
  expect(fragmentQuery('dH')).toStrictEqual({
    kind: 'empty',
    value: '',
    isEmpty: true,
  });
  expect(fragmentQuery(' '.repeat(3))).toStrictEqual({
    kind: 'empty',
    value: '',
    isEmpty: true,
  });
});

test('a drawn query is read as the notation it is written in', () => {
  expect(fragmentQuery('  [CX3](=O)[OX2H1] ')).toStrictEqual({
    kind: 'smarts',
    value: '[CX3](=O)[OX2H1]',
    isEmpty: false,
  });
  expect(fragmentQuery('c1ccccc1')).toStrictEqual({
    kind: 'smiles',
    value: 'c1ccccc1',
    isEmpty: false,
  });
  expect(fragmentQuery(BUTANE_V2000)).toStrictEqual({
    kind: 'molfile',
    value: BUTANE_V2000,
    isEmpty: false,
  });
});

test('two values differing only by blanks are the same query', () => {
  expect(sameFragmentQuery('CCO', '  CCO\n')).toBe(true);
  expect(sameFragmentQuery('d@', '')).toBe(true);
  expect(sameFragmentQuery('CCO', 'CCC')).toBe(false);
  expect(sameFragmentQuery('CCO', 'd@')).toBe(false);
});
