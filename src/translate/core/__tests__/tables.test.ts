import { expect, test } from 'vitest';

import type { TranslatableTable } from '../tables.ts';
import { tableCells, tableKey } from '../tables.ts';

const ELEMENTS: TranslatableTable = {
  id: 'element',
  label: 'Elements',
  catalogId: 'periodic-table.cheminfo.org',
  fields: [
    { id: 'name', label: 'Name', required: true },
    { id: 'origin', label: 'Where the name comes from', size: 'paragraph' },
  ],
  rows: [
    { id: 'H', label: '1 · H' },
    { id: 'He', label: '2 · He' },
  ],
};

test('a cell is kept under table, row and field', () => {
  expect(tableKey(ELEMENTS, 'Fe', 'name')).toBe('element.Fe.name');
});

test('the grid is every row against every translated column', () => {
  expect(tableCells(ELEMENTS).map((cell) => cell.key)).toStrictEqual([
    'element.H.name',
    'element.H.origin',
    'element.He.name',
    'element.He.origin',
  ]);
});

test('a cell carries the row and the column it belongs to', () => {
  const cells = tableCells(ELEMENTS);

  expect(cells[1]?.row.label).toBe('1 · H');
  expect(cells[1]?.field.label).toBe('Where the name comes from');
  expect(cells[1]?.field.size).toBe('paragraph');
});

test('a table with no translated column has no cells at all', () => {
  expect(tableCells({ ...ELEMENTS, fields: [] })).toStrictEqual([]);
});
