import { DEFAULT_DELIMITER } from './delimiters.ts';

/** How a table is written out. */
export interface ToDelimitedOptions {
  /**
   * What separates two cells.
   * @default '\t'
   */
  delimiter?: string;
  /**
   * Column names, written as the first line.
   * @default undefined — the table is written without a header line
   */
  header?: readonly string[];
  /**
   * What ends a line.
   * @default '\n'
   */
  newline?: string;
}

/**
 * Write a table out as delimited text.
 *
 * Every cell is escaped, whatever the separator: a value holding the separator,
 * a quote or a newline is quoted and its quotes doubled, per RFC 4180. Joining
 * on a tab and hoping no cell holds one is what silently corrupts a file the
 * day a compound name carries a comma or a source a line break.
 * @param rows - The cells, one array per line.
 * @param options - See {@link ToDelimitedOptions}.
 * @returns The text, header line first when there is one.
 */
export function toDelimited(
  rows: ReadonlyArray<readonly string[]>,
  options: ToDelimitedOptions = {},
): string {
  const { delimiter = DEFAULT_DELIMITER, header, newline = '\n' } = options;

  const lines: string[] = [];
  if (header !== undefined) lines.push(writeLine(header, delimiter));
  for (const row of rows) {
    lines.push(writeLine(row, delimiter));
  }
  return lines.join(newline);
}

/**
 * Write one cell so reading it back gives exactly what went in.
 * @param value - The cell.
 * @param delimiter - What separates two cells in this file.
 * @returns The cell, quoted when it has to be.
 */
export function escapeCell(value: string, delimiter: string): string {
  const mustQuote =
    value.includes(delimiter) ||
    value.includes('"') ||
    value.includes('\n') ||
    value.includes('\r');
  if (!mustQuote) return value;
  return `"${value.replaceAll('"', '""')}"`;
}

function writeLine(cells: readonly string[], delimiter: string): string {
  const escaped: string[] = [];
  for (const cell of cells) {
    escaped.push(escapeCell(cell, delimiter));
  }
  return escaped.join(delimiter);
}
