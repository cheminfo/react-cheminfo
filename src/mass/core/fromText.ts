/**
 * Read two columns of m/z and intensity, through `xy-parser`.
 *
 * Whatever separates the columns — a tab, a comma, spaces, a semicolon — and
 * whatever header lines come before the numbers, `xy-parser` finds the numbers,
 * so a peak list copied out of an instrument report, a CSV export and a
 * hand-typed table are all one format here.
 */

import { parseXY } from 'xy-parser';

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
  const { x, y } = parseXY(data);
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
