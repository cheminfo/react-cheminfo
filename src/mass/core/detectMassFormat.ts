/**
 * Which reader a dropped file belongs to, decided from the file itself.
 *
 * The extension is the least reliable thing about a spectrum file: instruments
 * export JCAMP as `.txt`, LIMS systems rename everything to `.dat`, and a user
 * pasting into a text box has no extension at all. So the content decides and
 * the name is consulted only when the content stayed silent.
 */

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

/**
 * The one decoder the header is read through, kept because a drop of fifty
 * files would otherwise build fifty of them for four kilobytes each.
 */
const DECODER = new TextDecoder();

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
  const header = stripByteOrderMark(readHeader(data)).trimStart();
  if (header.startsWith('##')) return 'jcamp';

  const named = formatFromExtension(fileName);
  if (named !== undefined && named !== 'text') return named;
  if (header.length === 0) return 'unknown';
  // A binary file decodes to replacement characters; a peak list decodes to
  // digits. Telling them apart on the decode is what stops a stray `.raw` from
  // reaching the text reader and being told it holds no columns of numbers.
  if (header.includes('�') || header.includes('\0')) return 'unknown';
  return 'text';
}

/**
 * The first bytes of the file, as text.
 * @param data - The file, or the pasted text.
 * @returns The decoded prefix; a byte sequence cut in half at the end decodes
 * to a replacement character, which the marker looked for does not contain.
 */
function readHeader(data: Uint8Array | string): string {
  if (typeof data === 'string') return data.slice(0, HEADER_BYTES);
  return DECODER.decode(data.subarray(0, HEADER_BYTES));
}

/**
 * Drop a leading UTF-8 byte order mark.
 *
 * This is the whole reason the header is normalised before it is tested: a
 * `U+FEFF` in front of `##TITLE=` makes a plain `startsWith('##')` fail, and a
 * JCAMP carrying one then goes silently to the text reader, which reads its
 * records as unparsable lines and reports two columns of nothing.
 * @param header - The decoded prefix.
 * @returns The prefix without its mark.
 */
function stripByteOrderMark(header: string): string {
  return header.startsWith('﻿') ? header.slice(1) : header;
}

/**
 * The format a file name claims, used only once the content has said nothing.
 * @param fileName - The name, when the file has one.
 * @returns The format, or `undefined` when the extension names none.
 */
function formatFromExtension(
  fileName?: string,
): DetectedMassFormat | undefined {
  if (fileName === undefined) return undefined;
  const extension = fileName.split('.').pop();
  if (extension === undefined || extension === fileName) return undefined;
  return EXTENSIONS.get(extension.toLowerCase());
}
