/**
 * A handful of dropped files, read into spectra one after the other.
 *
 * Sequential on purpose, and that is the whole reason this is not three lines
 * inside the drop handler: each file is read against the colours the ones before
 * it took, so dropping a sputtered sample and its as-received reference in one
 * gesture gives two spectra of two colours rather than two of the same blue.
 * Reading them in parallel would hand the same free hue to every one of them.
 */

import { loadSpectra } from '../core/loadSpectra.ts';
import type { XpsSpectrum } from '../core/xpsSpectrum.ts';

/** What the colours already on the chart are, and how much of a file to read. */
export interface ReadSpectrumFilesOptions {
  /**
   * The colours already taken, so what is dropped onto a chart that already
   * holds spectra is drawn in a colour of its own.
   * @default []
   */
  taken?: readonly string[];
  /**
   * How many blocks of a multi-block file to keep.
   * @default the reader's own limit
   */
  maxSpectra?: number;
}

/** What came out of one drop. */
export interface ReadSpectrumFilesResult {
  /** The spectra, ready to draw. Empty when nothing could be read. */
  spectra: XpsSpectrum[];
  /**
   * What to tell whoever dropped them, `null` when every file was read whole.
   * One sentence for the whole gesture rather than one per file: a drop is a
   * single act, and five refusals stacked up read as a broken viewer.
   */
  error: string | null;
}

/**
 * Read every dropped file, in the order they were given.
 * @param files - The files, as the drop or the file chooser handed them over —
 * a `FileList` is taken as it comes rather than copied into an array.
 * @param options - The colours in use, and how much of a file to read.
 * @returns The spectra, and whatever could not be read.
 */
export async function readSpectrumFiles(
  files: FileList | readonly File[],
  options: ReadSpectrumFilesOptions = {},
): Promise<ReadSpectrumFilesResult> {
  const { taken = [], maxSpectra } = options;
  const colours = [...taken];
  const spectra: XpsSpectrum[] = [];
  const problems: string[] = [];

  for (const file of files) {
    // eslint-disable-next-line no-await-in-loop -- each file is read against the colours the ones before it took
    const data = await file.arrayBuffer();
    // eslint-disable-next-line no-await-in-loop -- same, and a drop is a handful of files rather than a stream
    const result = await loadSpectra(data, {
      fileName: file.name,
      taken: colours,
      maxSpectra,
    });
    for (const spectrum of result.spectra) {
      spectra.push(spectrum);
      colours.push(spectrum.color);
    }
    if (result.error !== null) problems.push(result.error);
  }

  return { spectra, error: problems.length === 0 ? null : problems.join(' ') };
}
