import { existsSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

/**
 * Every file of a built site, by its path from the root, written with `/`.
 *
 * The build does not change while the server runs, so the list is read once,
 * and only a file on it is ever served: a path that climbs out of the root
 * names nothing on the list.
 * @param root - The directory the build wrote, e.g. `dist`.
 * @returns The paths, e.g. `titration.html` and `assets/index-a1b2.js`, or
 * `undefined` when the directory does not exist.
 */
export async function listSiteFiles(
  root: string,
): Promise<Set<string> | undefined> {
  if (!existsSync(root)) return undefined;
  const entries = await readdir(root, { recursive: true, withFileTypes: true });
  const files = new Set<string>();
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    files.add(
      relative(root, join(entry.parentPath, entry.name)).split(sep).join('/'),
    );
  }
  return files;
}

/**
 * The file that answers an address, as the static hosts of the family answer
 * it: `/titration` is `titration.html` (never a redirect to `/titration/`),
 * `/` and `/fr/` are their `index.html`, and any other file is itself.
 * @param files - The files of the site, from {@link listSiteFiles}.
 * @param pathname - The address, without its query, e.g. `/titration`.
 * @returns The file, or `undefined` when the site has no such page.
 */
export function resolveAddress(
  files: ReadonlySet<string>,
  pathname: string,
): string | undefined {
  let path: string;
  try {
    path = decodeURIComponent(pathname);
  } catch {
    return undefined;
  }
  const local = path.replace(/^\/+/, '');
  const candidates =
    local === '' || local.endsWith('/')
      ? [`${local}index.html`]
      : [local, `${local}.html`, `${local}/index.html`];
  return candidates.find((candidate) => files.has(candidate));
}

/**
 * Whether a file is a bundle named by its content, which a browser may keep
 * for a year: everything under an `assets` directory.
 * @param file - The file, from the root.
 * @returns True for a hashed bundle.
 */
export function isHashedBundle(file: string): boolean {
  return file.startsWith('assets/') || file.includes('/assets/');
}
