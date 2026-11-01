import {
  BlobReader,
  BlobWriter,
  TextReader,
  Uint8ArrayReader,
  Uint8ArrayWriter,
  ZipReader,
  ZipWriter,
} from '@zip.js/zip.js';

import { toError } from '../../error/core/toError.ts';

/** One file written into a backup archive. */
export interface ArchiveEntry {
  /** Its path in the archive, `/`-separated, e.g. `drawings/benzene.svg`. */
  path: string;
  /** What it holds. */
  content: string | Blob | Uint8Array;
}

/** One file read out of a backup archive. */
export interface ArchiveFile {
  /** Its path in the archive. */
  path: string;
  /** Its bytes. */
  bytes: Uint8Array;
  /**
   * Its bytes read as UTF-8.
   * @returns The text.
   */
  text: () => string;
}

// A backup is a few files written once: the workers zip.js would start are a
// second script to load for no measurable gain, and a CSP that forbids them
// would make the backup fail instead.
const ZIP_OPTIONS = { useWebWorkers: false };

/**
 * The name a backup is downloaded under: the site, then the day it was taken,
 * so several backups sort by date in a downloads folder.
 * @param stem - Names what is backed up, e.g. `draw-cheminfo`.
 * @param extension - The file's extension, without the dot.
 * @param date - When the backup is taken, now when left out.
 * @returns E.g. `draw-cheminfo-backup-2026-11-01.zip`.
 */
export function backupFileName(
  stem: string,
  extension: string,
  date: Date = new Date(),
): string {
  return `${stem}-backup-${date.toISOString().slice(0, 10)}.${extension}`;
}

/**
 * Write files into one ZIP archive, in the order given.
 * @param entries - The files.
 * @returns The archive.
 */
export async function writeArchive(
  entries: readonly ArchiveEntry[],
): Promise<Blob> {
  const writer = new ZipWriter(new BlobWriter('application/zip'), ZIP_OPTIONS);
  for (const { path, content } of entries) {
    // eslint-disable-next-line no-await-in-loop -- entries keep their order in the archive
    await writer.add(path, readerOf(content));
  }
  return writer.close();
}

/**
 * Whether a file is a ZIP archive, read off its first bytes rather than its
 * name: a backup renamed by a mail client is still a backup.
 * @param file - The file.
 * @returns Whether it starts like a ZIP archive.
 */
export async function isArchive(file: Blob): Promise<boolean> {
  const head = new Uint8Array(await file.slice(0, 4).arrayBuffer());
  return (
    head.length === 4 &&
    head[0] === 0x50 &&
    head[1] === 0x4b &&
    ((head[2] === 0x03 && head[3] === 0x04) ||
      (head[2] === 0x05 && head[3] === 0x06))
  );
}

/**
 * Read every file out of a ZIP archive; folders are skipped.
 * @param file - The archive.
 * @returns Its files, in the archive's order.
 * @throws {Error} When the file is not a ZIP archive.
 */
export async function readArchive(file: Blob): Promise<ArchiveFile[]> {
  if (!(await isArchive(file))) {
    throw new Error('This file is not a ZIP archive, so nothing was imported.');
  }
  const reader = new ZipReader(new BlobReader(file), ZIP_OPTIONS);
  try {
    const entries = await reader.getEntries();
    const files: Array<Promise<ArchiveFile>> = [];
    for (const entry of entries) {
      if (entry.directory) continue;
      files.push(
        entry.getData(new Uint8ArrayWriter()).then((bytes) => ({
          path: entry.filename,
          bytes,
          text: () => new TextDecoder().decode(bytes),
        })),
      );
    }
    return await Promise.all(files);
  } catch (error) {
    throw new Error(
      `This archive could not be read (${toError(error).message}), so nothing was imported.`,
      { cause: error },
    );
  } finally {
    await reader.close();
  }
}

/**
 * Read a JSON backup.
 * @param file - The file the visitor picked.
 * @returns What it holds, not yet checked.
 * @throws {Error} When the file is not JSON.
 */
export async function readJsonFile(file: Blob): Promise<unknown> {
  try {
    return JSON.parse(await file.text());
  } catch (error) {
    throw new Error('This file is not JSON, so nothing was imported.', {
      cause: error,
    });
  }
}

function readerOf(
  content: ArchiveEntry['content'],
): TextReader | BlobReader | Uint8ArrayReader {
  if (typeof content === 'string') return new TextReader(content);
  if (content instanceof Blob) return new BlobReader(content);
  return new Uint8ArrayReader(content);
}
