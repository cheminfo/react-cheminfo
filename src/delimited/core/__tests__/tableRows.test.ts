import { expect, test } from 'vitest';

import { columnsOf, tableRows } from '../tableRows.ts';

const PEAKS = [
  { mz: 180.0634, intensity: 100, assignment: 'A' },
  { mz: 181.0667, intensity: 1.08, assignment: 'A+1' },
];

test('the columns are the keys of the records, in the order declared', () => {
  expect(tableRows(PEAKS).header).toStrictEqual([
    'mz',
    'intensity',
    'assignment',
  ]);
});

test('every record becomes one array of cells', () => {
  expect(tableRows(PEAKS).rows).toStrictEqual([
    ['180.0634', '100', 'A'],
    ['181.0667', '1.08', 'A+1'],
  ]);
});

test('a column later records add is still written', () => {
  const records = [{ a: 1 }, { a: 2, b: 3 }];

  expect(tableRows(records)).toStrictEqual({
    header: ['a', 'b'],
    rows: [
      ['1', ''],
      ['2', '3'],
    ],
  });
});

test('the caller can pin the columns, and name one nobody carries', () => {
  expect(
    tableRows(PEAKS, { columns: ['assignment', 'mz', 'ppm'] }),
  ).toStrictEqual({
    header: ['assignment', 'mz', 'ppm'],
    rows: [
      ['A', '180.0634', ''],
      ['A+1', '181.0667', ''],
    ],
  });
});

test('null and undefined are written as nothing', () => {
  expect(
    tableRows([{ a: null, b: undefined, c: 0, d: false }]).rows,
  ).toStrictEqual([['', '', '0', 'false']]);
});

test('the caller can format a cell, and is told which column it is', () => {
  const { rows } = tableRows(PEAKS, {
    columns: ['mz'],
    format: (value, column) =>
      column === 'mz' ? (value as number).toFixed(2) : String(value),
  });

  expect(rows).toStrictEqual([['180.06'], ['181.07']]);
});

test('no records is no columns and no rows', () => {
  expect(tableRows([])).toStrictEqual({ header: [], rows: [] });
  expect(columnsOf([])).toStrictEqual([]);
});

test('an object left in a cell is written as JSON, never as [object Object]', () => {
  const { rows } = tableRows([{ range: { from: 1, to: 2 } }]);

  expect(rows).toStrictEqual([['{"from":1,"to":2}']]);
});
