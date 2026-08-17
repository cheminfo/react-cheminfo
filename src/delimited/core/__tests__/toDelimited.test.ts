import { expect, test } from 'vitest';

import { escapeCell, toDelimited } from '../toDelimited.ts';

test('a table is written tab separated, header first', () => {
  const text = toDelimited(
    [
      ['H2O', '18.015'],
      ['C2H6O', '46.069'],
    ],
    { header: ['formula', 'mass'] },
  );

  expect(text).toBe('formula\tmass\nH2O\t18.015\nC2H6O\t46.069');
});

test('a table with no header is only its rows', () => {
  expect(toDelimited([['a', 'b']])).toBe('a\tb');
});

test('a cell holding the separator is quoted', () => {
  expect(
    toDelimited([['acetic acid, glacial', '60']], { delimiter: ',' }),
  ).toBe('"acetic acid, glacial",60');
});

test('a cell holding a quote has its quotes doubled', () => {
  expect(toDelimited([['the "cold" method']], { delimiter: ',' })).toBe(
    '"the ""cold"" method"',
  );
});

test('a cell holding a newline is quoted, so the row survives the round trip', () => {
  expect(toDelimited([['first line\nsecond line', 'x']])).toBe(
    '"first line\nsecond line"\tx',
  );
});

test('a tab inside a cell is quoted in a tab separated file', () => {
  expect(toDelimited([['a\tb']])).toBe('"a\tb"');
});

test('a comma is left alone in a tab separated file', () => {
  expect(toDelimited([['acetic acid, glacial']])).toBe('acetic acid, glacial');
});

test('a carriage return is quoted too', () => {
  expect(escapeCell('a\rb', '\t')).toBe('"a\rb"');
});

test('a missing cell is written as an empty one', () => {
  const rows = [['a', 'b'], ['c']];

  expect(toDelimited(rows)).toBe('a\tb\nc');
});

test('an empty table is empty text', () => {
  expect(toDelimited([])).toBe('');
  expect(toDelimited([], { header: ['a', 'b'] })).toBe('a\tb');
});

test('a caller may ask for windows line endings', () => {
  expect(toDelimited([['a'], ['b']], { newline: '\r\n' })).toBe('a\r\nb');
});

test('a header cell is escaped like any other', () => {
  expect(toDelimited([], { header: ['mass, g/mol'], delimiter: ',' })).toBe(
    '"mass, g/mol"',
  );
});
