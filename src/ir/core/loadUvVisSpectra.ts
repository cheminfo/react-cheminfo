/**
 * One entry point for a UV-vis or a fluorescence file, whatever it was written
 * as.
 *
 * `uv-spectrum` recognises the format from the bytes — JCAMP-DX, Thermo
 * Galactic and Shimadzu SPC, PerkinElmer SP, a Cary Eclipse CSV export, two
 * columns of text — and derives the absorbance and transmittance pair from
 * whichever the file carried, so the conversion is done once, in the package
 * that knows what a UV-vis y axis means. A fluorometer's file is told apart
 * there too, and read here as the intensity of the light emitted. It is
 * imported only once a file is read, so a page that never opens one never
 * downloads it.
 */

import type { MeasurementXY } from 'cheminfo-types';

import { describeSource, errorMessage } from '../../error/core/index.ts';

import { analysisSpectra } from './analysisSpectra.ts';
import { detectIrFormat } from './detectIrFormat.ts';
import { emissionSpectra } from './emissionSpectra.ts';
import type { IrOrigin } from './irSpectrum.ts';
import type {
  LoadIrSpectraOptions,
  LoadIrSpectraResult,
} from './loadIrSpectra.ts';

/** What reading a UV-vis or a fluorescence file gave. */
export interface LoadUvVisSpectraResult extends LoadIrSpectraResult {
  /**
   * What the file holds, and so which viewer opens it: `uvvis` for light
   * absorbed, `fluorescence` for light emitted.
   */
  technique: 'uvvis' | 'fluorescence';
}

/**
 * Read every UV-vis spectrum a file holds, or, when it holds none, every
 * fluorescence spectrum.
 * @param data - The file, as bytes, or the pasted text.
 * @param options - The file's name.
 * @returns The spectra over their wavelengths in nanometres, held as
 * `wavenumber` — each carrying its absorbance and transmittance, or for a
 * fluorescence file its intensity —, the format, and which of the two it is.
 * @throws {Error} When `uv-spectrum` gave up on the file, or when it holds no
 * spectrum read as absorbance, transmittance or emitted intensity.
 */
export async function loadUvVisSpectra(
  data: Uint8Array | string,
  options: LoadIrSpectraOptions = {},
): Promise<LoadUvVisSpectraResult> {
  const { fileName } = options;
  const format = uvVisFormat(data, fileName);
  const { from } = await import('uv-spectrum');

  let analysis: ReturnType<typeof from>;
  try {
    analysis = from(data);
  } catch (error) {
    throw new Error(
      `${describeSource(fileName)} could not be read as a UV-vis spectrum — uv-spectrum stopped on it with: ${errorMessage(error)}`,
      { cause: error },
    );
  }

  const origin: IrOrigin = { format };
  if (fileName !== undefined) origin.fileName = fileName;
  const spectra = analysisSpectra(analysis, origin, 'uvvis');
  if (spectra.length > 0) return { spectra, format, technique: 'uvvis' };
  const emitted = emissionSpectra(analysis, origin);
  if (emitted.length > 0) {
    return { spectra: emitted, format, technique: 'fluorescence' };
  }

  throw new Error(unreadReason(analysis.spectra, describeSource(fileName)));
}

/**
 * Why a file `uv-spectrum` read gave no spectrum to draw.
 * @param blocks - What it read.
 * @param source - How the file is named in a sentence.
 * @returns The message.
 */
function unreadReason(
  blocks: readonly MeasurementXY[],
  source: string,
): string {
  if (blocks.some((block) => block.variables.r !== undefined)) {
    return `${source} is a reflectance spectrum, which this viewer does not read yet: it reads absorbance, transmittance and emitted intensity.`;
  }
  return `${source} holds no UV-vis or fluorescence spectrum — no block in it carries an absorbance, a transmittance or an emitted intensity over at least two points.`;
}

/**
 * What the file was written as, for the spectrum's origin. A binary file
 * `uv-spectrum` read that is not SPC is PerkinElmer SP, filed with it.
 * @param data - The file.
 * @param fileName - Its name.
 * @returns The format.
 */
function uvVisFormat(
  data: Uint8Array | string,
  fileName: string | undefined,
): IrOrigin['format'] {
  const detected = detectIrFormat(data, fileName);
  if (detected !== 'unknown') return detected;
  return typeof data === 'string' ? 'text' : 'spc';
}
