/**
 * Reading what a file is from its first bytes: the decoded head of it, without
 * a byte order mark, and the format its name claims when the content says
 * nothing.
 */

/**
 * The one decoder every header is read through, kept because a drop of fifty
 * files would otherwise build fifty of them for a few kilobytes each.
 */
const DECODER = new TextDecoder();

/**
 * The first bytes of a file, as text.
 * @param data - The file, or the pasted text.
 * @param bytes - How many bytes to read.
 * @returns The decoded prefix; a byte sequence cut in half at the end decodes
 * to a replacement character, which no format marker contains.
 */
export function readFileHeader(
  data: ArrayBuffer | Uint8Array | string,
  bytes: number,
): string {
  if (typeof data === 'string') return data.slice(0, bytes);
  const view = data instanceof Uint8Array ? data : new Uint8Array(data);
  return DECODER.decode(view.subarray(0, bytes));
}

/**
 * Drop a leading UTF-8 byte order mark.
 *
 * This is the whole reason a header is normalised before it is tested: a
 * `U+FEFF` in front of `##TITLE=` or `VAMAS Surface…` makes a plain
 * `startsWith` fail, and the file then goes silently to whichever reader its
 * extension names.
 * @param header - The decoded prefix.
 * @returns The prefix without its mark.
 */
export function stripByteOrderMark(header: string): string {
  return header.startsWith('﻿') ? header.slice(1) : header;
}

/**
 * The format a file name claims, used only once the content has said nothing.
 * @param table - The format each lower-case extension names.
 * @param fileName - The name, when the file has one.
 * @returns The format, or `undefined` when the extension names none.
 */
export function formatFromExtension<Format>(
  table: ReadonlyMap<string, Format>,
  fileName?: string,
): Format | undefined {
  if (fileName === undefined) return undefined;
  const extension = fileName.split('.').pop();
  if (extension === undefined || extension === fileName) return undefined;
  return table.get(extension.toLowerCase());
}
