import { errorMessage } from '../../error/core/toError.ts';

import { isKeptAs } from './documentSaverNames.ts';
import type { SaveOutcome } from './documentSaverTypes.ts';
import { freeFileName } from './fileAccess.ts';
import { missingFolder } from './folderChecks.ts';
import type { SiteFolder } from './siteFolderTypes.ts';

/** What {@link saveInFolder} writes, and where. */
export interface SaveInFolderOptions {
  /** The site's folder: the one open in the panel receives the file. */
  folder: SiteFolder;
  /** The name, without its extension, already one a file system takes. */
  stem: string;
  /** The extension of the format it is written in. */
  extension: string;
  /** Write over a file already going by that name, rather than beside it. */
  replace: boolean;
  /** The file the document on screen is kept in, which Save writes over. */
  kept: FileSystemFileHandle | undefined;
  /** Writes the document into the file. */
  write: (handle: FileSystemFileHandle) => Promise<SaveOutcome>;
}

/**
 * Save a document as a file of the site's folder: under the name asked for
 * when it is free, is the document's own file, or was said to be replaced,
 * else numbered beside it. A folder that is no longer on this computer is
 * named in the failure, since no name could ever be written there.
 * @param options - See {@link SaveInFolderOptions}.
 * @returns What was done; `undefined` when this browser keeps no folder.
 */
export async function saveInFolder(
  options: SaveInFolderOptions,
): Promise<SaveOutcome | undefined> {
  const { folder, stem, extension, replace, kept, write } = options;
  const directory = await folder.writable();
  if (directory === null) return { kind: 'cancelled' };
  if (directory === undefined) return undefined;
  const wanted = `${stem}${extension}`;
  let outcome: SaveOutcome;
  try {
    const name =
      replace || (await isKeptAs(kept, directory, wanted))
        ? wanted
        : await freeFileName(directory, stem, extension);
    const handle = await directory.getFileHandle(name, { create: true });
    outcome = await write(handle);
    folder.changed();
    if (outcome.kind === 'saved') {
      return name === wanted
        ? { ...outcome, target: 'folder' }
        : { ...outcome, target: 'folder', wanted };
    }
  } catch (error) {
    outcome = { kind: 'failed', name: wanted, message: errorMessage(error) };
  }
  if (outcome.kind !== 'failed') return outcome;
  const missing = await missingFolder(directory);
  return missing === undefined
    ? outcome
    : { ...outcome, missingFolder: missing };
}
