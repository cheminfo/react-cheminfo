/**
 * Where every element is drawn.
 *
 * The group and the period place the main block, but not the lanthanoids and
 * the actinoids: those have no group, and are drawn on the two rows underneath.
 * The grid is therefore 18 columns by 10 rows — seven periods, a blank spacer,
 * and the two inner-transition rows.
 *
 * The cells here are the *logical* ones, so column 1 is group 1 and row 1 is
 * period 1. A table drawn with the group and period header strips offsets them
 * by one; nothing in this module needs to know that.
 */

import type { ElementCategory, PeriodicElement } from './elements.ts';
import { PERIODIC_ELEMENTS, elementBySymbol } from './elements.ts';

/** A whole run of the table: one group, or one period. */
export interface ElementRange {
  kind: 'group' | 'period';
  value: number;
}

/** A cell of the grid, one-based as CSS grid lines are. */
export interface Cell {
  column: number;
  row: number;
}

/** Columns of the table. */
export const COLUMN_COUNT = 18;

/** Rows of the table, the blank spacer between the blocks included. */
export const ROW_COUNT = 10;

/** Row the lanthanoids are drawn on, and the actinoids on the one below. */
const INNER_TRANSITION_ROW = 9;

/** Atomic number the lanthanoids and the actinoids start at. */
const INNER_TRANSITION_STARTS = [57, 89] as const;

/** How many elements each inner-transition series holds. */
const INNER_TRANSITION_LENGTH = 15;

/** Column the inner-transition rows start at, under the d block. */
const INNER_TRANSITION_COLUMN = 3;

/**
 * The cell an element occupies.
 * @param element - Element to place.
 * @returns Its column and row, both one-based.
 */
export function cellOf(element: PeriodicElement): Cell {
  const inner = innerTransitionCell(element);
  if (inner !== null) return inner;
  return { column: element.group ?? 1, row: element.period };
}

/**
 * Every element with the cell it occupies, in reading order.
 * @returns One entry per element, ordered by row then column, so a keyboard
 * walk over the list moves the way the eye does.
 */
export function placedElements(): ReadonlyArray<{
  element: PeriodicElement;
  cell: Cell;
}> {
  PLACED ??= PERIODIC_ELEMENTS.map((element) => ({
    element,
    cell: cellOf(element),
  })).toSorted((first, second) =>
    first.cell.row === second.cell.row
      ? first.cell.column - second.cell.column
      : first.cell.row - second.cell.row,
  );
  return PLACED;
}

let PLACED: ReadonlyArray<{ element: PeriodicElement; cell: Cell }> | null =
  null;

/**
 * The two cells the lanthanoids and the actinoids were lifted out of.
 *
 * Without them the main block has a hole in it and the two rows underneath
 * belong nowhere; with them the reader can see where each series was taken
 * from.
 */
export const INNER_TRANSITION_MARKERS: ReadonlyArray<{
  cell: Cell;
  label: string;
  category: ElementCategory;
}> = [
  { cell: { column: 3, row: 6 }, label: '57–71', category: 'lanthanoid' },
  { cell: { column: 3, row: 7 }, label: '89–103', category: 'actinoid' },
];

/** The period each inner-transition row belongs to, for its row label. */
export const INNER_TRANSITION_ROWS: ReadonlyArray<{
  row: number;
  period: number;
}> = [
  { row: INNER_TRANSITION_ROW, period: 6 },
  { row: INNER_TRANSITION_ROW + 1, period: 7 },
];

/**
 * The element an arrow key walks to.
 *
 * The walk follows the grid, not the atomic number: down from carbon is
 * silicon, the cell underneath it, and a step of 18 protons would instead be
 * chromium because period 2 holds only eight elements. Left and right follow
 * reading order, so the end of a period continues at the start of the next one
 * and the two inner-transition rows come after the main block.
 * @param key - The pressed key, as `KeyboardEvent.key` reports it.
 * @param from - Symbol the walk starts at; any arrow lands on hydrogen when it names no element.
 * @returns The element to move to, or `null` when the key is not an arrow or the table has no cell that way.
 */
export function elementByArrowKey(
  key: string,
  from: string | undefined,
): PeriodicElement | null {
  const direction = ARROW_DIRECTIONS[key];
  if (direction === undefined) return null;

  const placed = placedElements();
  const start = from === undefined ? undefined : elementBySymbol(from);
  if (start === undefined) return placed[0]?.element ?? null;

  if (direction.column !== 0) {
    const index = readingOrderIndex().get(start.symbol);
    if (index === undefined) return null;
    return placed[index + direction.column]?.element ?? null;
  }

  const cell = cellOf(start);
  return byCell().get(cellKey(cell.column, cell.row + direction.row)) ?? null;
}

/** Which way each arrow key moves, in grid cells. */
const ARROW_DIRECTIONS: Record<string, { column: number; row: number }> = {
  ArrowRight: { column: 1, row: 0 },
  ArrowLeft: { column: -1, row: 0 },
  ArrowDown: { column: 0, row: 1 },
  ArrowUp: { column: 0, row: -1 },
};

function readingOrderIndex(): Map<string, number> {
  READING_ORDER ??= new Map(
    placedElements().map(({ element }, index) => [element.symbol, index]),
  );
  return READING_ORDER;
}

let READING_ORDER: Map<string, number> | null = null;

function byCell(): Map<string, PeriodicElement> {
  BY_CELL ??= new Map(
    placedElements().map(({ element, cell }) => [
      cellKey(cell.column, cell.row),
      element,
    ]),
  );
  return BY_CELL;
}

let BY_CELL: Map<string, PeriodicElement> | null = null;

function cellKey(column: number, row: number): string {
  return `${String(column)}:${String(row)}`;
}

function innerTransitionCell(element: PeriodicElement): Cell | null {
  for (const [index, start] of INNER_TRANSITION_STARTS.entries()) {
    const offset = element.atomicNumber - start;
    if (offset >= 0 && offset < INNER_TRANSITION_LENGTH) {
      return {
        column: INNER_TRANSITION_COLUMN + offset,
        row: INNER_TRANSITION_ROW + index,
      };
    }
  }
  return null;
}
