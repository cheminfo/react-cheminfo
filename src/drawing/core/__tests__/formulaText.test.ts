import { expect, test } from 'vitest';

import { formulaParts } from '../formulaText.ts';
import { parseRichText, readRichText } from '../richText.ts';
import { writeRichText } from '../richTextWriter.ts';

test('a formula is drawn as mf-parser reads it, charges number first', () => {
  expect(formulaParts('Ca(2+)')).toStrictEqual([
    { text: 'Ca' },
    { text: '2+', script: 'sup' },
  ]);
  expect(formulaParts('SO4(2-)')).toStrictEqual([
    { text: 'SO' },
    { text: '4', script: 'sub' },
    { text: '2−', script: 'sup' },
  ]);
  expect(formulaParts('CH3COO(-)')).toStrictEqual([
    { text: 'CH' },
    { text: '3', script: 'sub' },
    { text: 'COO' },
    { text: '−', script: 'sup' },
  ]);
  expect(formulaParts('[13C]H4')).toStrictEqual([
    { text: '13', script: 'sup' },
    { text: 'CH' },
    { text: '4', script: 'sub' },
  ]);
});

test('the count of a hydrate stays on the baseline', () => {
  expect(formulaParts('CuSO4•5H2O')).toStrictEqual([
    { text: 'CuSO' },
    { text: '4', script: 'sub' },
    { text: '•' },
    { text: '5' },
    { text: 'H' },
    { text: '2', script: 'sub' },
    { text: 'O' },
  ]);
});

test('what mf-parser cannot read as a formula is no formula', () => {
  expect(formulaParts('compound')).toBeUndefined();
  // A lone charge would be read as electrons taken away.
  expect(formulaParts('(2+)')).toBeUndefined();
});

test('a formula group is read as the scripts mf-parser sets', () => {
  const text = 'Add **{{SO4(2-)}}**, {{oops}} {14pt:{{H2O}}}';
  const read = [
    [
      { text: 'Add ' },
      { text: 'SO', bold: true },
      { text: '4', script: 'sub', bold: true },
      { text: '2−', script: 'sup', bold: true },
      // A formula mf-parser cannot read is written as typed.
      { text: ', oops ' },
      { text: 'H', size: 14 },
      { text: '2', script: 'sub', size: 14 },
      { text: 'O', size: 14 },
    ],
  ];

  expect(parseRichText(text, true)).toStrictEqual(read);
  // The editor opens it as those scripts, and writes them back as marks.
  expect(readRichText(text)).toStrictEqual(read);
  expect(writeRichText(readRichText(text))).toBe(
    'Add **SO_4^{2−}**, oops {14pt:H_2O}',
  );
});

test('the chemical rules leave a formula to mf-parser', () => {
  // mf-parser reads Ca2+ as two calcium atoms and a charge; the rules would
  // raise the 2.
  expect(parseRichText('{{Ca2+}} Ca2+', true)).toStrictEqual([
    [
      { text: 'Ca' },
      { text: '2', script: 'sub' },
      { text: '+', script: 'sup' },
      { text: ' Ca' },
      { text: '2+', script: 'sup' },
    ],
  ]);
});

test('a formula group that holds a closing brace is read whole', () => {
  expect(readRichText(String.raw`{{C\}}}`)).toStrictEqual([[{ text: 'C}' }]]);
  // Never closed, the braces are text.
  expect(readRichText('{{H2O')).toStrictEqual([[{ text: '{{H2O' }]]);
});
