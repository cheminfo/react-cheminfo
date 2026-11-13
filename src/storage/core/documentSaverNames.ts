import type { SavedDocuments } from './createSavedDocuments.ts';
import { nameKey } from './createSavedDocuments.ts';
import type { SaveFormat } from './documentSaverTypes.ts';
import type { SiteFolder } from './siteFolderTypes.ts';

/**
 * The format a file name says it is in: the one whose extension ends it, the
 * longest winning, else the site's usual one.
 * @param formats - The site's formats, the usual one first.
 * @param name - The file name.
 * @returns The format.
 */
export function formatOfName<D>(
  formats: readonly [SaveFormat<D>, ...Array<SaveFormat<D>>],
  name: string,
): SaveFormat<D> {
  const matching = formats.filter((format) => name.endsWith(format.extension));
  return (
    matching.toSorted((a, b) => b.extension.length - a.extension.length)[0] ??
    formats[0]
  );
}

/**
 * A file name without the extension of its format.
 * @param formats - The site's formats.
 * @param name - The file name.
 * @returns The name a document goes by.
 */
export function stemOf<D>(
  formats: readonly [SaveFormat<D>, ...Array<SaveFormat<D>>],
  name: string,
): string {
  const { extension } = formatOfName(formats, name);
  return name.endsWith(extension) ? name.slice(0, -extension.length) : name;
}

/**
 * The names the site's files go by in the folder open in the panel, by key,
 * the one on screen left out.
 * @param folder - The site's folder.
 * @param formats - The site's formats.
 * @param current - The file the document on screen is kept in.
 * @returns The names, without their extension.
 */
export async function namesInFolder<D>(
  folder: SiteFolder,
  formats: readonly [SaveFormat<D>, ...Array<SaveFormat<D>>],
  current: string | undefined,
): Promise<ReadonlyMap<string, string>> {
  const names = new Map<string, string>();
  const files = await folder.list(formats.map((format) => format.extension));
  for (const { name } of files) {
    if (name === current) continue;
    const stem = stemOf(formats, name);
    names.set(nameKey(stem), stem);
  }
  return names;
}

/**
 * The names the documents saved in this browser go by, by key, the one on
 * screen left out.
 * @param saved - The site's saved documents.
 * @param current - The saved document on screen.
 * @returns The names.
 */
export async function namesInBrowser<D>(
  saved: SavedDocuments<D>,
  current: string | undefined,
): Promise<ReadonlyMap<string, string>> {
  const names = new Map<string, string>();
  for (const { id, name } of await saved.list()) {
    if (id !== current) names.set(nameKey(name), name);
  }
  return names;
}

/**
 * Whether the folder's file of that name is the one the document is kept in,
 * which Save writes over rather than beside.
 * @param handle - The file the document is kept in.
 * @param directory - The folder.
 * @param name - The file name asked for.
 * @returns True when it is that file.
 */
export async function isKeptAs(
  handle: FileSystemFileHandle | undefined,
  directory: FileSystemDirectoryHandle,
  name: string,
): Promise<boolean> {
  if (!handle) return false;
  try {
    return await handle.isSameEntry(await directory.getFileHandle(name));
  } catch {
    return false;
  }
}
