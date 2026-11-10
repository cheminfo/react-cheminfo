/**
 * Read a VAMAS file into spectra.
 *
 * VAMAS is what a surface-analysis laboratory actually exchanges, and one file
 * is an experiment rather than a spectrum: a survey scan, the narrow scans
 * taken around each transition of interest, and the same again for every sample
 * on the stub. Every block becomes a spectrum of its own — a file of six
 * samples over nine transitions gives fifty-four — because that is the list a
 * chemist reads, by sample first and by transition second.
 *
 * The fit comes with them. CasaXPS writes its components and its background
 * regions into the block comment, and those are somebody's conclusions about
 * the chemistry rather than a feature of the data, so they are read as stated
 * and never recomputed.
 */

import type { AnalysisSpectrum } from 'xps-analysis';
import { fromVamas as vamasAnalysis } from 'xps-analysis';

import {
  MINIMUM_BLOCK_POINTS,
  readAnalysisBlocks,
} from './fromAnalysisBlocks.ts';
import type { XpsReadOptions } from './readOptions.ts';
import { describeSource } from './readOptions.ts';
import type { XpsSpectrum } from './xpsSpectrum.ts';

/**
 * Read every spectrum a VAMAS file holds.
 * @param data - The file, as bytes or as text.
 * @param options - What it was called, and what is already on the chart.
 * @returns One spectrum per block, in the order the file wrote them.
 * @throws {Error} When the file cannot be read, or holds no block with a trace.
 */
export function readVamas(
  data: ArrayBuffer | Uint8Array | string,
  options: XpsReadOptions = {},
): XpsSpectrum[] {
  const { fileName } = options;
  const blocks = readBlocks(data, fileName);
  const spectra = readAnalysisBlocks(blocks, { ...options, format: 'vamas' });

  if (spectra.length === 0) {
    throw new Error(
      `${describeSource(fileName)} was read as VAMAS but holds no spectrum — no block in it carries an abscissa of at least ${MINIMUM_BLOCK_POINTS} points.`,
    );
  }
  return spectra;
}

/**
 * Every block of the file, or a sentence saying which file defeated the reader.
 *
 * The reader's own words are kept because they name the record it stopped on,
 * which is more than anything written here could say — but they are said
 * about nothing, and a chemist who has just dropped eleven files needs to know
 * which of them this is.
 * @param data - The file, as bytes or as text.
 * @param fileName - The file's name, absent for a paste.
 * @returns The blocks the reader built, in file order.
 * @throws {Error} When the reader could not read the file at all.
 */
function readBlocks(
  data: ArrayBuffer | Uint8Array | string,
  fileName: string | undefined,
): AnalysisSpectrum[] {
  try {
    return vamasAnalysis(data).spectra;
  } catch (error) {
    const said = error instanceof Error ? error.message : String(error);
    throw new Error(
      `${describeSource(fileName)} could not be read as VAMAS — the reader stopped on it with: ${said}`,
      { cause: error },
    );
  }
}
