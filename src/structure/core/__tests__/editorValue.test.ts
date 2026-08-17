import { expect, test } from 'vitest';

import {
  isEmptyIdCode,
  splitEditorValue,
  splitIdCode,
} from '../editorValue.ts';

import { BUTANE_V2000 } from './molfiles.ts';

/** Butane, as an editor hands it over with and without its coordinates. */
const BUTANE = 'gC`@Dij@@';
const DRAWN_BUTANE = 'gC`@Dij@@ !B@Fq?[@@S';

test('an empty value holds nothing at all', () => {
  expect(splitEditorValue('')).toStrictEqual({
    kind: 'empty',
    molfile: '',
    entries: [],
  });
  expect(splitEditorValue('  \n \n ')).toStrictEqual({
    kind: 'empty',
    molfile: '',
    entries: [],
  });
});

test('a molfile stays whole, its fixed-width header untouched', () => {
  expect(splitEditorValue(BUTANE_V2000)).toStrictEqual({
    kind: 'molfile',
    molfile: BUTANE_V2000,
    entries: [{ structure: BUTANE_V2000, label: '', line: 1 }],
  });
});

test('a list is cut one structure per line, blanks and comments dropped', () => {
  expect(splitEditorValue('CCO\n\n# an alkane\n  CCCC  \n')).toStrictEqual({
    kind: 'smiles',
    molfile: '',
    entries: [
      { structure: 'CCO', label: '', line: 1 },
      { structure: 'CCCC', label: '', line: 4 },
    ],
  });
});

test('a name written after the structure is kept beside it', () => {
  expect(
    splitEditorValue('OC(=O)c1ccccc1 benzoic acid\nCCO\tethanol'),
  ).toStrictEqual({
    kind: 'smiles',
    molfile: '',
    entries: [
      { structure: 'OC(=O)c1ccccc1', label: 'benzoic acid', line: 1 },
      { structure: 'CCO', label: 'ethanol', line: 2 },
    ],
  });
});

test('a value made only of comments holds nothing', () => {
  expect(splitEditorValue('# a heading\n# and nothing else\n')).toStrictEqual({
    kind: 'empty',
    molfile: '',
    entries: [],
  });
});

test('the coordinates are taken off the idCode', () => {
  expect(splitIdCode(DRAWN_BUTANE)).toStrictEqual({
    idCode: BUTANE,
    coordinates: '!B@Fq?[@@S',
  });
  expect(splitIdCode(` ${BUTANE} `)).toStrictEqual({ idCode: BUTANE });
  expect(splitIdCode(' '.repeat(3))).toStrictEqual({ idCode: '' });
});

test('an erased canvas is recognised whichever mode it was in', () => {
  expect(isEmptyIdCode('')).toBe(true);
  expect(isEmptyIdCode('d@')).toBe(true);
  expect(isEmptyIdCode('dH')).toBe(true);
  expect(isEmptyIdCode('d@ ')).toBe(true);
  expect(isEmptyIdCode(BUTANE)).toBe(false);
  expect(isEmptyIdCode(DRAWN_BUTANE)).toBe(false);
});
