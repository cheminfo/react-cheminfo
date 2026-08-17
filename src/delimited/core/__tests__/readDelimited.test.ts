import { expect, test } from 'vitest';

import { detectDelimiter, readDelimited } from '../readDelimited.ts';
import { toDelimited } from '../toDelimited.ts';

test('a tab separated table comes back as its rows', () => {
  expect(readDelimited('formula\tmass\nH2O\t18.015')).toStrictEqual([
    ['formula', 'mass'],
    ['H2O', '18.015'],
  ]);
});

test('the separator is guessed when the caller does not name it', () => {
  expect(detectDelimiter('a,b,c\n1,2,3')).toBe(',');
  expect(detectDelimiter('a;b;c\n1;2;3')).toBe(';');
  expect(detectDelimiter('a\tb\tc')).toBe('\t');
});

test('a single column with no separator at all reads as one cell per row', () => {
  expect(detectDelimiter('7.1\n7.2')).toBe('\t');
  expect(readDelimited('7.1\n7.2')).toStrictEqual([['7.1'], ['7.2']]);
});

test('a comma inside a quoted cell does not win the guess', () => {
  const text =
    'name\tmass\n"acetic acid, glacial"\t60\n"formic acid, pure"\t46';

  expect(detectDelimiter(text)).toBe('\t');
  expect(readDelimited(text)).toStrictEqual([
    ['name', 'mass'],
    ['acetic acid, glacial', '60'],
    ['formic acid, pure', '46'],
  ]);
});

test('a doubled quote inside a quoted cell reads as one quote', () => {
  expect(
    readDelimited('"the ""cold"" method",60', { delimiter: ',' }),
  ).toStrictEqual([['the "cold" method', '60']]);
});

test('a newline inside a quoted cell stays inside it', () => {
  expect(readDelimited('"first\nsecond"\tx')).toStrictEqual([
    ['first\nsecond', 'x'],
  ]);
});

test('windows line endings end a line without leaving a carriage return', () => {
  expect(readDelimited('a\tb\r\nc\td\r\n')).toStrictEqual([
    ['a', 'b'],
    ['c', 'd'],
  ]);
});

test('a byte-order mark does not end up in the first cell', () => {
  expect(readDelimited('﻿a\tb')).toStrictEqual([['a', 'b']]);
});

test('a blank line, the trailing one included, is skipped', () => {
  expect(readDelimited('a\tb\n\nc\td\n')).toStrictEqual([
    ['a', 'b'],
    ['c', 'd'],
  ]);
});

test('empty text holds no rows', () => {
  expect(readDelimited('')).toStrictEqual([]);
  expect(readDelimited('\n')).toStrictEqual([]);
});

test('an empty cell is kept, wherever it sits in the row', () => {
  expect(readDelimited('a\t\tc')).toStrictEqual([['a', '', 'c']]);
  expect(readDelimited('a\tb\t')).toStrictEqual([['a', 'b', '']]);
});

test('what was written is what is read back, escaping and all', () => {
  const rows = [
    ['acetic acid, glacial', 'a "quoted" name', 'two\nlines'],
    ['', 'x\ty', 'plain'],
  ];

  for (const delimiter of ['\t', ',', ';']) {
    const text = toDelimited(rows, { delimiter, header: ['a', 'b', 'c'] });

    expect(readDelimited(text, { delimiter })).toStrictEqual([
      ['a', 'b', 'c'],
      ...rows,
    ]);
  }
});
