import { expect, test } from 'vitest';

import { structureSource } from '../structureSource.ts';

import { BUTANE_V2000, EMPTY_V2000 } from './molfiles.ts';

const BUTANE = 'gC`@Dij@@';

test('the most exact notation is the one drawn', () => {
  expect(
    structureSource({
      idCode: BUTANE,
      molfile: BUTANE_V2000,
      smiles: 'CCCC',
    }),
  ).toStrictEqual({ kind: 'idcode', value: BUTANE });
  expect(
    structureSource({ molfile: BUTANE_V2000, smiles: 'CCCC' }),
  ).toStrictEqual({ kind: 'molfile', value: BUTANE_V2000 });
  expect(structureSource({ smiles: ' CCCC ' })).toStrictEqual({
    kind: 'smiles',
    value: 'CCCC',
  });
});

test('the coordinates travel with the idCode, however they arrived', () => {
  expect(structureSource({ idCode: `${BUTANE} !B@Fq?[@@S` })).toStrictEqual({
    kind: 'idcode',
    value: BUTANE,
    coordinates: '!B@Fq?[@@S',
  });
  expect(
    structureSource({ idCode: BUTANE, coordinates: '!B@Fq?[@@S' }),
  ).toStrictEqual({
    kind: 'idcode',
    value: BUTANE,
    coordinates: '!B@Fq?[@@S',
  });
  expect(structureSource({ idCode: BUTANE, coordinates: '' })).toStrictEqual({
    kind: 'idcode',
    value: BUTANE,
  });
});

test('a notation describing nothing is skipped rather than drawn', () => {
  expect(structureSource({ idCode: 'd@', smiles: 'CCCC' })).toStrictEqual({
    kind: 'smiles',
    value: 'CCCC',
  });
  expect(
    structureSource({ molfile: EMPTY_V2000, smiles: 'CCCC' }),
  ).toStrictEqual({ kind: 'smiles', value: 'CCCC' });
});

test('nothing at all is the empty source', () => {
  expect(structureSource({})).toStrictEqual({ kind: 'empty', value: '' });
  expect(
    structureSource({ idCode: 'd@', molfile: EMPTY_V2000, smiles: '  ' }),
  ).toStrictEqual({ kind: 'empty', value: '' });
});
