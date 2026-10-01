/**
 * Turning a list of records into the cells a table is handed over as.
 *
 * Most pages hold their data as one object per row — a query result, a list of
 * peaks, a row of properties — while a delimited table is cells. Every site
 * that exports such a list wrote the same two loops, so they are here once.
 */

/** One record, as a page holds it before it becomes a row of cells. */
export type TableRecord = Record<string, unknown>;

/** How a record becomes cells. */
export interface TableRowsOptions {
  /**
   * The columns to write, in order. A column no record carries comes out
   * empty, which is what lets one caller pin the order of a table whose first
   * record happens to be missing a field.
   * @default the keys of the first record, in the order it declares them
   */
  columns?: readonly string[];
  /**
   * How a value becomes a cell.
   * @default `String(value)`, with `null` and `undefined` written as nothing
   */
  format?: (value: unknown, column: string) => string;
}

/** The columns, and the cells under them. */
export interface TableRows {
  /** Column names, in the order the cells are written. */
  header: string[];
  /** One array of cells per record. */
  rows: string[][];
}

/**
 * The records as the header and cells of a table.
 * @param records - The records, in the order they are shown.
 * @param options - See {@link TableRowsOptions}.
 * @returns See {@link TableRows}.
 */
export function tableRows(
  records: readonly TableRecord[],
  options: TableRowsOptions = {},
): TableRows {
  const { columns, format = defaultCell } = options;
  const header = [...(columns ?? columnsOf(records))];
  const rows: string[][] = [];
  for (const record of records) {
    const cells: string[] = [];
    for (const column of header) cells.push(format(record[column], column));
    rows.push(cells);
  }
  return { header, rows };
}

/**
 * Every column the records carry, each named once, in the order first seen.
 *
 * Every record is read rather than only the first, because a list whose later
 * records carry a field the first one happens to lack would otherwise be
 * handed over with that column silently missing.
 * @param records - The records.
 * @returns The column names.
 */
export function columnsOf(records: readonly TableRecord[]): string[] {
  const columns: string[] = [];
  const seen = new Set<string>();
  for (const record of records) {
    for (const column of Object.keys(record)) {
      if (seen.has(column)) continue;
      seen.add(column);
      columns.push(column);
    }
  }
  return columns;
}

function defaultCell(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (
    typeof value === 'number' ||
    typeof value === 'bigint' ||
    typeof value === 'boolean'
  ) {
    return String(value);
  }
  // Anything else left in a cell has no honest text form, and `[object Object]`
  // is the one answer a spreadsheet can do nothing with. JSON at least says
  // what was there; a caller who wants better passes `format`.
  return JSON.stringify(value) ?? '';
}
