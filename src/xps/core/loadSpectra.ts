/**
 * The one way into the package: a file or a paste, and spectra come back.
 *
 * Each reader below it has its own idea of failure, because each was written
 * against what its own format does. That difference stops here: nothing above
 * this file should have to know which reader ran, so a malformed file always
 * comes back as a result carrying a sentence addressed to whoever dropped it,
 * and nothing ever throws at the drop handler.
 *
 * `error` is not only for failure. A file whose blocks were capped, or whose
 * peaks could not be detected, comes back with the spectra that were read and a
 * sentence saying what was left out — a fifty-four block experiment silently
 * truncated to a hundred looks exactly like a file that held a hundred.
 */

import { detectFormat } from './detectFormat.ts';
import { pickPeaks } from './pickPeaks.ts';
import type { XpsReadOptions } from './readOptions.ts';
import { describeSource } from './readOptions.ts';
import type { XpsFormat, XpsSpectrum } from './xpsSpectrum.ts';

/** How a file is read. */
export interface LoadSpectraOptions {
  /**
   * Name of the file it came from, absent for a paste. It names the spectra
   * and it is what an error message blames, so it is worth passing.
   * @default undefined
   */
  fileName?: string;
  /**
   * The colours already on the chart, so a file dropped onto spectra that are
   * open is drawn in hues of its own.
   * @default []
   */
  taken?: readonly string[];
  /**
   * How many blocks of a multi-block file to keep.
   *
   * A single VAMAS export of a day's work runs to hundreds of blocks, and a
   * chart holding hundreds of traces is not a chart. A value below one is read
   * as no answer at all and the default stands.
   * @default 100
   */
  maxSpectra?: number;
  /**
   * What identities are built from, instead of a random one each. A caller that
   * passes a prefix gets `prefix-0`, `prefix-1`, one per spectrum.
   * @default undefined
   */
  idPrefix?: string;
}

/** What came out of one file. */
export interface LoadSpectraResult {
  /** The spectra, ready to draw. Empty when nothing could be read. */
  spectra: XpsSpectrum[];
  /** What went wrong or was left out, `null` when the file read whole. */
  error: string | null;
}

/** How many blocks are read when the caller names no limit. */
const DEFAULT_MAXIMUM_SPECTRA = 100;

/**
 * Read whatever was dropped, pasted or opened.
 *
 * The format is worked out from the bytes rather than from the name, and the
 * reader for it is imported only once it is needed — so pasting two columns
 * of numbers never downloads the VAMAS machinery. What comes back is ready to
 * draw: peaks picked, a colour assigned and an identity minted.
 * @param data - The file's bytes, or the text that was pasted.
 * @param options - What it was called, and what is already on the chart.
 * @returns The spectra, and whatever went wrong or was left out.
 */
export async function loadSpectra(
  data: ArrayBuffer | Uint8Array | string,
  options: LoadSpectraOptions = {},
): Promise<LoadSpectraResult> {
  const { fileName, taken = [], idPrefix, maxSpectra } = options;
  const format = detectFormat(data, fileName);
  if (format === null) {
    return {
      spectra: [],
      error: `${describeSource(fileName)} is not a spectrum this reader knows — it takes VAMAS, JCAMP-DX, and two columns of "binding energy counts".`,
    };
  }

  let read: XpsSpectrum[];
  try {
    read = await readSpectra(format, data, { fileName, taken, idPrefix });
  } catch (error) {
    return { spectra: [], error: messageOf(error) };
  }
  if (read.length === 0) {
    return {
      spectra: [],
      error: `${describeSource(fileName)} holds no spectrum this reader could make sense of.`,
    };
  }

  const limit = spectrumLimit(maxSpectra);
  const spectra = read.length > limit ? read.slice(0, limit) : read;
  const error =
    detectPeaks(spectra, fileName) ??
    capped(read.length, spectra.length, fileName);
  return { spectra, error };
}

/**
 * Run the reader the format calls for.
 *
 * Each is imported where it is used rather than at the top of the file, so a
 * page that only ever takes a paste never fetches the VAMAS or the JCAMP
 * reader.
 * @param format - What the bytes were recognised as.
 * @param data - The bytes or the text.
 * @param options - What the reader is told about the file.
 * @returns The spectra it read.
 */
async function readSpectra(
  format: XpsFormat,
  data: ArrayBuffer | Uint8Array | string,
  options: XpsReadOptions,
): Promise<XpsSpectrum[]> {
  switch (format) {
    case 'vamas': {
      const { readVamas } = await import('./fromVamas.ts');
      return readVamas(data, options);
    }
    case 'jcamp': {
      const { readJcamp } = await import('./fromJcamp.ts');
      return readJcamp(data, options);
    }
    case 'text': {
      const { readText } = await import('./fromText.ts');
      return readText(data, options);
    }
    // A calculated spectrum is produced by the viewer, never read from a file.
    case 'calculated':
      return [];
    // no default
  }
}

/**
 * Find the maxima of every spectrum that was kept.
 *
 * The detection runs here rather than in the readers because it is a reading of
 * the data rather than of the file, and because it is only worth doing for the
 * spectra that survived the cap. A detection that fails costs the peaks and not
 * the spectra: a trace nobody can label is still a trace worth looking at.
 * @param spectra - The spectra that were kept.
 * @param fileName - What the file was called.
 * @returns What went wrong, or `null` when nothing did.
 */
function detectPeaks(
  spectra: XpsSpectrum[],
  fileName: string | undefined,
): string | null {
  try {
    for (const spectrum of spectra) {
      spectrum.peaks = pickPeaks(spectrum.energy);
    }
    return null;
  } catch (error) {
    return `${describeSource(fileName)} was read, but its peaks could not be detected: ${messageOf(error)}`;
  }
}

/**
 * What to say about the blocks the cap left unread.
 * @param total - How many the file held.
 * @param kept - How many were read.
 * @param fileName - What the file was called.
 * @returns The sentence, or `null` when the whole file was read.
 */
function capped(
  total: number,
  kept: number,
  fileName: string | undefined,
): string | null {
  if (kept >= total) return null;
  return `${describeSource(fileName)} holds ${total} spectra and the first ${kept} were read — the other ${total - kept} were left unread.`;
}

/**
 * How many spectra to keep, once the caller's answer has been checked.
 * @param maxSpectra - What the caller asked for, when it asked.
 * @returns The limit.
 */
function spectrumLimit(maxSpectra: number | undefined): number {
  if (maxSpectra === undefined || !Number.isFinite(maxSpectra)) {
    return DEFAULT_MAXIMUM_SPECTRA;
  }
  return maxSpectra < 1 ? DEFAULT_MAXIMUM_SPECTRA : Math.floor(maxSpectra);
}

/**
 * What a thrown reader was complaining about.
 * @param error - Whatever was thrown.
 * @returns Its message.
 */
function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
