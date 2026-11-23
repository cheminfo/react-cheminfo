import type { DocumentFile } from './documentFile.ts';
import type { SiteFolder } from './siteFolderTypes.ts';

/**
 * Where the document on screen is kept, as far as the page can tell. A
 * browser never hands a page the full path of a file or a folder of the
 * computer: only their names, and where a file sits inside a folder the
 * visitor chose.
 */
export type DocumentPlace =
  /** Saved nowhere: only the site's draft, in this browser, keeps it. */
  | { kind: 'draft' }
  /** Saved in this browser, under a name. */
  | { kind: 'browser'; name: string }
  /** A file in the site's folder on this computer. */
  | {
      kind: 'folder';
      /** The file's name, extension included. */
      name: string;
      /** The chosen folder's name, then the folders inside it. */
      folder: readonly string[];
    }
  /** A file of this computer the visitor picked, outside the site's folder. */
  | { kind: 'file'; name: string }
  /** Downloaded: nothing links the page to the copy any more. */
  | { kind: 'download'; name: string };

/** Where a place is, in the three words a reader needs. */
export type PlaceKind = 'computer' | 'browser' | 'nowhere';

/**
 * Where a document is kept, given the file its saver records.
 * @param file - The file the document on screen is kept in, as the site's
 * saver and draft hold it.
 * @param folder - The site's folder, to say where inside it a file sits.
 * @returns The place.
 */
export async function documentPlace(
  file: DocumentFile<unknown> | null | undefined,
  folder?: SiteFolder,
): Promise<DocumentPlace> {
  if (!file) return { kind: 'draft' };
  if (file.savedId !== undefined) return { kind: 'browser', name: file.name };
  if (!file.handle) return { kind: 'download', name: file.name };
  const path = await pathInFolder(file.handle, folder);
  if (!path) return { kind: 'file', name: file.handle.name };
  return {
    kind: 'folder',
    name: file.handle.name,
    folder: path,
  };
}

/**
 * Whether a place is on this computer, in this browser, or nowhere a reader
 * would find it again.
 * @param place - The place.
 * @returns Its kind.
 */
export function placeKind(place: DocumentPlace): PlaceKind {
  if (place.kind === 'folder' || place.kind === 'file') return 'computer';
  if (place.kind === 'browser') return 'browser';
  return 'nowhere';
}

// The folders leading to a file from the site's folder, the chosen one first.
async function pathInFolder(
  handle: FileSystemFileHandle,
  folder: SiteFolder | undefined,
): Promise<string[] | undefined> {
  const root = await folder?.current();
  if (!root) return undefined;
  try {
    const steps = await root.resolve(handle);
    if (!steps) return undefined;
    return [root.name, ...steps.slice(0, -1)];
  } catch {
    return undefined;
  }
}
