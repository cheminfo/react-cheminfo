import { errorMessage } from '../../error/core/toError.ts';

import type { SavedDocument, SavedDocuments } from './createSavedDocuments.ts';
import type { Cell, DocumentFile } from './documentFile.ts';
import type { SaveFormat } from './documentSaverTypes.ts';
import { freeFileName, writeFile } from './fileAccess.ts';
import type { SiteFolder } from './siteFolderTypes.ts';

/** What moving documents out of this browser did. */
export type MoveOutcome =
  | {
      kind: 'moved';
      /** How many documents are now files of the folder. */
      count: number;
      /** The folder they went to, the chosen one first. */
      folder: readonly string[];
    }
  /** The visitor picked no folder, or refused to let the page write it. */
  | { kind: 'cancelled' }
  /** This browser keeps no folder of the computer. */
  | { kind: 'unavailable' }
  /**
   * One could not be written: it and the ones after it stay in the browser.
   * Its `name` is the one it is saved under in the browser.
   */
  | { kind: 'failed'; count: number; name: string; message: string };

/** What {@link moveToFolder} moves, and where. */
export interface MoveToFolderOptions<D> {
  /** The site's folder: the one open in the panel receives the files. */
  folder: SiteFolder;
  /** The documents saved in this browser. */
  store: SavedDocuments<D>;
  /** The format the files are written in, the site's usual one. */
  format: SaveFormat<D>;
  /** Where the document on screen is kept, moved with it when it is one. */
  file: Cell<DocumentFile<D> | null>;
  /**
   * The documents to move, by their identifier.
   * @default every document saved in this browser
   */
  ids?: readonly string[];
}

/**
 * Move documents saved in this browser to the site's folder on this
 * computer: each becomes a file under its own name, numbered when another
 * file takes it, and leaves the browser once the file is written. The one on
 * screen stays on screen, and Save then writes over its file. Call it from a
 * click: the browser asks for the folder, or for leave to write it, only then.
 * @param options - See {@link MoveToFolderOptions}.
 * @returns What was done.
 */
export async function moveToFolder<D>(
  options: MoveToFolderOptions<D>,
): Promise<MoveOutcome> {
  const { folder, store, format, file, ids } = options;
  const directory = await folder.writable();
  if (directory === null) return { kind: 'cancelled' };
  if (directory === undefined) return { kind: 'unavailable' };
  const wanted = ids ? new Set(ids) : undefined;
  const listed = await store.list();
  const documents = listed.filter(
    (document) => !wanted || wanted.has(document.id),
  );
  let count = 0;
  for (const document of documents) {
    try {
      // eslint-disable-next-line no-await-in-loop -- one at a time: each name must be free of the files written before, and a failure leaves the rest in the browser
      const handle = await moveOne(directory, document, format, store);
      const kept = file.peek();
      if (kept?.savedId === document.id) {
        file.value = { name: handle.name, handle, saved: kept.saved };
      }
    } catch (error) {
      folder.changed();
      const message = errorMessage(error);
      return { kind: 'failed', count, name: document.name, message };
    }
    count++;
  }
  folder.changed();
  const root = await folder.current();
  return {
    kind: 'moved',
    count,
    folder: [root?.name ?? directory.name, ...folder.path()],
  };
}

// Write one document as a file of the folder, under a name no file takes
// yet, then forget it in the browser.
async function moveOne<D>(
  directory: FileSystemDirectoryHandle,
  document: SavedDocument<D>,
  format: SaveFormat<D>,
  store: SavedDocuments<D>,
): Promise<FileSystemFileHandle> {
  const name = await freeFileName(directory, document.name, format.extension);
  const handle = await directory.getFileHandle(name, { create: true });
  await writeFile(handle, async () =>
    format.write(document.data, undefined, name),
  );
  await store.remove(document.id);
  return handle;
}
