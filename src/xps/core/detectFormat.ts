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
 * How far into the file a JCAMP record may sit and still name the format.
 *
 * `##TITLE=` is required to be first, but exporters put a comment line or a
 * blank one above it often enough that insisting on the very first line loses
 * real files.
 */
const JCAMP_LINES = 5;

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

/** The one decoder the header is read through, kept rather than rebuilt. */
const DECODER = new TextDecoder();

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
  const header = stripByteOrderMark(readHeader(data)).trimStart();
  if (header.startsWith(VAMAS_MAGIC)) return 'vamas';
  if (startsJcamp(header)) return 'jcamp';

  const named = formatFromExtension(fileName);
  if (named !== undefined) return named;
  if (hasNumberColumns(header)) return 'text';
  return null;
}

/**
 * The first bytes of the file, as text.
 * @param data - The file, or the pasted text.
 * @returns The decoded prefix; a byte sequence cut in half at the end decodes
 * to a replacement character, which no marker looked for here contains.
 */
function readHeader(data: ArrayBuffer | Uint8Array | string): string {
  if (typeof data === 'string') return data.slice(0, HEADER_BYTES);
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
  return DECODER.decode(bytes.subarray(0, HEADER_BYTES));
}

/**
 * Drop a leading UTF-8 byte order mark.
 *
 * This is the whole reason the header is normalised before it is tested: a
 * `U+FEFF` in front of `VAMAS Surface…` makes a plain `startsWith` fail, and
 * the file then goes to whichever reader the extension names, which for a
 * `.txt` export is the text reader reading a VAMAS header as columns.
 * @param header - The decoded prefix.
 * @returns The prefix without its mark.
 */
function stripByteOrderMark(header: string): string {
  return header.startsWith('\uFEFF') ? header.slice(1) : header;
}

/**
 * Whether a JCAMP record opens the file.
 * @param header - The decoded prefix, already trimmed at the front.
 * @returns Whether one of the first lines is a JCAMP label.
 */
function startsJcamp(header: string): boolean {
  const lines = header.split(/\r?\n/);
  const limit = Math.min(lines.length, JCAMP_LINES);
  for (let index = 0; index < limit; index++) {
    const line = (lines[index] as string).trim();
    if (line.startsWith('##')) return true;
    if (line.length > 0 && !line.startsWith('$$')) return false;
  }
  return false;
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

/**
 * The format a file name claims, used only once the content has said nothing.
 * @param fileName - The name, when the file has one.
 * @returns The format, or `undefined` when the extension names none.
 */
function formatFromExtension(fileName?: string): XpsFormat | undefined {
  if (fileName === undefined) return undefined;
  const extension = fileName.split('.').pop();
  if (extension === undefined || extension === fileName) return undefined;
  return EXTENSIONS.get(extension.toLowerCase());
}
