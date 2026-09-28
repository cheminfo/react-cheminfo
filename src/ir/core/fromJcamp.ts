/**
 * Read a JCAMP-DX file into infrared spectra.
 *
 * `ir-spectrum` does the reading, which matters for one reason worth stating: it
 * adds an absorbance and a percent transmittance variable to every spectrum it
 * builds, whichever of the two the instrument wrote. So a file exported as
 * transmittance and one exported as absorbance arrive carrying both axes, and
 * nothing downstream has to know which it was — or to do the conversion itself.
 */

import type { TextData } from 'cheminfo-types';
import { fromJcamp as irAnalysis } from 'ir-spectrum';

import { describeSource, errorMessage } from '../../error/core/index.ts';

import type { LoadedIrSpectrum } from './analysisSpectra.ts';
import { analysisSpectra } from './analysisSpectra.ts';

/** How a JCAMP is read. */
export interface IrJcampReadOptions {
  /**
   * The file's name, carried onto every spectrum it produced.
   * @default undefined
   */
  fileName?: string;
}

/**
 * Read every infrared spectrum a JCAMP-DX file holds.
 *
 * All of them, never the first: a JCAMP is a container, and an instrument
 * exporting a sample beside its background writes both as blocks of one file.
 * Taking only the first would quietly drop the block the chemist exported the
 * file for, and would do it without an error, which is the worst way to lose
 * data.
 * @param data - The file, as bytes or as text.
 * @param options - The file's name.
 * @returns One entry per block, in the order the file wrote them.
 * @throws {Error} When the file holds no readable spectrum, or when the
 * converter gave up on it.
 */
export function fromJcamp(
  data: TextData,
  options: IrJcampReadOptions = {},
): LoadedIrSpectrum[] {
  const { fileName } = options;

  let spectra: LoadedIrSpectrum[];
  try {
    const origin: LoadedIrSpectrum['origin'] = { format: 'jcamp' };
    if (fileName !== undefined) origin.fileName = fileName;
    spectra = analysisSpectra(irAnalysis(data), origin);
  } catch (error) {
    // The converter's own words are kept because they name the record it
    // stopped on, which is more than anything written here could say — but they
    // are said about nothing, and a chemist who has just dropped eleven files
    // needs to know which of them this is.
    throw new Error(
      `${describeSource(fileName)} could not be read as JCAMP-DX — the converter stopped on it with: ${errorMessage(error)}`,
      { cause: error },
    );
  }

  if (spectra.length === 0) {
    throw new Error(
      `${describeSource(fileName)} was read as JCAMP-DX but holds no infrared spectrum — no block in it carries an XY data record with at least two points.`,
    );
  }
  return spectra;
}
