import { readNumber } from '../../number/core/numberText.ts';

import { readDelimited } from './readDelimited.ts';

/** The two columns of numbers {@link readXYTable} finds in a table. */
export interface XYTable {
  /** The first cell of each row read. */
  x: number[];
  /** The second cell of each row read. */
  y: number[];
}

/**
 * Read the two columns of numbers a table starts with.
 *
 * A table somebody copies carries more than numbers: a header above them, and
 * beside them whatever else it says about a row, such as an assignment. So the
 * first two cells of each row are read, a decimal comma as a point, and a row
 * where they are not both numbers is skipped.
 * @param text - The table, as text.
 * @returns The two columns, empty when no row starts with two numbers.
 */
export function readXYTable(text: string): XYTable {
  const x: number[] = [];
  const y: number[] = [];
  for (const row of readDelimited(text)) {
    const first = readNumber(row[0] ?? '');
    const second = readNumber(row[1] ?? '');
    if (first !== undefined && second !== undefined) {
      x.push(first);
      y.push(second);
    }
  }
  return { x, y };
}
