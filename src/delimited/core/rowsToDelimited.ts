import { DEFAULT_DELIMITER } from './delimiters.ts';
import { toDelimited } from './toDelimited.ts';

/** One column of a table written from objects. */
export interface DelimitedColumn {
  /** Property of each object this column reads. */
  key: string;
  /**
   * What the column is called in the header line.
   * @default the key
   */
  label?: string;
  /**
   * How a value of this column is written.
   * @default {@link formatCell}
   */
  format?: (value: unknown) => string;
}

/** How a table of objects is written out. */
export interface RowsToDelimitedOptions {
  /**
   * What separates two cells.
   * @default '\t'
   */
  delimiter?: string;
  /**
   * Whether the column names are written as the first line.
   * @default true
   */
  header?: boolean;
  /**
   * What ends a line.
   * @default '\n'
   */
  newline?: string;
}

/**
 * Write a list of objects out as delimited text, one column per named field.
 *
 * The columns are what makes the file readable: they fix the order, they name
 * the header, and they are the only fields written — a row carrying more is not
 * silently widened, and one carrying less gets an empty cell rather than
 * shifting every column after it.
 * @param rows - The objects, one per line.
 * @param columns - The columns, in order; a plain string names a column that
 *   reads the property of the same name.
 * @param options - See {@link RowsToDelimitedOptions}.
 * @returns The text.
 */
export function rowsToDelimited(
  rows: ReadonlyArray<Readonly<Record<string, unknown>>>,
  columns: ReadonlyArray<string | DelimitedColumn>,
  options: RowsToDelimitedOptions = {},
): string {
  const {
    delimiter = DEFAULT_DELIMITER,
    header = true,
    newline = '\n',
  } = options;
  const resolved = resolveColumns(columns);

  const cells: string[][] = [];
  for (const row of rows) {
    const line: string[] = [];
    for (const { key, format } of resolved) {
      line.push(format(row[key]));
    }
    cells.push(line);
  }

  return toDelimited(cells, {
    delimiter,
    newline,
    header: header ? resolved.map((column) => column.label) : undefined,
  });
}

/**
 * Write one value the way a spreadsheet reads it.
 *
 * Nothing at all — `undefined`, `null`, or a number that is not one — becomes
 * an empty cell, which is what a spreadsheet means by a missing value; a date
 * becomes its ISO form, a list becomes its entries separated by `; `, and
 * anything else becomes its JSON, which at least says what was there.
 * @param value - The value.
 * @returns The cell.
 */
export function formatCell(value: unknown): string {
  if (value === undefined || value === null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') {
    return Number.isFinite(value) ? String(value) : '';
  }
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'bigint') return value.toString();
  if (Array.isArray(value)) {
    const parts: string[] = [];
    for (const entry of value) {
      parts.push(formatCell(entry));
    }
    return parts.join('; ');
  }
  try {
    return JSON.stringify(value) ?? '';
  } catch {
    return '';
  }
}

interface ResolvedColumn {
  key: string;
  label: string;
  format: (value: unknown) => string;
}

function resolveColumns(
  columns: ReadonlyArray<string | DelimitedColumn>,
): ResolvedColumn[] {
  const resolved: ResolvedColumn[] = [];
  for (const column of columns) {
    if (typeof column === 'string') {
      resolved.push({ key: column, label: column, format: formatCell });
    } else {
      resolved.push({
        key: column.key,
        label: column.label ?? column.key,
        format: column.format ?? formatCell,
      });
    }
  }
  return resolved;
}
