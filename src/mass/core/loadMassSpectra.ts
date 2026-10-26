/**
 * One entry point for whatever was dropped, opened or pasted.
 *
 * The format is decided from the bytes and the right reader is called, so a
 * caller hands over a file and gets spectra back without knowing what it turned
 * out to be. Each reader is imported only once the bytes turn out to need it, so
 * a page that never opens a JCAMP never downloads its converter.
 */

import { describeSource } from '../../error/core/index.ts';

import { detectMassFormat } from './detectMassFormat.ts';
import type { LoadedMassSpectrum } from './loadedMassSpectrum.ts';

/**
 * How many spectra one file is read for at most.
 *
 * A JCAMP of a GC/MS run writes a page per scan, thousands of them, and a list
 * of thousands of rows is a list nobody can find anything in. A hundred keeps
 * every file somebody exported deliberately and stops a whole run at its start,
 * where saying so is better than hanging the page.
 */
export const DEFAULT_MAX_SPECTRA = 100;

/** How a file is read. */
export interface LoadMassSpectraOptions {
  /**
   * The file's name, which decides the reader when the content is silent and is
   * carried onto every spectrum read out of it.
   * @default undefined
   */
  fileName?: string;
  /**
   * At most how many spectra are read out of the file.
   * @default DEFAULT_MAX_SPECTRA
   */
  maxSpectra?: number;
}

/** What a file turned out to hold. */
export interface LoadMassSpectraResult {
  /** The spectra it held, in the order the file wrote them. */
  spectra: LoadedMassSpectrum[];
  /** What it turned out to be. */
  format: 'jcamp' | 'text';
  /**
   * How many spectra `maxSpectra` left unread, `0` when none. Reported rather
   * than passed over in silence: a run truncated without a word looks exactly
   * like a run that only held a hundred scans.
   */
  dropped: number;
}

/**
 * Read every mass spectrum a file holds.
 * @param data - The file, as bytes, or the pasted text.
 * @param options - The file's name, and how many spectra to read at most.
 * @returns The spectra, the format they were read from and how many were left
 * unread.
 * @throws {Error} When nothing in the file names a format this can read, or when
 * the reader for that format gave up on it — always with a sentence naming the
 * file.
 */
export async function loadMassSpectra(
  data: Uint8Array | ArrayBuffer | string,
  options: LoadMassSpectraOptions = {},
): Promise<LoadMassSpectraResult> {
  const { fileName, maxSpectra = DEFAULT_MAX_SPECTRA } = options;
  const content = data instanceof ArrayBuffer ? new Uint8Array(data) : data;
  const format = detectMassFormat(content, fileName);
  const named = fileName === undefined ? {} : { fileName };

  if (format === 'jcamp') {
    const { fromJcamp } = await import('./fromJcamp.ts');
    return { ...fromJcamp(content, { ...named, maxSpectra }), format };
  }

  if (format === 'text') {
    const { fromText } = await import('./fromText.ts');
    return { spectra: fromText(content, named), format, dropped: 0 };
  }

  throw new Error(
    `${describeSource(fileName)} is not a spectrum this viewer can read — JCAMP-DX files (.jdx, .dx) and two columns of m/z and intensity (.txt, .csv, .xy) are understood.`,
  );
}
