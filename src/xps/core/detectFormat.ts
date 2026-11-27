/**
 * Which reader a dropped file belongs to, decided from the file itself.
 *
 * The extension is the least reliable thing about a surface-analysis file:
 * CasaXPS writes VAMAS as `.vms`, `.npl` and `.txt` depending on which dialog
 * the export went through, instruments hand out JCAMP called `.dat`, and
 * somebody pasting two columns out of a report has no extension at all. So the
 * content decides, and the name is consulted only once the content has stayed
 * silent.
 *
 * Only the head of the file is decoded. Every marker looked for here sits in
 * the first line or two — the VAMAS format line is the standard's own first
 * record, a JCAMP opens on `##TITLE=` — and a survey scan exported as text is
 * megabytes of digits that nothing would be learned from.
 */

import {
  acceptOf,
  formatFromExtension,
  readFileHeader,
  startsJcamp,
  stripByteOrderMark,
} from '../../format/core/fileHeader.ts';

import type { XpsFormat } from './xpsSpectrum.ts';

/** How much of the file the decision is taken on. */
const HEADER_BYTES = 2048;

/**
 * The line every VAMAS file opens on, as the 1988 standard fixes it.
 *
 * The date at its end is left off the comparison. It is part of the standard's
 * own wording rather than of the file's, and a writer that abbreviates it is
 * still handing over a VAMAS file — while nothing else in surface analysis
 * begins with these words.
 */
const VAMAS_MAGIC =
  'VAMAS Surface Chemical Analysis Standard Data Transfer Format';

/**
 * How many lines of numbers make a two-column paste.
 *
 * Two, because one line of numbers is also what the middle of a VAMAS block
 * looks like to anything reading a fragment, and because the text reader needs
 * two points before it has a spectrum at all.
 */
const NUMBER_ROWS = 2;

/**
 * Extensions that name a format outright, once the content has said nothing.
 *
 * A `Map` rather than an object, because the key comes off a file name the user
 * chose: `spectrum.constructor` read out of an object literal answers with a
 * function inherited from `Object.prototype`, which is neither a format nor
 * `undefined` and so passes every check made of it.
 */
const EXTENSIONS = new Map<string, XpsFormat>([
  ['vms', 'vamas'],
  ['vamas', 'vamas'],
  ['npl', 'vamas'],
  ['jdx', 'jcamp'],
  ['dx', 'jcamp'],
  ['jcamp', 'jcamp'],
  ['txt', 'text'],
  ['csv', 'text'],
  ['tsv', 'text'],
  ['xy', 'text'],
]);

/**
 * The extensions the readers know, as a file picker's `accept`: what the
 * picker offers first, while a file it does not name is still read by its
 * content.
 */
export const XPS_FILE_ACCEPT = acceptOf(EXTENSIONS);

/**
 * Decide what a dropped file is, from its first bytes and only then its name.
 *
 * Returns `null` rather than falling back to `'text'` for anything it does not
 * know: a PDF of a report or a screenshot dropped by mistake parses as an empty
 * list, and a reader that answered "no columns of numbers" would send whoever
 * dropped it looking in the wrong place.
 * @param data - The file, or the pasted text.
 * @param fileName - Its name, when it has one.
 * @returns The format, or `null` when nothing in the file names one.
 */
export function detectFormat(
  data: ArrayBuffer | Uint8Array | string,
  fileName?: string,
): XpsFormat | null {
  const header = stripByteOrderMark(
    readFileHeader(data, HEADER_BYTES),
  ).trimStart();
  if (header.startsWith(VAMAS_MAGIC)) return 'vamas';
  if (startsJcamp(header)) return 'jcamp';

  const named = formatFromExtension(EXTENSIONS, fileName);
  if (named !== undefined) return named;
  if (hasNumberColumns(header)) return 'text';
  return null;
}

/**
 * Whether the head of the file reads as columns of numbers.
 *
 * Every field of a line has to be a number, not merely two of them: an
 * instrument report puts its acquisition table above the data, and a row
 * reading `Pass energy 20 eV` holds two numbers among words and is not a
 * spectrum.
 * @param header - The decoded prefix.
 * @returns Whether at least two lines are wholly numeric and hold two columns.
 */
function hasNumberColumns(header: string): boolean {
  const lines = header.split(/\r?\n/);
  let rows = 0;
  for (const line of lines) {
    if (isNumberRow(line)) {
      rows++;
      if (rows === NUMBER_ROWS) return true;
    }
  }
  return false;
}

/**
 * Whether one line is two or more columns of numbers.
 * @param line - The line, as the file wrote it.
 * @returns Whether every field on it is a number and there are at least two.
 */
function isNumberRow(line: string): boolean {
  const fields = line.trim().split(/[\s,;]+/);
  if (fields.length < 2) return false;
  for (const field of fields) {
    if (field.length === 0 || !Number.isFinite(Number(field))) return false;
  }
  return true;
}
