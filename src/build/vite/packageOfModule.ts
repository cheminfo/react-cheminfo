/**
 * Which package a module of a bundle belongs to, whether it was installed
 * under a `node_modules` or linked from a checkout.
 */

import { existsSync } from 'node:fs';
import { dirname, isAbsolute, join, relative } from 'node:path';

/**
 * The folder of the package a module belongs to: the innermost one under a
 * `node_modules`, else, for a module on disk outside every `node_modules` (a
 * package linked from a checkout), the nearest folder above it holding a
 * `package.json` — unless that is the project itself or a folder holding it,
 * whose modules are the project's own.
 * @param id - The module's id, as the bundle names it.
 * @param project - The project being built.
 * @param nearest - The package folder found above each folder already climbed.
 * @returns The folder, or `undefined` for a module of no package.
 */
export function packageDirectoryOf(
  id: string,
  project: string,
  nearest: Map<string, string | null>,
): string | undefined {
  const installed = PACKAGE_DIRECTORY.exec(id)?.groups?.directory;
  if (installed !== undefined) return installed;
  const [path = ''] = id.split('?');
  if (!isAbsolute(path)) return undefined;
  const directory = packageAbove(dirname(path), nearest);
  if (directory === null || isWithin(project, directory)) return undefined;
  return directory;
}

/** The folder of the package a module belongs to, the innermost one. */
const PACKAGE_DIRECTORY =
  /^(?<directory>.*\/node_modules\/(?:@[^/]+\/)?[^/]+)\//;

/**
 * The nearest folder holding a `package.json`, from a folder up.
 * @param start - The folder to climb from.
 * @param nearest - The answer for each folder already climbed.
 * @returns The folder, or `null` when none above holds one.
 */
function packageAbove(
  start: string,
  nearest: Map<string, string | null>,
): string | null {
  const known = nearest.get(start);
  if (known !== undefined) return known;
  const parent = dirname(start);
  const found = existsSync(join(start, 'package.json'))
    ? start
    : parent === start
      ? null
      : packageAbove(parent, nearest);
  nearest.set(start, found);
  return found;
}

/**
 * Whether a path is a folder or lies inside it.
 * @param path - The path.
 * @param folder - The folder.
 * @returns `true` for the folder itself or anything under it.
 */
function isWithin(path: string, folder: string): boolean {
  const way = relative(folder, path);
  return way === '' || (!way.startsWith('..') && !isAbsolute(way));
}
