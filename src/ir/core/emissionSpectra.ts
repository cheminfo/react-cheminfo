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

import type { LoadedIrSpectrum } from './analysisSpectra.ts';
import { intensitySpectra } from './intensitySpectra.ts';
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
  return intensitySpectra(analysis.spectra, origin, isEmission);
}

/**
 * Whether a block is light the sample emits: its data type says so, or its
 * value axis is an intensity `uv-spectrum` derived no absorbance from.
 * @param block - One spectrum of the analysis.
 * @returns Whether to read it as an emission spectrum.
 */
function isEmission(block: MeasurementXY): boolean {
  if (EMITTED.test(block.dataType?.toUpperCase() ?? '')) return true;
  if (block.variables.a !== undefined) return false;
  return EMITTED_LABEL.test(block.variables.y?.label?.toLowerCase() ?? '');
}

/** The data types of light a sample emits. */
const EMITTED = /FLUORESC|PHOSPHORESC|LUMINESC|EMISSION/;

/** The value axes of light a sample emits, as `uv-spectrum` recognises them. */
const EMITTED_LABEL = /intensity|fluoresc|phosphoresc|luminesc|emission|counts/;
