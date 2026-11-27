/**
 * Which reader a dropped infrared file belongs to, decided from the file itself.
 *
 * The extension is the least reliable thing about a spectrum file: instruments
 * export JCAMP as `.txt`, LIMS systems rename everything to `.dat`, and a user
 * pasting into a text box has no extension at all. So the content decides and
 * the name is consulted only when the content stayed silent.
 */

import {
  formatFromExtension,
  readFileHeader,
  stripByteOrderMark,
} from '../../format/core/fileHeader.ts';

import type { IrFormat } from './irSpectrum.ts';

/** What a file is recognised as from its own bytes, or else from its name. */
export type DetectedIrFormat = Extract<IrFormat, 'jcamp' | 'spc' | 'text'>;

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
const EXTENSIONS = new Map<string, DetectedIrFormat>([
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
): DetectedIrFormat | 'unknown' {
  if (isSpc(data)) return 'spc';

  const header = stripByteOrderMark(
    readFileHeader(data, HEADER_BYTES),
  ).trimStart();
  if (header.startsWith('##')) return 'jcamp';

  const named = formatFromExtension(EXTENSIONS, fileName);
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
