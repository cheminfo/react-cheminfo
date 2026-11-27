/**
 * How the conformer table is laid out: numbers right-aligned, provisional
 * energies muted, the selected row tinted, and the hooks a suite reads a cell
 * by.
 */

import type { CSSProperties } from 'react';

import type { ChromeKey } from '../../i18n/core/chromeCatalog.ts';

import type { ConformerColumn } from './conformerColumns.ts';
import { NUMERIC_CONFORMER_COLUMNS } from './conformerColumns.ts';

/**
 * What a copyable column is called in the hover title, and which columns are
 * copyable at all.
 *
 * Only the relative energy: it is the number a chemist reads off the set and
 * quotes elsewhere. A total force-field energy is an internal quantity nobody
 * pastes, and a rank and a share are read on the page rather than taken away.
 */
export const COPY_LABELS: Partial<Record<ConformerColumn, ChromeKey>> = {
  relative: 'conformers.table.copyRelative',
};

/**
 * A stable hook per cell, so a suite can read one column without counting
 * table cells — which changes the moment a column is added.
 */
export const CELL_TEST_IDS: Record<ConformerColumn, string> = {
  id: 'conformer-id',
  population: 'conformer-population',
  relative: 'conformer-relative-energy',
  total: 'conformer-total-energy',
  forceFieldRelative: 'conformer-force-field-relative',
  forceFieldRank: 'conformer-force-field-rank',
};

/**
 * A header cell's style: numbers are right-aligned.
 * @param column - The column.
 * @returns The style, or `undefined` when it needs none.
 */
export function headerStyle(
  column: ConformerColumn,
): CSSProperties | undefined {
  return NUMERIC_CONFORMER_COLUMNS.has(column) ? numericStyle : undefined;
}

/**
 * A cell's own style: numbers are right-aligned and tabular, and every cell a
 * better method will restate is muted while it works. The rank is not one of
 * them — it names the row rather than measuring it, and it is what a reader
 * follows as the order changes under them.
 * @param column - The column the cell is in.
 * @param provisional - Whether the energies are still expected to change.
 * @returns The cell's inline style, or `undefined` when it needs none.
 */
export function cellStyle(
  column: ConformerColumn,
  provisional: boolean,
): CSSProperties | undefined {
  const numeric = NUMERIC_CONFORMER_COLUMNS.has(column);
  if (!provisional || column === 'id') {
    return numeric ? numericStyle : undefined;
  }
  return numeric ? provisionalNumericStyle : provisionalStyle;
}

/** The table runs the width of its panel. */
export const tableStyle = { width: '100%' } as const satisfies CSSProperties;

const numericStyle = {
  textAlign: 'right',
  fontVariantNumeric: 'tabular-nums',
} as const satisfies CSSProperties;

const provisionalStyle = {
  color: 'var(--text-muted)',
} as const satisfies CSSProperties;

const provisionalNumericStyle = {
  ...numericStyle,
  ...provisionalStyle,
} as const satisfies CSSProperties;

/**
 * The selected row is tinted with the site's own accent, so the table belongs
 * to whichever site draws it; a row is a pointer only where a click does
 * something.
 * @param active - Whether this row is the selected one.
 * @param selectable - Whether a click selects a row at all.
 * @returns The row's inline style, or `undefined` when it needs none.
 */
export function rowStyle(
  active: boolean,
  selectable: boolean,
): CSSProperties | undefined {
  if (active) return selectable ? SELECTED_ROW : SELECTED_ROW_STATIC;
  return selectable ? SELECTABLE_ROW : undefined;
}

const SELECTED_ROW_STATIC = {
  background: 'color-mix(in oklab, var(--accent) 12%, white)',
  fontWeight: 600,
} as const satisfies CSSProperties;

const SELECTED_ROW = {
  ...SELECTED_ROW_STATIC,
  cursor: 'pointer',
} as const satisfies CSSProperties;

const SELECTABLE_ROW = { cursor: 'pointer' } as const satisfies CSSProperties;
