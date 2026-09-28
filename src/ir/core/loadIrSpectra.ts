/**
 * One entry point for whatever was dropped, opened or pasted.
 *
 * The format is decided from the bytes and the right reader is called, so a
 * caller hands over a file and gets spectra back without knowing what it turned
 * out to be. Each reader is imported only once the bytes turn out to need it, so
 * a page that never opens an SPC never downloads its parser.
 */

import { describeSource } from '../../error/core/index.ts';

import type { LoadedIrSpectrum } from './analysisSpectra.ts';
import { detectIrFormat } from './detectIrFormat.ts';
import type { IrOrigin } from './irSpectrum.ts';

/** How a file is read. */
export interface LoadIrSpectraOptions {
  /**
   * The file's name, which decides the reader when the content is silent and is
   * carried onto every spectrum read out of it.
   * @default undefined
   */
  fileName?: string;
}

/** What a file turned out to hold. */
export interface LoadIrSpectraResult {
  /** The spectra it held, in the order the file wrote them. */
  spectra: LoadedIrSpectrum[];
  /** What it turned out to be. */
  format: IrOrigin['format'];
}

/**
 * Read every infrared spectrum a file holds.
 * @param data - The file, as bytes, or the pasted text.
 * @param options - The file's name.
 * @returns The spectra, and the format they were read from.
 * @throws {Error} When nothing in the file names a format this can read, or when
 * the reader for that format gave up on it.
 */
export async function loadIrSpectra(
  data: Uint8Array | string,
  options: LoadIrSpectraOptions = {},
): Promise<LoadIrSpectraResult> {
  const { fileName } = options;
  const format = detectIrFormat(data, fileName);

  if (format === 'jcamp') {
    const { fromJcamp } = await import('./fromJcamp.ts');
    return { spectra: fromJcamp(data, options), format };
  }

  if (format === 'spc') {
    if (typeof data === 'string') {
      throw new Error(
        `${describeSource(fileName)} looks like an SPC file but arrived as text — SPC is binary, and reading it as text loses bytes it cannot get back.`,
      );
    }
    const { fromSpc } = await import('./fromSpc.ts');
    return { spectra: fromSpc(data, options), format };
  }

  if (format === 'text') {
    // Deliberately refused rather than half-read. `ir-spectrum` adds the
    // absorbance and transmittance pair to everything `fromJcamp` and `fromSPC`
    // produce, but not to `fromText`, so a two-column file arrives carrying only
    // the axis it was written in. Deriving the other one here would put a second
    // implementation of that conversion in this package, which is exactly what
    // depending on `ir-spectrum` is meant to avoid.
    throw new Error(
      `${describeSource(fileName)} is two columns of numbers, which this viewer cannot read yet: ir-spectrum derives the absorbance and transmittance pair for JCAMP-DX and SPC but not for plain text, and this package deliberately does not do that conversion itself. Export the spectrum as JCAMP-DX (.jdx) instead.`,
    );
  }

  throw new Error(
    `${describeSource(fileName)} is not a spectrum this viewer can read — JCAMP-DX (.jdx, .dx) and Thermo Galactic SPC (.spc) are understood.`,
  );
}
