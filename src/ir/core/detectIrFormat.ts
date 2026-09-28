/**
 * Which reader a dropped infrared file belongs to, decided from the file itself.
 *
 * The extension is the least reliable thing about a spectrum file: instruments
 * export JCAMP as `.txt`, LIMS systems rename everything to `.dat`, and a user
 * pasting into a text box has no extension at all. So the content decides and
 * the name is consulted only when the content stayed silent.
 */

import type { IrFormat } from './irSpectrum.ts';

/**
 * How much of the file the decision is taken on.
 *
 * Every marker looked for here sits in the header — the SPC flag pair in the
 * first two bytes, `##TITLE=` at the very top of a JCAMP. Reading further would
 * only cost a decode of the whole file.
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
const EXTENSIONS = new Map<string, IrFormat>([
  ['jdx', 'jcamp'],
  ['dx', 'jcamp'],
  ['jcamp', 'jcamp'],
  ['spc', 'spc'],
  ['txt', 'text'],
  ['csv', 'text'],
  ['tsv', 'text'],
  ['xy', 'text'],
  ['dpt', 'text'],
]);

/**
 * The one decoder the header is read through, kept because a drop of fifty
 * files would otherwise build a hundred of them for four kilobytes each.
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
export function detectIrFormat(
  data: Uint8Array | string,
  fileName?: string,
): IrFormat | 'unknown' {
  if (isSpc(data)) return 'spc';

  const header = stripByteOrderMark(readHeader(data)).trimStart();
  if (header.startsWith('##')) return 'jcamp';

  const named = formatFromExtension(fileName);
  if (named !== undefined) return named;
  if (header.length === 0) return 'unknown';
  // A binary file the SPC check did not claim decodes to replacement characters;
  // a `.dpt` export of two columns decodes to digits. Telling them apart on the
  // decode is what stops a stray binary from reaching the text reader.
  if (header.includes('\uFFFD') || header.includes('\0')) return 'unknown';
  return 'text';
}

/**
 * Whether the first bytes are an SPC file header.
 *
 * The second byte is the format version, and Thermo Galactic only ever wrote
 * three: `0x4B` for the new LSB-first format, `0x4C` for MSB-first, and `0x4D`
 * for the old format. Checked before anything is decoded, because putting a
 * binary file through a UTF-8 decode turns its header into replacement
 * characters that happen to match nothing — a right answer reached by luck.
 * @param data - The file, or the pasted text.
 * @returns Whether it looks like SPC.
 */
function isSpc(data: Uint8Array | string): boolean {
  // A pasted string is never SPC: the bytes would not have survived the decode.
  if (typeof data === 'string' || data.length < 2) return false;
  return SPC_VERSIONS.has(data[1] as number);
}

/**
 * The format versions Thermo Galactic ever wrote, as the second byte states it.
 *
 * `0x4B` is the current LSB-first format, `0x4C` the MSB-first one, and `0x4D`
 * the old format still exported by instruments of a certain age.
 */
const SPC_VERSIONS = new Set([0x4b, 0x4c, 0x4d]);

/**
 * The first bytes of the file, as text.
 * @param data - The file, or the pasted text.
 * @param length - How many bytes to read, defaulting to the whole header.
 * @returns The decoded prefix; a byte sequence cut in half at the end decodes
 * to a replacement character, which no marker looked for here contains.
 */
function readHeader(data: Uint8Array | string, length = HEADER_BYTES): string {
  if (typeof data === 'string') return data.slice(0, length);
  return DECODER.decode(data.subarray(0, length));
}

/**
 * Drop a leading UTF-8 byte order mark.
 *
 * This is the whole reason the header is normalised before it is tested: a
 * `U+FEFF` in front of `##TITLE=` makes a plain `startsWith('##')` fail, and a
 * BOM-prefixed JCAMP then goes silently to the text reader, which reads its
 * records as unparsable lines and reports two columns of nothing.
 * @param header - The decoded prefix.
 * @returns The prefix without its mark.
 */
function stripByteOrderMark(header: string): string {
  return header.startsWith('\uFEFF') ? header.slice(1) : header;
}

/**
 * The format a file name claims, used only once the content has said nothing.
 * @param fileName - The name, when the file has one.
 * @returns The format, or `undefined` when the extension names none.
 */
function formatFromExtension(fileName?: string): IrFormat | undefined {
  if (fileName === undefined) return undefined;
  const extension = fileName.split('.').pop();
  if (extension === undefined || extension === fileName) return undefined;
  return EXTENSIONS.get(extension.toLowerCase());
}
