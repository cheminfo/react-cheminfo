/**
 * What every reader is told, and the two things they all have to decide.
 *
 * A reader is handed a file and gives back spectra ready to draw, which means
 * each one leaves with an identity and a colour. Both are decided here rather
 * than in the three readers: an identity that is a UUID in one reader and a
 * counter in another cannot be pinned by a test, and a colour handed out by
 * each reader from scratch puts two files on the chart in the same blue.
 */

/** What a reader is told about the file it is reading. */
export interface XpsReadOptions {
  /**
   * Name of the file, absent for a paste. It names the spectra and it is what
   * an error message blames, so it is worth passing.
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
   * What identities are built from, instead of a random one each.
   *
   * A UUID is the right identity for a document that is going to be edited and
   * saved, and the wrong one for a test, which cannot assert anything about a
   * spectrum whose id changes every run. A caller that passes a prefix gets
   * `prefix-0`, `prefix-1`, one per spectrum in the order they were read.
   * @default undefined
   */
  idPrefix?: string;
}

/**
 * The identity the spectrum at this position is minted with.
 * @param options - What the reader was told.
 * @param index - Its position among the spectra this read produced.
 * @returns A UUID, or the pinned identity the caller asked for.
 */
export function spectrumIdentity(
  options: XpsReadOptions,
  index: number,
): string {
  const { idPrefix } = options;
  return idPrefix === undefined ? crypto.randomUUID() : `${idPrefix}-${index}`;
}

/**
 * How to refer to what was handed in, in a sentence.
 * @param fileName - What it was called, absent for a paste.
 * @returns The subject of the sentence.
 */
export function describeSource(fileName: string | undefined): string {
  return fileName === undefined ? 'What was pasted' : `"${fileName}"`;
}
