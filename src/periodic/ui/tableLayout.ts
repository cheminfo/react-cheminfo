/**
 * How the table is laid out: the box it measures, the grid its cells sit on,
 * and the block a caller may write in.
 */

import type { CSSProperties } from 'react';

import type {
  GridBlock,
  TableColumns,
  TableGeometry,
} from '../core/geometry.ts';
import { EMPTY_BLOCK } from '../core/geometry.ts';

import { ROW_SHARE } from './cellType.ts';
import { UNIT_PROPERTY, fallbackUnit, ofWidth } from './unit.ts';

/**
 * Where what the caller writes in the empty block is placed.
 * @param offset - 1 when the table draws its header strips, 0 otherwise.
 * @param block - The empty block of the table being drawn.
 * @returns The style of the slot.
 * @default block the empty block of the 18-column table
 */
export function insetStyle(
  offset: number,
  block: GridBlock = EMPTY_BLOCK,
): CSSProperties {
  return {
    alignItems: 'center',
    display: 'flex',
    // A column of air on each side, so the writing reads as sitting in the
    // block rather than as running into the cells beside it.
    padding: `0 ${ofWidth(2.4)}`,
    gridColumn: `${String(block.column + offset)} / span ${String(block.columnSpan)}`,
    gridRow: `${String(block.row + offset)} / span ${String(block.rowSpan)}`,
    // A share of the table, with a floor, exactly as a cell sizes its symbol:
    // the block holds the same three rows at every width, so what is written
    // in it has to shrink with them.
    fontSize: `max(0.6rem, ${ofWidth(1.8)})`,
    lineHeight: 1.35,
    minWidth: 0,
    overflow: 'hidden',
  };
}

/**
 * Narrowest an 18-column table is ever drawn; under it the type stops being
 * readable.
 */
const MIN_WIDTH = 280;

/**
 * Narrowest a table is ever drawn: as narrow as its columns are at the 18-column
 * table's floor, so a 32-column one scrolls in a narrow box rather than writing
 * its symbols in cells too small to read.
 * @param columns - How many columns the table is drawn in.
 * @returns A width, in CSS pixels: 280 for 18 columns, 498 for 32.
 * @default columns 18
 */
export function periodicTableMinWidth(columns: TableColumns = 18): number {
  return Math.round((MIN_WIDTH * columns) / 18);
}

/**
 * How tall one row of elements is, as a share of the table's width.
 *
 * A column is about 5.2% of that width, so a cell is a third taller than it is
 * wide — the proportion of a wall chart, and the room the three bands of a
 * cell need to be read from the back of a room. It is the same height in every
 * table: a cell keeps the band it writes a value in whether or not that table
 * writes one.
 */
const ROW_HEIGHT = ofWidth(ROW_SHARE);

/** The band the two inner-transition series were lifted out across. */
const SERIES_GAP = `max(6px, ${ofWidth(1.1)})`;

/** The height of a header strip, and of the gap once it carries block labels. */
const STRIP_HEIGHT = `max(12px, ${ofWidth(2)})`;

export const rootStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  minWidth: MIN_WIDTH,
  // Everything inside — the height of a row as much as the type in a cell — is
  // a share of this box rather than of the page, so the same table reads at
  // 280px beside a chart and fills a lecture-hall screen at twice that. The
  // share is measured (see `unit.ts`); the container is what the `1cqw`
  // fallback and a site's own `@container` rules are answered by, and it keeps
  // this box's width independent of what is written inside it.
  containerType: 'inline-size',
} as const satisfies CSSProperties;

/**
 * The outermost box of a table of the given form.
 * @param geometry - The form of the table.
 * @returns The root style at the narrowest that form is drawn, carrying the
 * unit it falls back to before it is measured when that is not `1cqw`.
 */
export function rootStyleFor(geometry: TableGeometry): CSSProperties {
  const style: CSSProperties & Record<string, string | number> = {
    ...rootStyle,
    minWidth: periodicTableMinWidth(geometry.columns),
  };
  const fallback = fallbackUnit(geometry.columns);
  if (fallback !== undefined) style[UNIT_PROPERTY] = fallback;
  return style;
}

const baseGridStyle = {
  display: 'grid',
  gap: 2,
  minWidth: MIN_WIDTH,
  width: '100%',
} as const satisfies CSSProperties;

/**
 * The grid the cells are placed on.
 * @param headers - Whether a leading column and row hold the period and group
 * numbers.
 * @param blocks - Whether the row under period 7 names the blocks, which needs
 * it as tall as a header strip.
 * @param geometry - The form of the table: its columns, and whether it has the
 * two inner-transition rows.
 * @returns The style of the grid.
 * @default blocks false
 * @default geometry the 18-column table
 */
export function gridStyle(
  headers: boolean,
  blocks = false,
  geometry?: TableGeometry,
): CSSProperties {
  const columns = geometry?.columns ?? 18;
  const rows = gridRows(
    blocks,
    (geometry?.innerTransitionRows.length ?? 2) > 0,
  );
  const base = { ...baseGridStyle, minWidth: periodicTableMinWidth(columns) };
  const cells = `repeat(${String(columns)}, minmax(0, 1fr))`;
  if (!headers) {
    return { ...base, gridTemplateColumns: cells, gridTemplateRows: rows };
  }
  return {
    ...base,
    gridTemplateColumns: `max(14px, ${ofWidth(2.4)}) ${cells}`,
    gridTemplateRows: `${STRIP_HEIGHT} ${rows}`,
  };
}

function gridRows(blocks: boolean, liftedOut: boolean): string {
  const periods = `repeat(7, ${ROW_HEIGHT})`;
  // The eighth row is the gap the inner-transition series are lifted out into,
  // or, when they are in their periods, the strip naming the blocks.
  if (!liftedOut) return blocks ? `${periods} ${STRIP_HEIGHT}` : periods;
  const gap = blocks ? STRIP_HEIGHT : SERIES_GAP;
  return `${periods} ${gap} repeat(2, ${ROW_HEIGHT})`;
}
