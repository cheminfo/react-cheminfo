import { expect, test } from 'vitest';

import { delimiterChoice } from '../delimiters.ts';
import { formatCell, rowsToDelimited } from '../rowsToDelimited.ts';

const ENTRIES = [
  { formula: 'H2O', mass: 18.015, hazardous: false },
  { formula: 'C2H6O', mass: 46.069, hazardous: true },
];

test('the named columns are written, in the order they are named', () => {
  expect(rowsToDelimited(ENTRIES, ['formula', 'mass'])).toBe(
    'formula\tmass\nH2O\t18.015\nC2H6O\t46.069',
  );
});

test('a column may be called something other than its property', () => {
  expect(
    rowsToDelimited(ENTRIES, [
      { key: 'formula', label: 'molecular formula' },
      { key: 'mass', label: 'mass/(g/mol)' },
    ]),
  ).toBe('molecular formula\tmass/(g/mol)\nH2O\t18.015\nC2H6O\t46.069');
});

test('a column may say how its values are written', () => {
  expect(
    rowsToDelimited(ENTRIES, [
      'formula',
      { key: 'mass', format: (value) => (value as number).toFixed(1) },
    ]),
  ).toBe('formula\tmass\nH2O\t18.0\nC2H6O\t46.1');
});

test('a field the row does not carry is an empty cell, not a shifted column', () => {
  expect(
    rowsToDelimited([{ formula: 'H2O' }], ['formula', 'mass', 'source']),
  ).toBe('formula\tmass\tsource\nH2O\t\t');
});

test('a field the columns do not name is left out', () => {
  expect(rowsToDelimited(ENTRIES, ['formula'])).toBe('formula\nH2O\nC2H6O');
});

test('the header can be left out, and the separator chosen', () => {
  expect(
    rowsToDelimited(ENTRIES, ['formula', 'mass'], {
      header: false,
      delimiter: delimiterChoice('semicolon').delimiter,
    }),
  ).toBe('H2O;18.015\nC2H6O;46.069');
});

test('a value holding the separator is quoted here too', () => {
  expect(
    rowsToDelimited([{ name: 'acetic acid, glacial' }], ['name'], {
      delimiter: ',',
    }),
  ).toBe('name\n"acetic acid, glacial"');
});

test('nothing at all is an empty cell, and a boolean is spelled out', () => {
  expect(formatCell(undefined)).toBe('');
  expect(formatCell(null)).toBe('');
  expect(formatCell(Number.NaN)).toBe('');
  expect(formatCell(Number.POSITIVE_INFINITY)).toBe('');
  expect(formatCell(false)).toBe('false');
  expect(formatCell(0)).toBe('0');
  expect(formatCell('')).toBe('');
});

test('a date is written in its ISO form and a list joined with semicolons', () => {
  expect(formatCell(new Date('2026-08-17T09:00:00.000Z'))).toBe(
    '2026-08-17T09:00:00.000Z',
  );
  expect(formatCell(['water', 'aqua', 'oxidane'])).toBe('water; aqua; oxidane');
});

test('no rows still writes the header a spreadsheet needs', () => {
  expect(rowsToDelimited([], ['formula', 'mass'])).toBe('formula\tmass');
});

test('an unknown separator name falls back to the tab', () => {
  expect(delimiterChoice('pipe').delimiter).toBe('\t');
  expect(delimiterChoice(undefined).id).toBe('tab');
  expect(delimiterChoice('comma').extension).toBe('csv');
});
