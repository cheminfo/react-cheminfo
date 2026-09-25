/**
 * The tables of a site whose rows are translated: the element sheet, a list of
 * ions, the rules of a nomenclature.
 *
 * A site's prose is not only its interface. Most of what a chemistry tool
 * shows is a table, and a table mixes two kinds of column: what was measured
 * or computed — an atomic number, a mass, a formula, an identifier — and what
 * was written — a name, where the name comes from, a note. The first kind is
 * the same in every language and must never reach a translator; the second is
 * exactly what a translator is for.
 *
 * The line between them is drawn once, here. A site declares its tables, and
 * only a field it declares can be edited, in a catalog key built the same way
 * everywhere:
 *
 * ```text
 * <table>.<row>.<field>     element.Fe.name, element.Fe.origin
 * ```
 *
 * Everything else about the row — the mass, the density, the id itself — stays
 * in the data the site generates from its source, out of reach.
 */

/** How much room a field's text needs, which is how the editor draws it. */
export type TranslatableFieldSize = 'line' | 'paragraph';

/** One translated column of a table. */
export interface TranslatableField {
  /** Last part of the key, e.g. `name`. */
  id: string;
  /** What the column is called in the editor, in English. */
  label: string;
  /**
   * How much text it holds, which is whether the editor gives it one line or
   * a box.
   * @default 'line'
   */
  size?: TranslatableFieldSize;
  /**
   * Whether every row is expected to carry it, so the editor can say what is
   * still missing rather than only what is there.
   * @default false
   */
  required?: boolean;
  /**
   * One sentence telling the translator what the column is, shown above the
   * column in the editor.
   * @default undefined
   */
  hint?: string;
}

/** One row of a table. */
export interface TranslatableRow {
  /** Middle part of the key, e.g. `Fe`. */
  id: string;
  /**
   * What names the row in the editor — an atomic number and a symbol, a
   * formula. It is data, never translated, and never a key.
   */
  label: string;
}

/** A table whose rows carry translated text. */
export interface TranslatableTable {
  /** First part of the key, e.g. `element`. */
  id: string;
  /** What the table is called in the editor, in English. */
  label: string;
  /** The catalog its keys belong to, as the page registered it. */
  catalogId: string;
  /** The columns a translator may write, in the order the editor shows them. */
  fields: readonly TranslatableField[];
  /** The rows, in the order the editor lists them. */
  rows: readonly TranslatableRow[];
}

/**
 * The key one field of one row is kept under.
 * @param table - The table the row belongs to.
 * @param rowId - The row.
 * @param fieldId - The column.
 * @returns The catalog key, e.g. `element.Fe.name`.
 */
export function tableKey(
  table: Pick<TranslatableTable, 'id'>,
  rowId: string,
  fieldId: string,
): string {
  return `${table.id}.${rowId}.${fieldId}`;
}

/**
 * Every key a table can hold, row by row and field by field.
 *
 * It is what the editor walks to draw the grid, and what tells it which cells
 * are still empty: a key absent from the catalog is a translation nobody has
 * written yet, not a field that does not exist.
 * @param table - The table to walk.
 * @returns One entry per cell, in reading order.
 */
export function tableCells(table: TranslatableTable): TableCell[] {
  const cells: TableCell[] = [];
  for (const row of table.rows) {
    for (const field of table.fields) {
      cells.push({ key: tableKey(table, row.id, field.id), row, field });
    }
  }
  return cells;
}

/** One cell of a table: where it is, and what it is kept under. */
export interface TableCell {
  /** The catalog key. */
  key: string;
  /** The row it belongs to. */
  row: TranslatableRow;
  /** The column it belongs to. */
  field: TranslatableField;
}
