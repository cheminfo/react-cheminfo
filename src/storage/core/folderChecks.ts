import { sanitizeFileName } from '../../download/core/sanitizeFileName.ts';

/**
 * The name a document is written under on this computer, before its
 * extension: the one it goes by, without what a file system refuses. A name
 * kept in this browser may carry a time, `07:01`, which no file can.
 * @param name - The name the document goes by.
 * @returns The name of its file.
 */
export function fileStem(name: string): string {
  return sanitizeFileName(name, 'document');
}

/**
 * The name of a folder that is no longer on this computer. A folder moved,
 * renamed or deleted since it was chosen keeps its handle, and every file
 * asked of it is then not found, whatever its name.
 * @param directory - The folder.
 * @returns Its name when it is gone, else `undefined`.
 */
export async function missingFolder(
  directory: FileSystemDirectoryHandle,
): Promise<string | undefined> {
  try {
    await directory.keys().next();
    return undefined;
  } catch (error) {
    return error instanceof DOMException && error.name === 'NotFoundError'
      ? directory.name
      : undefined;
  }
}
