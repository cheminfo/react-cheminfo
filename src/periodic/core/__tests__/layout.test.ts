import { expect, test } from 'vitest';

import type { PeriodicElement } from '../elements.ts';
import { elementBySymbol } from '../elements.ts';
import {
  COLUMN_COUNT,
  INNER_TRANSITION_MARKERS,
  ROW_COUNT,
  cellOf,
  elementByArrowKey,
  placedElements,
} from '../layout.ts';

test('a main-block element sits at its group and period', () => {
  expect(cellOf(at('H'))).toStrictEqual({ column: 1, row: 1 });
  expect(cellOf(at('He'))).toStrictEqual({ column: 18, row: 1 });
  expect(cellOf(at('Fe'))).toStrictEqual({ column: 8, row: 4 });
  expect(cellOf(at('Og'))).toStrictEqual({ column: 18, row: 7 });
});

test('the two inner-transition series are drawn on rows 9 and 10, from column 3', () => {
  expect(cellOf(at('La'))).toStrictEqual({ column: 3, row: 9 });
  expect(cellOf(at('Lu'))).toStrictEqual({ column: 17, row: 9 });
  expect(cellOf(at('Ac'))).toStrictEqual({ column: 3, row: 10 });
  expect(cellOf(at('Lr'))).toStrictEqual({ column: 17, row: 10 });
});

test('every element lands inside the grid, and no two share a cell', () => {
  const taken = new Set<string>();
  for (const { cell } of placedElements()) {
    expect(cell.column).toBeGreaterThanOrEqual(1);
    expect(cell.column).toBeLessThanOrEqual(COLUMN_COUNT);
    expect(cell.row).toBeGreaterThanOrEqual(1);
    expect(cell.row).toBeLessThanOrEqual(ROW_COUNT);

    taken.add(`${String(cell.column)}:${String(cell.row)}`);
  }

  expect(taken.size).toBe(118);
});

test('row 8 is the gap the two series were lifted out into', () => {
  for (const { cell } of placedElements()) {
    expect(cell.row).not.toBe(8);
  }
});

test('the elements come back in reading order', () => {
  const placed = placedElements();

  expect(placed[0]?.element.symbol).toBe('H');
  expect(placed[1]?.element.symbol).toBe('He');
  expect(placed[2]?.element.symbol).toBe('Li');
  expect(placed.at(-1)?.element.symbol).toBe('Lr');
});

test('a marker stands in each cell the series were lifted from', () => {
  expect(INNER_TRANSITION_MARKERS).toStrictEqual([
    { cell: { column: 3, row: 6 }, label: '57–71', category: 'lanthanoid' },
    { cell: { column: 3, row: 7 }, label: '89–103', category: 'actinoid' },
  ]);
});

function at(symbol: string): PeriodicElement {
  const element = elementBySymbol(symbol);
  if (element === undefined) throw new Error(`no element ${symbol}`);
  return element;
}

test('up and down move by grid row, not by 18 protons', () => {
  // The trap: carbon plus 18 is chromium, but the cell under carbon is silicon.
  expect(elementByArrowKey('ArrowDown', 'C')?.symbol).toBe('Si');
  expect(elementByArrowKey('ArrowUp', 'Si')?.symbol).toBe('C');
  expect(elementByArrowKey('ArrowDown', 'Ba')?.symbol).toBe('Ra');
  expect(elementByArrowKey('ArrowUp', 'Na')?.symbol).toBe('Li');
  expect(elementByArrowKey('ArrowDown', 'Cl')?.symbol).toBe('Br');
});

test('the two inner-transition rows are walked like any other', () => {
  expect(elementByArrowKey('ArrowRight', 'Ce')?.symbol).toBe('Pr');
  expect(elementByArrowKey('ArrowDown', 'Ce')?.symbol).toBe('Th');
  expect(elementByArrowKey('ArrowUp', 'Th')?.symbol).toBe('Ce');
  // Right of barium is the lanthanoid marker, which is not an element, so the
  // reading order continues at hafnium.
  expect(elementByArrowKey('ArrowRight', 'Ba')?.symbol).toBe('Hf');
});

test('left and right follow reading order across the end of a period', () => {
  expect(elementByArrowKey('ArrowRight', 'C')?.symbol).toBe('N');
  expect(elementByArrowKey('ArrowLeft', 'C')?.symbol).toBe('B');
  expect(elementByArrowKey('ArrowRight', 'Ne')?.symbol).toBe('Na');
  expect(elementByArrowKey('ArrowLeft', 'Na')?.symbol).toBe('Ne');
  // The main block ends at oganesson; the f rows come after it.
  expect(elementByArrowKey('ArrowRight', 'Og')?.symbol).toBe('La');
});

test('the walk stops at each edge of the table rather than wrapping', () => {
  expect(elementByArrowKey('ArrowLeft', 'H')).toBeNull();
  expect(elementByArrowKey('ArrowUp', 'H')).toBeNull();
  expect(elementByArrowKey('ArrowRight', 'Lr')).toBeNull();
  expect(elementByArrowKey('ArrowDown', 'Lr')).toBeNull();
  // The blank row between the blocks is what stops period 7 falling into them.
  expect(elementByArrowKey('ArrowDown', 'Og')).toBeNull();
});

test('any arrow lands on hydrogen when nothing is selected yet', () => {
  expect(elementByArrowKey('ArrowRight', undefined)?.symbol).toBe('H');
  expect(elementByArrowKey('ArrowUp', 'Xx')?.symbol).toBe('H');
});

test('a key that is not an arrow moves nothing', () => {
  expect(elementByArrowKey('Enter', 'C')).toBeNull();
  expect(elementByArrowKey('Tab', 'C')).toBeNull();
  expect(elementByArrowKey('a', 'C')).toBeNull();
});
