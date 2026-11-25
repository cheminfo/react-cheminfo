/**
 * The Raman spectra of what a reader built: the light a sample scatters, read
 * as one intensity over the Raman shift.
 *
 * Nothing is derived from the intensity — there is no absorbance of scattered
 * light — so what is kept is each block's own `y`, ordered by shift, with the
 * records the instrument wrote: the laser wavenumber and a map point's
 * position are what makes a Raman spectrum readable.
 */

import type { MeasurementXY } from 'cheminfo-types';
import { xySortX } from 'ml-spectra-processing';

import type { LoadedIrSpectrum } from './analysisSpectra.ts';
import { blockMeta, blockTitle } from './analysisSpectra.ts';
import type { IrOrigin } from './irSpectrum.ts';

/**
 * Turn every Raman block of what a reader built into one loaded spectrum.
 * @param blocks - The spectra the reader built, in the order of the file.
 * @param origin - Where they came from: the format and the file.
 * @returns One spectrum per Raman block of at least two points, carrying its
 * intensity over the shifts ascending, in the order the file wrote them.
 */
export function ramanSpectra(
  blocks: readonly MeasurementXY[],
  origin: IrOrigin,
): LoadedIrSpectrum[] {
  const spectra: LoadedIrSpectrum[] = [];
  for (let index = 0; index < blocks.length; index++) {
    const block = blocks[index];
    if (block === undefined || !isRaman(block)) continue;
    const shifts = block.variables.x?.data;
    const intensities = block.variables.y?.data;
    if (
      shifts === undefined ||
      intensities === undefined ||
      shifts.length < 2
    ) {
      continue;
    }
    const sorted = xySortX({ x: shifts, y: intensities });
    const blockOrigin: IrOrigin = { ...origin, recorded: 'intensity' };
    // A file holding one spectrum has no index worth showing.
    if (blocks.length > 1) blockOrigin.blockIndex = index;
    const spectrum: LoadedIrSpectrum = {
      wavenumber: Float64Array.from(sorted.x),
      intensity: Float64Array.from(sorted.y),
      meta: blockMeta(block),
      origin: blockOrigin,
    };
    const title = blockTitle(block);
    if (title) spectrum.name = title;
    spectra.push(spectrum);
  }
  return spectra;
}

/**
 * Whether a block is a Raman spectrum: its data type says so, or says nothing.
 *
 * A JCAMP `LINK` file puts the infrared spectrum of a sample beside its Raman
 * one, and an infrared absorbance drawn as scattered intensity is a spectrum
 * whose every band means something else — so a block naming another technique
 * is dropped. One naming none is kept: the file was opened as Raman.
 * @param block - One spectrum the reader built.
 * @returns Whether to read it as Raman.
 */
export function isRaman(block: MeasurementXY): boolean {
  const dataType = block.dataType?.toUpperCase() ?? '';
  if (dataType === '' || dataType.includes('RAMAN')) return true;
  if (dataType.includes('LINK')) return true;
  return !NOT_RAMAN.test(dataType);
}

/** The data types that are certainly not a Raman spectrum. */
const NOT_RAMAN =
  /INFRARED|\bF?T?-?IR\b|UV|VIS|NMR|MASS|CHROMATOGRAM|XRD|FLUORESCENCE/;
