import { DEFAULT_DELIMITER } from './delimiters.ts';

/** How a table is read back. */
export interface ReadDelimitedOptions {
  /**
   * What separates two cells. Left out, the separator is guessed from the text.
   * @default undefined — the separator is detected
   */
  delimiter?: string;
}

/**
 * Read delimited text back into rows.
 *
 * Quoting is honoured, so a cell holding the separator, a newline or a doubled
 * quote comes back as it went in. A byte-order mark is dropped, `\r\n` and `\n`
 * both end a line, and a blank line — the trailing one included — is skipped
 * rather than read as a row carrying one empty cell.
 * @param text - The file, as text.
 * @param options - See {@link ReadDelimitedOptions}.
 * @returns The rows, each an array of cells.
 */
export function readDelimited(
  text: string,
  options: ReadDelimitedOptions = {},
): string[][] {
  const content = text.codePointAt(0) === 0xfe_ff ? text.slice(1) : text;
  if (content === '') return [];
  const delimiter = options.delimiter ?? detectDelimiter(content);

  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;

  for (let index = 0; index < content.length; index++) {
    const character = content.charAt(index);

    if (quoted) {
      if (character !== '"') {
        cell += character;
      } else if (content[index + 1] === '"') {
        cell += '"';
        index++;
      } else {
        quoted = false;
      }
      continue;
    }

    if (character === '"' && cell === '') {
      quoted = true;
    } else if (character === delimiter) {
      row.push(cell);
      cell = '';
    } else if (character === '\n' || character === '\r') {
      if (character === '\r' && content[index + 1] === '\n') index++;
      row.push(cell);
      if (!isBlank(row)) rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += character;
    }
  }

  row.push(cell);
  if (!isBlank(row)) rows.push(row);
  return rows;
}

/**
 * Guess what separates the cells of a piece of delimited text.
 *
 * The candidates are counted outside quotes over the first few lines, so a
 * comma inside a compound name does not win against the tabs actually
 * separating the columns.
 * @param text - The file, as text.
 * @returns The separator, falling back to the tab when nothing separates
 *   anything.
 */
export function detectDelimiter(text: string): string {
  let best = DEFAULT_DELIMITER;
  let bestCount = 0;
  for (const candidate of CANDIDATES) {
    const count = countOutsideQuotes(text, candidate);
    if (count > bestCount) {
      best = candidate;
      bestCount = count;
    }
  }
  return best;
}

function isBlank(row: readonly string[]): boolean {
  return row.length === 1 && row[0] === '';
}

/** The separators a file we read is allowed to use, in order of preference. */
const CANDIDATES: readonly string[] = ['\t', ',', ';'];

/** How many lines of the file the guess is made from. */
const SAMPLED_LINES = 10;

function countOutsideQuotes(text: string, delimiter: string): number {
  let count = 0;
  let lines = 0;
  let quoted = false;

  for (let index = 0; index < text.length; index++) {
    const character = text.charAt(index);
    if (quoted) {
      if (character === '"') {
        if (text[index + 1] === '"') {
          index++;
        } else {
          quoted = false;
        }
      }
      continue;
    }
    if (character === '"') {
      quoted = true;
    } else if (character === delimiter) {
      count++;
    } else if (character === '\n') {
      lines++;
      if (lines >= SAMPLED_LINES) break;
    }
  }
  return count;
}
