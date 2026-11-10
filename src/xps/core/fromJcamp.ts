/**
 * Read a JCAMP-DX file into spectra.
 *
 * JCAMP is how a spectrum leaves this viewer and how a database hands one back:
 * `xps-analysis` writes an analysis out as one block per spectrum and reads it
 * in the same shape a VAMAS file arrives in, so a file that made the round trip
 * keeps its transition, its acquisition records and its axes.
 *
 * What it does not keep is a fit stated as a fit. CasaXPS components live in a
 * VAMAS block comment, and a JCAMP that carries them carries them as text of
 * its own devising — so nothing here reads components or regions, and a
 * spectrum read back from JCAMP is the trace and what the file said about how
 * it was acquired.
 */

import type { AnalysisSpectrum } from 'xps-analysis';
import { fromJcamp as jcampAnalysis } from 'xps-analysis';

import { nextSpectrumColor } from '../../chart/core/spectrumColor.ts';

import type { BlockContext } from './analysisSpectrum.ts';
import { blockToSpectrum } from './analysisSpectrum.ts';
import type { XpsReadOptions } from './readOptions.ts';
import { describeSource, spectrumIdentity } from './readOptions.ts';
import { normalisedMetaOf } from './vamasRecord.ts';
import type { XpsSpectrum } from './xpsSpectrum.ts';

/** The fewest points a block has to carry to be a spectrum. */
const MINIMUM_POINTS = 2;

/**
 * Read every spectrum a JCAMP-DX file holds.
 *
 * All of them, never the first: a JCAMP is a container, and an experiment
 * exported from this viewer writes the survey scan and each narrow scan as
 * separate blocks of one file. Taking only the first would quietly drop the
 * scans the file was exported for, and would do it without an error.
 * @param data - The file, as bytes or as text.
 * @param options - What it was called, and what is already on the chart.
 * @returns One spectrum per block, in the order the file wrote them.
 * @throws {Error} When the file cannot be read, or holds no block with a trace.
 */
export function readJcamp(
  data: ArrayBuffer | Uint8Array | string,
  options: XpsReadOptions = {},
): XpsSpectrum[] {
  const { fileName, taken } = options;
  const blocks = readBlocks(data, fileName);
  const colors = [...(taken ?? [])];

  const spectra: XpsSpectrum[] = [];
  for (let index = 0; index < blocks.length; index++) {
    const block = blocks[index] as AnalysisSpectrum;
    if (block.variables.x.data.length < MINIMUM_POINTS) continue;

    const color = nextSpectrumColor(colors);
    colors.push(color);
    const context: BlockContext = {
      format: 'jcamp',
      normalised: normalisedMetaOf(block),
      id: spectrumIdentity(options, spectra.length),
      color,
    };
    if (fileName !== undefined) context.fileName = fileName;
    if (blocks.length > 1) context.blockIndex = index;
    spectra.push(blockToSpectrum(block, context));
  }

  if (spectra.length === 0) {
    throw new Error(
      `${describeSource(fileName)} was read as JCAMP-DX but holds no spectrum — no block in it carries an XY data record of at least ${MINIMUM_POINTS} points.`,
    );
  }
  return spectra;
}

/**
 * Every block of the file, or a sentence saying which file defeated the reader.
 * @param data - The file, as bytes or as text.
 * @param fileName - The file's name, absent for a paste.
 * @returns The blocks the converter built, in file order.
 * @throws {Error} When the converter could not read the file at all.
 */
function readBlocks(
  data: ArrayBuffer | Uint8Array | string,
  fileName: string | undefined,
): AnalysisSpectrum[] {
  try {
    return jcampAnalysis(data).spectra;
  } catch (error) {
    const said = error instanceof Error ? error.message : String(error);
    throw new Error(
      `${describeSource(fileName)} could not be read as JCAMP-DX — the converter stopped on it with: ${said}`,
      { cause: error },
    );
  }
}
