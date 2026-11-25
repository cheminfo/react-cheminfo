import { fromEvent } from 'file-selector';

/** What a drop gave. */
export interface DroppedFiles {
  /**
   * The files: every file of the drop, those inside dropped folders included,
   * or the drop's own list when a folder could not be walked.
   */
  files: File[];
  /**
   * Why a dropped folder could not be walked, when it could not: `files` is
   * then the list the browser gave, a folder there a file of no bytes.
   * @default undefined — every folder was walked
   */
  unread?: Error;
}

/**
 * Every file of a drop, the files inside dropped folders included, each named
 * by its path inside the drop when that is not its own name: `a/b.tif` for the
 * file `b.tif` of a dropped folder `a`. The system files a folder carries,
 * `.DS_Store` and `Thumbs.db`, are left out.
 *
 * Call it while the drop event is handled: the browser lets the drop's items,
 * and its own list of files, be read only then; the folders are walked
 * afterwards. When a dropped folder cannot be walked, or the walk finds no
 * file in it, the drop is what the browser listed — a folder there is a file
 * of no bytes, which the reader says it cannot open —, so every drop hands
 * over something and every page that takes one says the same.
 * @param transfer - The drop's data.
 * @returns The files, a folder's in the order its reader lists them, and why a
 * folder could not be walked when it could not.
 */
export async function filesOfDrop(
  transfer: DataTransfer,
): Promise<DroppedFiles> {
  const listed = Array.from(transfer.files);
  let found: Awaited<ReturnType<typeof fromEvent>>;
  try {
    found = await fromEvent({ type: 'drop', dataTransfer: transfer });
  } catch (error) {
    // A walk the browser refuses, or an item the walker cannot read, settles
    // the drop with the browser's own list and says why.
    return {
      files: listed,
      unread: error instanceof Error ? error : new Error(String(error)),
    };
  }
  const files: File[] = [];
  for (const item of found) {
    if (!(item instanceof File)) continue;
    const path = item.relativePath.replace(/^\.?\//, '');
    files.push(
      path === '' || path === item.name
        ? item
        : new File([item], path, {
            type: item.type,
            lastModified: item.lastModified,
          }),
    );
  }
  return { files: files.length > 0 ? files : listed };
}
