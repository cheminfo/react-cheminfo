/**
 * Read two columns of m/z and intensity, through `xy-parser`.
 *
 * Whatever separates the columns — a tab, a comma, spaces, a semicolon — and
 * whatever header lines come before the numbers, `xy-parser` finds the numbers,
 * so a peak list copied out of an instrument report, a CSV export and a
 * hand-typed table are all one format here. A table that says more about a peak
 * than its two numbers, an assignment for instance, is one format with them.
 */

import { parseXYAndKeepInfo } from 'xy-parser';

import { readXYTable } from '../../delimited/core/readXYTable.ts';
import { describeSource } from '../../error/core/index.ts';

import { ascendingTrace } from './ascendingTrace.ts';
import type { LoadedMassSpectrum } from './loadedMassSpectrum.ts';

/** How a text file is read. */
export interface MassTextReadOptions {
  /**
   * The file's name, carried onto the spectrum.
   * @default undefined
   */
  fileName?: string;
}

/**
 * Read the one spectrum two columns of numbers make.
 *
 * Nothing is said about the acquisition, because two columns say nothing: the
 * spectrum comes back with no metadata and no name of its own, and is called
 * after its file.
 * @param data - The file, as bytes or as text.
 * @param options - The file's name.
 * @returns The spectrum, as a list of one, the way every reader answers.
 * @throws {Error} When no line of it holds two numbers.
 */
export function fromText(
  data: Uint8Array | string,
  options: MassTextReadOptions = {},
): LoadedMassSpectrum[] {
  const { fileName } = options;
  const { x, y } = readColumns(data);
  if (x.length === 0) {
    throw new Error(
      `${describeSource(fileName)} holds no two columns of numbers — a spectrum in text is one line per point, the m/z first and the intensity after it.`,
    );
  }
  return [
    {
      trace: ascendingTrace(x, y),
      meta: null,
      origin:
        fileName === undefined
          ? { format: 'text' }
          : { format: 'text', fileName },
    },
  ];
}

/**
 * The two columns a text holds.
 *
 * `xy-parser` reads only the lines holding nothing but numbers, so one peak
 * carrying a note would leave the list without it. When it set any line aside,
 * that line may be such a peak, so the text is read as a table too and the
 * reading with more points is kept.
 * @param data - The file, as bytes or as text.
 * @returns The columns, empty when no line holds two numbers.
 */
function readColumns(data: Uint8Array | string): {
  x: number[];
  y: number[];
} {
  const { data: columns, info } = parseXYAndKeepInfo(data);
  if (info.length === 0) return columns;
  const text = typeof data === 'string' ? data : new TextDecoder().decode(data);
  const table = readXYTable(text);
  return table.x.length > columns.x.length ? table : columns;
}
