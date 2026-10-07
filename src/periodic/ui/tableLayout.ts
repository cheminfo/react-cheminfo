/**
 * How the table is laid out: the box it measures, the grid its cells sit on,
 * and the block a caller may write in.
 */

import type { CSSProperties } from 'react';

import { COLUMN_COUNT, EMPTY_BLOCK } from '../core/layout.ts';

import { ROW_SHARE } from './cellType.ts';
import { ofWidth } from './unit.ts';

/**
 * Where what the caller writes in the empty block is placed.
 * @param offset - 1 when the table draws its header strips, 0 otherwise.
 * @returns The style of the slot.
 */
export function insetStyle(offset: number): CSSProperties {
  return {
    alignItems: 'center',
    display: 'flex',
    // A column of air on each side, so the writing reads as sitting in the
    // block rather than as running into the cells beside it.
    padding: `0 ${ofWidth(2.4)}`,
    gridColumn: `${String(EMPTY_BLOCK.column + offset)} / span ${String(EMPTY_BLOCK.columnSpan)}`,
    gridRow: `${String(EMPTY_BLOCK.row + offset)} / span ${String(EMPTY_BLOCK.rowSpan)}`,
    // A share of the table, with a floor, exactly as a cell sizes its symbol:
    // the block holds the same three rows at every width, so what is written
    // in it has to shrink with them.
    fontSize: `max(0.6rem, ${ofWidth(1.8)})`,
    lineHeight: 1.35,
    minWidth: 0,
    overflow: 'hidden',
  };
}

/** Narrowest the table is ever drawn; under it the type stops being readable. */
const MIN_WIDTH = 280;

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
 * @returns The style of the grid.
 */
export function gridStyle(headers: boolean): CSSProperties {
  // The eighth row is the gap the inner-transition series are lifted out into.
  const rows = `repeat(7, ${ROW_HEIGHT}) ${SERIES_GAP} repeat(2, ${ROW_HEIGHT})`;
  if (!headers) {
    return {
      ...baseGridStyle,
      gridTemplateColumns: `repeat(${String(COLUMN_COUNT)}, minmax(0, 1fr))`,
      gridTemplateRows: rows,
    };
  }
  return {
    ...baseGridStyle,
    gridTemplateColumns: `max(14px, ${ofWidth(2.4)}) repeat(${String(COLUMN_COUNT)}, minmax(0, 1fr))`,
    gridTemplateRows: `max(12px, ${ofWidth(2)}) ${rows}`,
  };
}
