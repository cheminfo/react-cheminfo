/**
 * Spectra from blocks that were parsed elsewhere.
 *
 * `readVamas` reads bytes and converts what it finds; this is the second half
 * of it on its own, for callers holding blocks that never arrived as a file.
 * The polymer library is the case that asked for it: a hundred and eleven
 * VAMAS files were read once, years ago, and serialised as an analyses manager,
 * so the spectra reach the viewer as objects rather than as bytes and would
 * otherwise have to be written back out to VAMAS to be read in again.
 *
 * Everything the conversion decides is decided identically either way — the
 * ascending abscissa, the kinetic fallback, the fit read as CasaXPS stated it —
 * because it is the same conversion.
 */

import type { AnalysisSpectrum } from 'xps-analysis';

import { nextSpectrumColor } from '../../chart/core/spectrumColor.ts';

import type { BlockContext } from './analysisSpectrum.ts';
import { blockToSpectrum } from './analysisSpectrum.ts';
import type { XpsReadOptions } from './readOptions.ts';
import { spectrumIdentity } from './readOptions.ts';
import { fitComponents, fitRegions } from './vamasFit.ts';
import { blockSourceEnergy, normalisedMetaOf } from './vamasRecord.ts';
import type { XpsFormat, XpsSpectrum } from './xpsSpectrum.ts';

/** The fewest points a block has to carry to be a spectrum. */
export const MINIMUM_BLOCK_POINTS = 2;

/** What the caller knows about blocks it parsed itself. */
export interface AnalysisBlocksOptions extends XpsReadOptions {
  /**
   * What the blocks were originally read from, which is what the metadata
   * panel reports and what a reader of the list needs in order to trust it.
   * @default 'vamas'
   */
  format?: XpsFormat;
}

/**
 * Turn already-parsed blocks into spectra ready to draw.
 * @param blocks - The blocks, in the order they should be listed.
 * @param options - What they came from, and what is already on the chart.
 * @returns One spectrum per block that carries a trace.
 */
export function readAnalysisBlocks(
  blocks: readonly AnalysisSpectrum[],
  options: AnalysisBlocksOptions = {},
): XpsSpectrum[] {
  const { format = 'vamas', taken, fileName } = options;
  const colors = [...(taken ?? [])];

  const spectra: XpsSpectrum[] = [];
  for (let index = 0; index < blocks.length; index++) {
    const block = blocks[index] as AnalysisSpectrum;
    if (block.variables.x.data.length < MINIMUM_BLOCK_POINTS) continue;

    const color = nextSpectrumColor(colors);
    colors.push(color);

    const normalised = normalisedMetaOf(block);
    const sourceEnergy = blockSourceEnergy(block, normalised);
    const regions =
      normalised === null ? [] : fitRegions(normalised, sourceEnergy);
    const components =
      normalised === null
        ? []
        : fitComponents(normalised, regions, sourceEnergy);

    const context: BlockContext = {
      format,
      normalised,
      id: spectrumIdentity(options, spectra.length),
      color,
      components,
      regions,
    };
    if (fileName !== undefined) context.fileName = fileName;
    if (blocks.length > 1) context.blockIndex = index;
    spectra.push(blockToSpectrum(block, context));
  }
  return spectra;
}
