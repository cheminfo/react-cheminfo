import type { FolderEntry } from './siteFolderTypes.ts';

/** How deep a search goes below the folder open in the panel. */
const SEARCH_DEPTH = 6;

/** How many files a search reads at most, so a huge folder cannot stall it. */
const SEARCH_LIMIT = 1000;

/**
 * The site's files in a folder, the most recently changed first.
 * @param directory - The folder.
 * @param extensions - What their names end with.
 * @returns The files.
 */
export async function listFiles(
  directory: FileSystemDirectoryHandle,
  extensions: readonly string[],
): Promise<FolderEntry[]> {
  const files: FileSystemFileHandle[] = [];
  for await (const entry of directory.values()) {
    if (entry.kind === 'file' && isSiteFile(entry.name, extensions)) {
      files.push(entry);
    }
  }
  return newestFirst(await Promise.all(files.map((file) => entryOf(file))));
}

/**
 * The folders inside a folder, by name, hidden ones left out.
 * @param directory - The folder.
 * @returns Their names, sorted the way a reader expects.
 */
export async function listFolders(
  directory: FileSystemDirectoryHandle,
): Promise<string[]> {
  const names: string[] = [];
  for await (const entry of directory.values()) {
    if (entry.kind === 'directory' && !entry.name.startsWith('.')) {
      names.push(entry.name);
    }
  }
  return names.toSorted((a, b) =>
    a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }),
  );
}

/**
 * The site's files in a folder and in every folder inside it, each with the
 * path it was found at, the most recently changed first.
 * @param directory - The folder the search starts in.
 * @param extensions - What their names end with.
 * @returns The files, at most {@link SEARCH_LIMIT}.
 */
export async function searchFiles(
  directory: FileSystemDirectoryHandle,
  extensions: readonly string[],
): Promise<FolderEntry[]> {
  const found: Array<{ file: FileSystemFileHandle; path: string[] }> = [];
  const queue: Array<{ handle: FileSystemDirectoryHandle; path: string[] }> = [
    { handle: directory, path: [] },
  ];
  while (queue.length > 0 && found.length < SEARCH_LIMIT) {
    const next = queue.shift();
    if (!next) break;
    // eslint-disable-next-line no-await-in-loop -- folders are read one after the other, so the limit is kept
    for await (const entry of next.handle.values()) {
      if (entry.kind === 'directory') {
        if (!entry.name.startsWith('.') && next.path.length < SEARCH_DEPTH) {
          queue.push({ handle: entry, path: [...next.path, entry.name] });
        }
      } else if (isSiteFile(entry.name, extensions)) {
        found.push({ file: entry, path: next.path });
        if (found.length >= SEARCH_LIMIT) break;
      }
    }
  }
  return newestFirst(
    await Promise.all(
      found.map(async ({ file, path }) => ({ ...(await entryOf(file)), path })),
    ),
  );
}

function isSiteFile(name: string, extensions: readonly string[]): boolean {
  return extensions.some((end) => name.endsWith(end));
}

async function entryOf(handle: FileSystemFileHandle): Promise<FolderEntry> {
  const { lastModified } = await handle.getFile();
  return { name: handle.name, handle, modified: lastModified };
}

function newestFirst(entries: FolderEntry[]): FolderEntry[] {
  return entries.toSorted((a, b) => b.modified - a.modified);
}
