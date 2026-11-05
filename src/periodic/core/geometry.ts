/**
 * The shape of the table, in its two forms.
 *
 * Eighteen columns is the table as IUPAC prints it: the lanthanoids and the
 * actinoids lifted out of periods 6 and 7 onto two rows underneath, so the
 * main block fits a page. The grid is then 18 columns by 10 rows — seven
 * periods, a blank spacer, and the two inner-transition rows.
 *
 * Thirty-two columns sets the two series back in their periods, between groups
 * 2 and 3, so every period reads in atomic-number order and the f block stands
 * where its electrons are filled. The grid is 32 columns by 7 rows, and a cell
 * of the same height makes it almost twice as wide. Lutetium and lawrencium
 * close the d block in group 3, as their `block` says, so they stand under
 * yttrium and the f block is fourteen wide.
 *
 * Cells are *logical*: column 1 is group 1 and row 1 is period 1. A table drawn
 * with the group and period header strips offsets them by one; nothing in this
 * module needs to know that.
 */

import type { ElementBlock, ElementCategory } from './elements.ts';

/** How many columns the table is drawn in. */
export type TableColumns = 18 | 32;

/** A cell of the grid, one-based as CSS grid lines are. */
export interface Cell {
  /** Grid column, one-based. */
  column: number;
  /** Grid row, one-based. */
  row: number;
}

/** A rectangle of cells. */
export interface GridBlock {
  /** Leftmost column of the block, one-based. */
  column: number;
  /** Topmost row of the block, one-based. */
  row: number;
  /** How many columns it spans. */
  columnSpan: number;
  /** How many rows it spans. */
  rowSpan: number;
}

/** The cell an inner-transition series was lifted out of, and what it reads. */
export interface InnerTransitionMarker {
  /** The cell in the main block. */
  cell: Cell;
  /** The atomic numbers of the series, e.g. `57–71`. */
  label: string;
  /** The family of the series. */
  category: ElementCategory;
}

/** Where one block is named, in cells no element occupies. */
export interface BlockLabel {
  /** The block. */
  block: ElementBlock;
  /** The first cell of the label. */
  cell: Cell;
  /** How many columns the label runs along. */
  columnSpan: number;
  /** How many rows it runs down; more than one stands it on its side. */
  rowSpan: number;
}

/** A row of the grid that is not a period, and the period it belongs to. */
export interface InnerTransitionRow {
  /** Row of the grid. */
  row: number;
  /** Period its elements belong to, for its row label. */
  period: number;
}

/** Everything that differs between the two forms of the table. */
export interface TableGeometry {
  /** How many columns the table is drawn in. */
  columns: TableColumns;
  /** Rows of the grid, the blank spacer between the blocks included. */
  rows: number;
  /** The column each group stands in, group 1 first. */
  groupColumns: readonly number[];
  /** Row lanthanum is drawn on; actinium is drawn on the next one. */
  innerTransitionRow: number;
  /** Column lanthanum and actinium are drawn in; each series runs right. */
  innerTransitionColumn: number;
  /**
   * The block of cells the table leaves empty, where no element belongs, in
   * the middle of its top edge: the one place a tool can write without
   * covering an element.
   */
  emptyBlock: GridBlock;
  /** The cells the two series were lifted out of; none when nothing was. */
  markers: readonly InnerTransitionMarker[];
  /** The rows that hold the two series; none when they are in their periods. */
  innerTransitionRows: readonly InnerTransitionRow[];
  /**
   * Where each block is named. The labels follow the columns, and an element
   * its electrons: helium is an s element standing over the p block.
   */
  blockLabels: readonly BlockLabel[];
}

/** Columns of the 18-column table. */
export const COLUMN_COUNT = 18;

/** Rows of the 18-column table, the blank spacer between the blocks included. */
export const ROW_COUNT = 10;

/**
 * The block of cells the 18-column table leaves empty: columns 3 to 12 of the
 * first three periods.
 *
 * It is a tenth of the drawing, in the middle of the top edge, and the one
 * place a tool can write without covering an element — which is why a table
 * printed on a wall puts its title or its key there.
 */
export const EMPTY_BLOCK: GridBlock = {
  column: 3,
  row: 1,
  columnSpan: 10,
  rowSpan: 3,
};

/**
 * The two cells of the 18-column table the lanthanoids and the actinoids were
 * lifted out of.
 *
 * Without them the main block has a hole in it and the two rows underneath
 * belong nowhere; with them the reader can see where each series was taken
 * from.
 */
export const INNER_TRANSITION_MARKERS: readonly InnerTransitionMarker[] = [
  { cell: { column: 3, row: 6 }, label: '57–71', category: 'lanthanoid' },
  { cell: { column: 3, row: 7 }, label: '89–103', category: 'actinoid' },
];

/**
 * Where each block of the 18-column table is named: s, d and p along the
 * spacer under period 7, each under the columns it holds, and f in the two
 * cells left of the inner-transition rows.
 */
export const BLOCK_LABELS: readonly BlockLabel[] = [
  { block: 's', cell: { column: 1, row: 8 }, columnSpan: 2, rowSpan: 1 },
  { block: 'd', cell: { column: 3, row: 8 }, columnSpan: 10, rowSpan: 1 },
  { block: 'p', cell: { column: 13, row: 8 }, columnSpan: 6, rowSpan: 1 },
  { block: 'f', cell: { column: 1, row: 9 }, columnSpan: 2, rowSpan: 2 },
];

/** The period each inner-transition row of the 18-column table belongs to. */
export const INNER_TRANSITION_ROWS: readonly InnerTransitionRow[] = [
  { row: 9, period: 6 },
  { row: 10, period: 7 },
];

/** How many groups the table has, whatever its width. */
const GROUP_COUNT = 18;

/** How many columns the f block adds to a 32-column table. */
const F_BLOCK_WIDTH = 14;

const STANDARD: TableGeometry = {
  columns: 18,
  rows: ROW_COUNT,
  groupColumns: groupColumns(0),
  innerTransitionRow: 9,
  innerTransitionColumn: 3,
  emptyBlock: EMPTY_BLOCK,
  markers: INNER_TRANSITION_MARKERS,
  innerTransitionRows: INNER_TRANSITION_ROWS,
  blockLabels: BLOCK_LABELS,
};

// The block labels stand on an eighth row, under period 7, which the grid only
// draws when it names the blocks.
const WIDE: TableGeometry = {
  columns: 32,
  rows: 7,
  groupColumns: groupColumns(F_BLOCK_WIDTH),
  innerTransitionRow: 6,
  innerTransitionColumn: 3,
  emptyBlock: { column: 3, row: 1, columnSpan: 24, rowSpan: 3 },
  markers: [],
  innerTransitionRows: [],
  blockLabels: [
    { block: 's', cell: { column: 1, row: 8 }, columnSpan: 2, rowSpan: 1 },
    { block: 'f', cell: { column: 3, row: 8 }, columnSpan: 14, rowSpan: 1 },
    { block: 'd', cell: { column: 17, row: 8 }, columnSpan: 10, rowSpan: 1 },
    { block: 'p', cell: { column: 27, row: 8 }, columnSpan: 6, rowSpan: 1 },
  ],
};

/**
 * The shape of the table in one of its two forms.
 * @param columns - How many columns the table is drawn in.
 * @returns Where its groups, its series, its empty block and its block labels
 * stand.
 * @default columns 18
 */
export function tableGeometry(columns: TableColumns = 18): TableGeometry {
  return columns === 32 ? WIDE : STANDARD;
}

function groupColumns(fBlockWidth: number): number[] {
  const columns: number[] = [];
  for (let group = 1; group <= GROUP_COUNT; group++) {
    columns.push(group <= 2 ? group : group + fBlockWidth);
  }
  return columns;
}
