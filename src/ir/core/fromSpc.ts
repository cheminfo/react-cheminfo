/**
 * Read a Thermo Galactic SPC file into infrared spectra.
 *
 * `ir-spectrum` does the reading, through `spc-parser`, and adds both value axes
 * exactly as it does for a JCAMP — so an SPC and a JCAMP of the same measurement
 * reach the viewer indistinguishable but for their `origin`.
 */

import { fromSPC as irAnalysis } from 'ir-spectrum';

import { describeSource, errorMessage } from '../../error/core/index.ts';

import type { LoadedIrSpectrum } from './analysisSpectra.ts';
import { analysisSpectra } from './analysisSpectra.ts';

/** How an SPC file is read. */
export interface IrSpcReadOptions {
  /**
   * The file's name, carried onto every spectrum it produced.
   * @default undefined
   */
  fileName?: string;
}

/**
 * Read every infrared spectrum an SPC file holds.
 *
 * SPC is a multi-file format in its own right — one file can carry a whole
 * kinetic series — so every subfile becomes a spectrum, for the same reason
 * every JCAMP block does.
 * @param data - The file, as bytes.
 * @param options - The file's name.
 * @returns One entry per subfile, in the order the file wrote them.
 * @throws {Error} When the file holds no readable spectrum, or when the parser
 * gave up on it.
 */
export function fromSpc(
  data: ArrayBuffer | Uint8Array,
  options: IrSpcReadOptions = {},
): LoadedIrSpectrum[] {
  const { fileName } = options;

  let spectra: LoadedIrSpectrum[];
  try {
    const origin: LoadedIrSpectrum['origin'] = { format: 'spc' };
    if (fileName !== undefined) origin.fileName = fileName;
    spectra = analysisSpectra(irAnalysis(data), origin);
  } catch (error) {
    throw new Error(
      `${describeSource(fileName)} could not be read as SPC — the parser stopped on it with: ${errorMessage(error)}`,
      { cause: error },
    );
  }

  if (spectra.length === 0) {
    throw new Error(
      `${describeSource(fileName)} was read as SPC but holds no infrared spectrum — no subfile in it carries at least two points.`,
    );
  }
  return spectra;
}
