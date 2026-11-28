/**
 * How each document and draft of a backup is written into its archive and read
 * back: the JSON the site stores, by default, or a file of the site's own — an
 * SVG that opens in any viewer — when the site says how.
 */

import { sanitizeFileName } from '../../download/core/sanitizeFileName.ts';

import type { ArchiveFile } from './backupFiles.ts';

/** How a site writes one document into a backup and reads it back. */
export interface BackupEntryCodec<D> {
  /** The extension of an entry, without its dot, e.g. `svg`. */
  extension: string;
  /**
   * The text an entry holds.
   * @param document - The document.
   * @returns Its text.
   */
  write: (document: D) => string | Promise<string>;
  /**
   * The document an entry holds; a document the site no longer reads is left
   * out of the restore, as is one whose reading throws.
   * @param text - The entry's text.
   * @returns The document, or undefined.
   */
  read: (text: string) => D | undefined | Promise<D | undefined>;
  /**
   * The name an entry goes by when its draft was kept in no file, such as a
   * drawing's formula.
   * @default undefined — `draft`
   */
  name?: (document: D) => string | undefined;
}

/** Each entry the JSON the site stores, read again by the site's own reader. */
export const JSON_ENTRIES: BackupEntryCodec<unknown> = {
  extension: 'json',
  write: (document) => JSON.stringify(document),
  read: (text) => JSON.parse(text) as unknown,
};

/**
 * The document an archive file holds, or undefined when there is none or it
 * cannot be read.
 * @param codec - How the site reads an entry.
 * @param file - The file, when the archive holds it.
 * @returns The document.
 */
export async function readBackupEntry<D>(
  codec: BackupEntryCodec<D>,
  file: ArchiveFile | undefined,
): Promise<D | undefined> {
  if (!file) return undefined;
  try {
    return await codec.read(file.text());
  } catch {
    return undefined;
  }
}

/**
 * The file name of an entry, numbered so the archive lists them in order.
 * @param index - Its place among its kind, from 0.
 * @param name - Its name, its extension dropped.
 * @param fallback - The name when it has none.
 * @param extension - The extension it is written with.
 * @returns The file name, e.g. `003-benzene.svg`.
 */
export function numberedEntry(
  index: number,
  name: string,
  fallback: string,
  extension: string,
): string {
  const stem = sanitizeFileName(name.replace(/\.[^.]+$/, ''), fallback);
  return `${String(index + 1).padStart(3, '0')}-${stem}.${extension}`;
}
