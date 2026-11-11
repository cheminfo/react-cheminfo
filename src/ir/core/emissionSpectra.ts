/**
 * The emission spectra of a `uv-spectrum` `Analysis`: the light a sample gives
 * off once excited, read as one intensity over the wavelength.
 *
 * `uv-spectrum` derives no absorbance from such a block — a fluorometer's
 * intensity is not light that got through — so what is kept is its own `y`,
 * ordered by wavelength, with the records the instrument wrote: the excitation
 * wavelength and the slits are what makes an emission spectrum readable.
 */

import type { MeasurementXY } from 'cheminfo-types';
import type { Analysis } from 'ir-spectrum';
import { xySortX } from 'ml-spectra-processing';

import type { LoadedIrSpectrum } from './analysisSpectra.ts';
import { blockMeta, blockTitle } from './analysisSpectra.ts';
import type { IrOrigin } from './irSpectrum.ts';

/**
 * Turn every emission block of an analysis into one loaded spectrum.
 * @param analysis - What `uv-spectrum` read.
 * @param origin - Where it came from: the format and the file.
 * @returns One spectrum per emission block of at least two points, carrying
 * its intensity, in the order the file wrote them.
 */
export function emissionSpectra(
  analysis: Analysis,
  origin: IrOrigin,
): LoadedIrSpectrum[] {
  const blocks = analysis.spectra;
  const spectra: LoadedIrSpectrum[] = [];
  for (let index = 0; index < blocks.length; index++) {
    const block = blocks[index];
    if (block === undefined || !isEmission(block)) continue;
    const wavelengths = block.variables.x?.data;
    const intensities = block.variables.y?.data;
    if (
      wavelengths === undefined ||
      intensities === undefined ||
      wavelengths.length < 2
    ) {
      continue;
    }
    const sorted = xySortX({ x: wavelengths, y: intensities });
    const blockOrigin: IrOrigin = { ...origin };
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
 * Whether a block is light the sample emits: its data type says so, or its
 * value axis is an intensity `uv-spectrum` derived no absorbance from.
 * @param block - One spectrum of the analysis.
 * @returns Whether to read it as an emission spectrum.
 */
export function isEmission(block: MeasurementXY): boolean {
  if (EMITTED.test(block.dataType?.toUpperCase() ?? '')) return true;
  if (block.variables.a !== undefined) return false;
  return EMITTED_LABEL.test(block.variables.y?.label?.toLowerCase() ?? '');
}

/** The data types of light a sample emits. */
const EMITTED = /FLUORESC|PHOSPHORESC|LUMINESC|EMISSION/;

/** The value axes of light a sample emits, as `uv-spectrum` recognises them. */
const EMITTED_LABEL = /intensity|fluoresc|phosphoresc|luminesc|emission|counts/;
