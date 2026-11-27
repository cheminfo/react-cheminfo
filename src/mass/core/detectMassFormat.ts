/**
 * Which reader a dropped file belongs to, decided from the file itself.
 *
 * The extension is the least reliable thing about a spectrum file: instruments
 * export JCAMP as `.txt`, LIMS systems rename everything to `.dat`, and a user
 * pasting into a text box has no extension at all. So the content decides and
 * the name is consulted only when the content stayed silent.
 */

import {
  acceptOf,
  formatFromExtension,
  readFileHeader,
  startsJcamp,
  stripByteOrderMark,
} from '../../format/core/fileHeader.ts';

/** What a file can turn out to be, as far as this viewer reads it. */
export type DetectedMassFormat = 'jcamp' | 'text' | 'unknown';

/**
 * How much of the file the decision is taken on.
 *
 * The one marker looked for sits at the very top — `##TITLE=` opens a JCAMP —
 * so reading further would only cost a decode of the whole file.
 */
const HEADER_BYTES = 4096;

/**
 * Extensions that name a format outright, once the content has said nothing.
 *
 * A `Map` rather than an object, because the key comes off a file name the user
 * chose: `spectrum.constructor` read out of an object literal answers with a
 * function inherited from `Object.prototype`, which is neither a format nor
 * `undefined` and so passes every check made of it.
 */
const EXTENSIONS = new Map<string, DetectedMassFormat>([
  ['jdx', 'jcamp'],
  ['dx', 'jcamp'],
  ['jcamp', 'jcamp'],
  ['txt', 'text'],
  ['csv', 'text'],
  ['tsv', 'text'],
  ['xy', 'text'],
  ['asc', 'text'],
  ['dat', 'text'],
]);

/** What the viewer's file input accepts: every extension the table knows. */
export const MASS_FILE_ACCEPT = acceptOf(EXTENSIONS);

/**
 * Decide what a dropped file is, from its first bytes and only then its name.
 *
 * Returns `'unknown'` rather than guessing `'text'` for the two cases the
 * readers cannot survive: nothing at all, and bytes that are plainly not text.
 * Handing either to the text reader produces an empty spectrum and a message
 * about missing columns, which sends whoever dropped the file looking in the
 * wrong place.
 * @param data - The file, or the pasted text.
 * @param fileName - Its name, when it has one.
 * @returns The format, or `'unknown'` when nothing in the file names one.
 */
export function detectMassFormat(
  data: Uint8Array | string,
  fileName?: string,
): DetectedMassFormat {
  const header = stripByteOrderMark(
    readFileHeader(data, HEADER_BYTES),
  ).trimStart();
  if (startsJcamp(header)) return 'jcamp';

  const named = formatFromExtension(EXTENSIONS, fileName);
  if (named !== undefined && named !== 'text') return named;
  if (header.length === 0) return 'unknown';
  // A binary file decodes to replacement characters; a peak list decodes to
  // digits. Telling them apart on the decode is what stops a stray `.raw` from
  // reaching the text reader and being told it holds no columns of numbers.
  if (header.includes('�') || header.includes('\0')) return 'unknown';
  return 'text';
}
