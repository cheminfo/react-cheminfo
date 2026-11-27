/**
 * Handing spectra over as a file, from the list they are drawn from.
 *
 * Kept apart from `spectrumJcamp.ts` so that what a file holds can be tested
 * without a DOM, and so that a page wanting the text for something other than a
 * download — a POST to an ELN, a zip of a whole session — reaches for the writer
 * and not for this.
 */

import { downloadJcampList } from '../../download/core/jcamp.ts';

import type { IrMode, IrSpectrum } from './irSpectrum.ts';
import type { IrTechnique } from './irTechnique.ts';
import { irSpectraToJcamp } from './spectrumJcamp.ts';

/**
 * Download one spectrum, named after what the list calls it.
 * @param spectrum - The spectrum.
 * @param mode - The axis being read, used when the file named none.
 * @param technique - What was measured. Defaults to the first technique
 * reading `mode`.
 */
export function downloadIrSpectrum(
  spectrum: IrSpectrum,
  mode: IrMode,
  technique?: IrTechnique,
): void {
  downloadIrSpectra([spectrum], mode, technique);
}

/**
 * Download the whole list as one file.
 *
 * A list of one is saved under that spectrum's own name, since the file is that
 * spectrum: a chemist who has one spectrum open and asks the panel for it should
 * not have to work out which of their downloads `spectra.jdx` was.
 * @param spectra - The spectra, in the order the list holds them.
 * @param mode - The axis being read, used for a spectrum whose file named none.
 * @param technique - What was measured. Defaults to the first technique
 * reading `mode`.
 */
export function downloadIrSpectra(
  spectra: readonly IrSpectrum[],
  mode: IrMode,
  technique?: IrTechnique,
): void {
  downloadJcampList(
    spectra,
    (spectrum) => spectrum.name,
    (list) => irSpectraToJcamp(list, mode, technique),
  );
}
