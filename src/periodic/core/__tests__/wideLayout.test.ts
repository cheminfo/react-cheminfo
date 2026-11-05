import { expect, test } from 'vitest';

import type { PeriodicElement } from '../elements.ts';
import { PERIODIC_ELEMENTS, elementBySymbol } from '../elements.ts';
import { tableGeometry } from '../geometry.ts';
import { cellOf, elementByArrowKey, placedElements } from '../layout.ts';

const WIDE = tableGeometry(32);

test('the 18-column table is the default, and the 32-column one has no lifted rows', () => {
  expect(tableGeometry().columns).toBe(18);
  expect(tableGeometry().rows).toBe(10);
  expect(WIDE.columns).toBe(32);
  expect(WIDE.rows).toBe(7);
  expect(WIDE.markers).toStrictEqual([]);
  expect(WIDE.innerTransitionRows).toStrictEqual([]);
});

test('the f block is set in its periods, between groups 2 and 3', () => {
  expect(cellOf(at('Ba'), 32)).toStrictEqual({ column: 2, row: 6 });
  expect(cellOf(at('La'), 32)).toStrictEqual({ column: 3, row: 6 });
  expect(cellOf(at('Ce'), 32)).toStrictEqual({ column: 4, row: 6 });
  expect(cellOf(at('Yb'), 32)).toStrictEqual({ column: 16, row: 6 });
  expect(cellOf(at('Ac'), 32)).toStrictEqual({ column: 3, row: 7 });
  expect(cellOf(at('No'), 32)).toStrictEqual({ column: 16, row: 7 });
});

test('lutetium and lawrencium stand in group 3, under yttrium', () => {
  expect(cellOf(at('Sc'), 32)).toStrictEqual({ column: 17, row: 4 });
  expect(cellOf(at('Y'), 32)).toStrictEqual({ column: 17, row: 5 });
  expect(cellOf(at('Lu'), 32)).toStrictEqual({ column: 17, row: 6 });
  expect(cellOf(at('Lr'), 32)).toStrictEqual({ column: 17, row: 7 });
  expect(WIDE.groupColumns[2]).toBe(17);
});

test('the groups after the f block move right by its fourteen columns', () => {
  expect(cellOf(at('H'), 32)).toStrictEqual({ column: 1, row: 1 });
  expect(cellOf(at('He'), 32)).toStrictEqual({ column: 32, row: 1 });
  expect(cellOf(at('Fe'), 32)).toStrictEqual({ column: 22, row: 4 });
  expect(cellOf(at('Hf'), 32)).toStrictEqual({ column: 18, row: 6 });
  expect(cellOf(at('Og'), 32)).toStrictEqual({ column: 32, row: 7 });
  expect(WIDE.groupColumns).toHaveLength(18);
});

test('every element lands inside the 32-column grid, and no two share a cell', () => {
  const taken = new Set<string>();
  for (const { cell } of placedElements(32)) {
    expect(cell.column).toBeGreaterThanOrEqual(1);
    expect(cell.column).toBeLessThanOrEqual(32);
    expect(cell.row).toBeGreaterThanOrEqual(1);
    expect(cell.row).toBeLessThanOrEqual(7);

    taken.add(`${String(cell.column)}:${String(cell.row)}`);
  }

  expect(taken.size).toBe(PERIODIC_ELEMENTS.length);
});

test('in 32 columns the reading order is the order of the atomic numbers', () => {
  const placed = placedElements(32);

  for (const [index, { element }] of placed.entries()) {
    expect(element.atomicNumber).toBe(index + 1);
  }
});

test('each block label runs under the columns of its own elements', () => {
  for (const { element, cell } of placedElements(32)) {
    // Helium is an s element standing over the p block.
    if (element.symbol === 'He') continue;
    const label = WIDE.blockLabels.find(
      (candidate) =>
        cell.column >= candidate.cell.column &&
        cell.column < candidate.cell.column + candidate.columnSpan,
    );

    expect(label?.block).toBe(element.block);
  }
});

test('no element stands in the empty block of the 32-column table', () => {
  const { column, row, columnSpan, rowSpan } = WIDE.emptyBlock;

  expect(WIDE.emptyBlock).toStrictEqual({
    column: 3,
    row: 1,
    columnSpan: 24,
    rowSpan: 3,
  });

  for (const { cell } of placedElements(32)) {
    const inside =
      cell.column >= column &&
      cell.column < column + columnSpan &&
      cell.row >= row &&
      cell.row < row + rowSpan;

    expect(inside).toBe(false);
  }
});

test('the arrow keys walk the 32-column grid', () => {
  expect(elementByArrowKey('ArrowRight', 'Ba', 32)?.symbol).toBe('La');
  expect(elementByArrowKey('ArrowLeft', 'Hf', 32)?.symbol).toBe('Lu');
  expect(elementByArrowKey('ArrowDown', 'Y', 32)?.symbol).toBe('Lu');
  expect(elementByArrowKey('ArrowDown', 'Ce', 32)?.symbol).toBe('Th');
  expect(elementByArrowKey('ArrowDown', 'Fe', 32)?.symbol).toBe('Ru');
  // Nothing stands over the f block.
  expect(elementByArrowKey('ArrowUp', 'Ce', 32)).toBeNull();
  // Oganesson ends the table: there is no lifted row after it.
  expect(elementByArrowKey('ArrowRight', 'Og', 32)).toBeNull();
  expect(elementByArrowKey('ArrowDown', 'Og', 32)).toBeNull();
});

test('the two forms keep their own walk', () => {
  expect(elementByArrowKey('ArrowRight', 'Ba')?.symbol).toBe('Hf');
  expect(elementByArrowKey('ArrowRight', 'Ba', 32)?.symbol).toBe('La');
  expect(elementByArrowKey('ArrowRight', 'Ba')?.symbol).toBe('Hf');
});

function at(symbol: string): PeriodicElement {
  const element = elementBySymbol(symbol);
  if (element === undefined) throw new Error(`no element ${symbol}`);
  return element;
}
