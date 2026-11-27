/**
 * The spectra of a technique that reads one intensity over its axis — emission
 * over the wavelength, Raman scattering over the shift — with nothing derived
 * from that intensity.
 */

import type { MeasurementXY } from 'cheminfo-types';
import { xySortX } from 'ml-spectra-processing';

import type { LoadedIrSpectrum } from './analysisSpectra.ts';
import { blockMeta, blockTitle } from './analysisSpectra.ts';
import type { IrMode, IrOrigin } from './irSpectrum.ts';

/**
 * Turn every block a technique accepts into one loaded spectrum, its own `y`
 * kept as the intensity and ordered by `x`.
 * @param blocks - The spectra the reader built, in the order of the file.
 * @param origin - Where they came from: the format and the file.
 * @param accepts - Whether a block belongs to the technique.
 * @param recorded - What the instrument recorded, stated on every origin.
 * @returns One spectrum per accepted block of at least two points, in the order
 * the file wrote them.
 */
export function intensitySpectra(
  blocks: readonly MeasurementXY[],
  origin: IrOrigin,
  accepts: (block: MeasurementXY) => boolean,
  recorded?: IrMode,
): LoadedIrSpectrum[] {
  const spectra: LoadedIrSpectrum[] = [];
  for (let index = 0; index < blocks.length; index++) {
    const block = blocks[index];
    if (block === undefined || !accepts(block)) continue;
    const positions = block.variables.x?.data;
    const intensities = block.variables.y?.data;
    if (
      positions === undefined ||
      intensities === undefined ||
      positions.length < 2
    ) {
      continue;
    }
    const sorted = xySortX({ x: positions, y: intensities });
    const blockOrigin: IrOrigin =
      recorded === undefined ? { ...origin } : { ...origin, recorded };
    // A file holding one spectrum has no index worth showing.
    if (blocks.length > 1) blockOrigin.blockIndex = index;
    const spectrum: LoadedIrSpectrum = {
      wavenumber: sorted.x,
      intensity: sorted.y,
      meta: blockMeta(block),
      origin: blockOrigin,
    };
    const title = blockTitle(block);
    if (title) spectrum.name = title;
    spectra.push(spectrum);
  }
  return spectra;
}
