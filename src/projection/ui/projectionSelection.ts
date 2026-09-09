/**
 * What a viewer says about its selection, and the translation between the two
 * ways of naming a row.
 *
 * A plot works in row numbers because that is what it drew, and a caller works
 * in names because that is what its own table holds. Keeping the translation
 * here, in one direction each way, is what lets the boundary between them be a
 * documented promise rather than a habit each tab has to remember.
 */

import type { ScatterSelectionMode } from '../../scatter/core/scatterSelection.ts';

/** What a gesture did to a projection viewer's selection. */
export interface ProjectionSelection {
  /** The selected rows, by name, in the score matrix's row order. */
  ids: readonly string[];
  /** The same rows as indices into the score matrix. */
  indices: readonly number[];
  /** Whether the gesture replaced the previous selection, added to it, or cut from it. */
  mode: ScatterSelectionMode;
  /** Which gesture produced it. */
  source: 'lasso' | 'point' | 'keyboard' | 'group' | 'clear' | 'all';
}

/**
 * Where each name sits in the score matrix.
 *
 * The first row wins a repeated name. A duplicate id then costs the reader one
 * unselectable row, which is a great deal better than silently moving their
 * selection to whichever sample happened to be named the same thing last.
 * @param ids - The row names, in the score matrix's row order.
 * @returns The row each name stands for.
 */
export function indexProjectionIds(
  ids: readonly string[],
): ReadonlyMap<string, number> {
  const rows = new Map<string, number>();
  for (let index = 0; index < ids.length; index++) {
    const id = ids[index];
    if (id !== undefined && !rows.has(id)) rows.set(id, index);
  }
  return rows;
}

/**
 * The rows a list of names stands for, ready for a plot to draw.
 *
 * A name nothing answers to is dropped rather than reported as a missing row:
 * a caller restoring a selection saved before its data was filtered should get
 * back the samples that are still there, not an error about the ones that are
 * not.
 * @param names - The names, or nothing at all.
 * @param rowOfId - From {@link indexProjectionIds}.
 * @returns The rows, in the order the names were given.
 */
export function projectionRowsOf(
  names: readonly string[] | undefined,
  rowOfId: ReadonlyMap<string, number>,
): readonly number[] {
  if (names === undefined) return EMPTY_SELECTION;
  const rows: number[] = [];
  for (const name of names) {
    const row = rowOfId.get(name);
    if (row !== undefined) rows.push(row);
  }
  return rows;
}

/**
 * The names a list of rows stands for, ready to hand back to a caller.
 * @param rows - The rows, as indices into the score matrix.
 * @param ids - The row names.
 * @returns The names, in the order the rows were given.
 */
export function projectionNamesOf(
  rows: readonly number[],
  ids: readonly string[],
): readonly string[] {
  const names: string[] = [];
  for (const row of rows) {
    const name = ids[row];
    if (name !== undefined) names.push(name);
  }
  return names;
}

const EMPTY_SELECTION: readonly number[] = [];
