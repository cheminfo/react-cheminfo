/**
 * Where every element is drawn.
 *
 * The group and the period place the main block, but not the lanthanoids and
 * the actinoids: those have no group. An 18-column table draws them on the two
 * rows underneath; a 32-column one sets them back in periods 6 and 7, between
 * groups 2 and 3. The shape of each form is in `geometry.ts`.
 *
 * The cells here are the *logical* ones, so column 1 is group 1 and row 1 is
 * period 1. A table drawn with the group and period header strips offsets them
 * by one; nothing in this module needs to know that.
 */

import type { ElementBlock, PeriodicElement } from './elements.ts';
import { PERIODIC_ELEMENTS, elementBySymbol } from './elements.ts';
import type { Cell, TableColumns, TableGeometry } from './geometry.ts';
import { tableGeometry } from './geometry.ts';

export type {
  BlockLabel,
  Cell,
  GridBlock,
  InnerTransitionMarker,
  InnerTransitionRow,
  TableColumns,
  TableGeometry,
} from './geometry.ts';
export {
  BLOCK_LABELS,
  COLUMN_COUNT,
  EMPTY_BLOCK,
  INNER_TRANSITION_MARKERS,
  INNER_TRANSITION_ROWS,
  ROW_COUNT,
  tableGeometry,
} from './geometry.ts';

/**
 * A whole run of the table: one group, one period, or one block.
 *
 * Narrow on `kind` before reading `value`: a group or a period is numbered, a
 * block is lettered.
 */
export type ElementRange = NumberedRange | BlockRange;

/** One group or one period. */
export interface NumberedRange {
  /** Whether the run is a group or a period. */
  kind: 'group' | 'period';
  /** Its number: a group from 1 to 18, a period from 1 to 7. */
  value: number;
  /**
   * Whether the click asked for this run on top of what was already chosen —
   * Cmd on a Mac, Ctrl elsewhere — rather than in place of it. A reader
   * comparing two periods holds it down for the second one.
   */
  additive: boolean;
}

/** One block: the elements whose last electron enters the same subshell. */
export interface BlockRange {
  /** A block. */
  kind: 'block';
  /** Its letter. */
  value: ElementBlock;
  /** As for {@link NumberedRange.additive}. */
  additive: boolean;
}

/** One element, and what the click that picked it asked for. */
export interface ElementPick {
  /**
   * Whether the click asked for this element on top of what was already
   * chosen — Cmd on a Mac, Ctrl elsewhere — rather than in place of it. A tool
   * whose plain click already means something of its own — reading one element
   * into a card — tells the two apart by it, so one table both reads an
   * element and builds a set of them.
   */
  additive: boolean;
}

/** How many elements each inner-transition series holds. */
const INNER_TRANSITION_LENGTH = 15;

/** Atomic number the lanthanoids and the actinoids start at. */
const INNER_TRANSITION_STARTS = [57, 89] as const;

/**
 * The cell an element occupies.
 * @param element - Element to place.
 * @param columns - How many columns the table is drawn in.
 * @returns Its column and row, both one-based.
 * @default columns 18
 */
export function cellOf(
  element: PeriodicElement,
  columns: TableColumns = 18,
): Cell {
  const geometry = tableGeometry(columns);
  const inner = innerTransitionCell(element, geometry);
  if (inner !== null) return inner;
  const group = element.group ?? 1;
  return {
    column: geometry.groupColumns[group - 1] ?? group,
    row: element.period,
  };
}

/** An element and the cell it occupies. */
export interface PlacedElement {
  /** The element. */
  element: PeriodicElement;
  /** Its cell. */
  cell: Cell;
}

/**
 * Every element with the cell it occupies, in reading order.
 * @param columns - How many columns the table is drawn in.
 * @returns One entry per element, ordered by row then column, so a keyboard
 * walk over the list moves the way the eye does. In 32 columns that is the
 * order of the atomic numbers.
 * @default columns 18
 */
export function placedElements(
  columns: TableColumns = 18,
): readonly PlacedElement[] {
  let placed = placedCache.get(columns);
  if (placed === undefined) {
    placed = PERIODIC_ELEMENTS.map((element) => ({
      element,
      cell: cellOf(element, columns),
    })).toSorted((first, second) =>
      first.cell.row === second.cell.row
        ? first.cell.column - second.cell.column
        : first.cell.row - second.cell.row,
    );
    placedCache.set(columns, placed);
  }
  return placed;
}

const placedCache = new Map<TableColumns, readonly PlacedElement[]>();

/**
 * The element an arrow key walks to.
 *
 * The walk follows the grid, not the atomic number: down from carbon is
 * silicon, the cell underneath it, and a step of 18 protons would instead be
 * chromium because period 2 holds only eight elements. Left and right follow
 * reading order, so the end of a period continues at the start of the next one
 * and, in 18 columns, the two inner-transition rows come after the main block.
 * @param key - The pressed key, as `KeyboardEvent.key` reports it.
 * @param from - Symbol the walk starts at; any arrow lands on hydrogen when it names no element.
 * @param columns - How many columns the table is drawn in.
 * @returns The element to move to, or `null` when the key is not an arrow or the table has no cell that way.
 * @default columns 18
 */
export function elementByArrowKey(
  key: string,
  from: string | undefined,
  columns: TableColumns = 18,
): PeriodicElement | null {
  const direction = ARROW_DIRECTIONS[key];
  if (direction === undefined) return null;

  const placed = placedElements(columns);
  const start = from === undefined ? undefined : elementBySymbol(from);
  if (start === undefined) return placed[0]?.element ?? null;

  if (direction.column !== 0) {
    const index = readingOrderIndex(columns).get(start.symbol);
    if (index === undefined) return null;
    return placed[index + direction.column]?.element ?? null;
  }

  const cell = cellOf(start, columns);
  return (
    byCell(columns).get(cellKey(cell.column, cell.row + direction.row)) ?? null
  );
}

/** Which way each arrow key moves, in grid cells. */
const ARROW_DIRECTIONS: Record<string, { column: number; row: number }> = {
  ArrowRight: { column: 1, row: 0 },
  ArrowLeft: { column: -1, row: 0 },
  ArrowDown: { column: 0, row: 1 },
  ArrowUp: { column: 0, row: -1 },
};

function readingOrderIndex(columns: TableColumns): Map<string, number> {
  let index = readingOrderCache.get(columns);
  if (index === undefined) {
    index = new Map(
      placedElements(columns).map(({ element }, position) => [
        element.symbol,
        position,
      ]),
    );
    readingOrderCache.set(columns, index);
  }
  return index;
}

const readingOrderCache = new Map<TableColumns, Map<string, number>>();

function byCell(columns: TableColumns): Map<string, PeriodicElement> {
  let index = cellIndexCache.get(columns);
  if (index === undefined) {
    index = new Map(
      placedElements(columns).map(({ element, cell }) => [
        cellKey(cell.column, cell.row),
        element,
      ]),
    );
    cellIndexCache.set(columns, index);
  }
  return index;
}

const cellIndexCache = new Map<TableColumns, Map<string, PeriodicElement>>();

function cellKey(column: number, row: number): string {
  return `${String(column)}:${String(row)}`;
}

function innerTransitionCell(
  element: PeriodicElement,
  geometry: TableGeometry,
): Cell | null {
  for (const [index, start] of INNER_TRANSITION_STARTS.entries()) {
    const offset = element.atomicNumber - start;
    if (offset >= 0 && offset < INNER_TRANSITION_LENGTH) {
      return {
        column: geometry.innerTransitionColumn + offset,
        row: geometry.innerTransitionRow + index,
      };
    }
  }
  return null;
}
