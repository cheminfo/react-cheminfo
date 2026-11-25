/**
 * Stand-ins for what a browser hands a drop handler: the items of a drop, the
 * entries `webkitGetAsEntry` gives for them, and a folder's reader, which lists
 * its entries in batches and ends with an empty one.
 */

/** A file of a drop, as `webkitGetAsEntry` gives it. */
export interface FileEntryStandIn {
  isFile: true;
  isDirectory: false;
  name: string;
  fullPath: string;
  file: (resolve: (file: File) => void) => void;
}

/** A folder of a drop, as `webkitGetAsEntry` gives it. */
export interface FolderEntryStandIn {
  isFile: false;
  isDirectory: true;
  name: string;
  fullPath: string;
  createReader: () => {
    readEntries: (
      resolve: (entries: EntryStandIn[]) => void,
      reject: (error: Error) => void,
    ) => void;
  };
}

/** A file or a folder of a drop. */
export type EntryStandIn = FileEntryStandIn | FolderEntryStandIn;

/**
 * A file entry, whose bytes are its own name.
 * @param path - Where it is in the drop: `/a/b.tif`.
 * @returns The entry.
 */
export function fileEntry(path: string): FileEntryStandIn {
  const name = nameOf(path);
  return {
    isFile: true,
    isDirectory: false,
    name,
    fullPath: path,
    file: (resolve) => {
      resolve(new File([name], name));
    },
  };
}

/**
 * A folder entry, whose reader hands back the batches given, then an empty one.
 * @param path - Where it is in the drop: `/a`.
 * @param batches - Its entries, in the batches the reader hands them back in.
 * @returns The entry.
 */
export function folderEntry(
  path: string,
  batches: readonly EntryStandIn[][],
): FolderEntryStandIn {
  return {
    isFile: false,
    isDirectory: true,
    name: nameOf(path),
    fullPath: path,
    createReader: () => {
      let next = 0;
      return {
        readEntries: (resolve) => {
          resolve(batches[next++] ?? []);
        },
      };
    },
  };
}

/**
 * A folder entry whose reader fails, as it does for a folder the browser may
 * not read: with a DOMException, as browsers fail.
 * @param path - Where it is in the drop: `/a`.
 * @returns The entry.
 */
export function unreadableFolder(path: string): FolderEntryStandIn {
  return {
    isFile: false,
    isDirectory: true,
    name: nameOf(path),
    fullPath: path,
    createReader: () => ({
      readEntries: (_resolve, reject) => {
        reject(new DOMException(`${path} cannot be read`, 'NotReadableError'));
      },
    }),
  };
}

/**
 * The items of a drop holding the entries given.
 * @param entries - What was dropped.
 * @returns The items, each giving its entry, and its file when it is one.
 */
export function itemsOf(entries: readonly EntryStandIn[]) {
  return entries.map((entry) => ({
    kind: 'file',
    webkitGetAsEntry: () => entry,
    getAsFile: () => (entry.isFile ? new File([entry.name], entry.name) : null),
  }));
}

/**
 * The data of a drop holding the entries given, for code reading its items:
 * its own list of files names each entry, a folder being a file of no bytes,
 * as a browser lists it.
 * @param entries - What was dropped.
 * @returns The data.
 */
export function dropOf(entries: readonly EntryStandIn[]): DataTransfer {
  const files = entries.map((entry) =>
    entry.isFile
      ? new File([entry.name], entry.name)
      : new File([], entry.name),
  );
  return { items: itemsOf(entries), files } as unknown as DataTransfer;
}

function nameOf(path: string): string {
  return path.slice(path.lastIndexOf('/') + 1);
}
