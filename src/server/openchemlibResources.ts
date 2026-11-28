/**
 * OpenChemLib's static resources read in Node, from the installed package:
 * `resources.json` is absent from the package's `exports`, so it is found
 * beside the main entry.
 */

import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { cwd } from 'node:process';

/**
 * The path of `resources.json` beside the openchemlib a folder resolves.
 * @param from - The folder whose `node_modules` is searched.
 * @default from cwd()
 * @returns The absolute path.
 */
export function openchemlibResourcesPath(from: string = cwd()): string {
  const require = createRequire(join(from, 'package.json'));
  return require
    .resolve('openchemlib')
    .replace(/openchemlib\.js$/, 'resources.json');
}

/**
 * OpenChemLib's resources, keyed by path, for `Resources.register`: all of
 * them, or only those a page registers too.
 * @param keep - Prefixes of the keys to keep, e.g. the predictors' tables.
 * @default keep undefined — every resource
 * @param from - The folder whose `node_modules` is searched.
 * @default from cwd()
 * @returns The resources.
 */
export function readOpenchemlibResources(
  keep?: readonly string[],
  from: string = cwd(),
): Record<string, string> {
  const all = JSON.parse(
    readFileSync(openchemlibResourcesPath(from), 'utf8'),
  ) as Record<string, string>;
  return keep === undefined ? all : keptResources(all, keep);
}

/**
 * The entries of `resources.json` whose key starts with one of the prefixes.
 * @param all - Every entry of the file.
 * @param keep - Prefixes of the keys to keep.
 * @returns The entries kept.
 */
export function keptResources(
  all: Record<string, string>,
  keep: readonly string[],
): Record<string, string> {
  const kept: Record<string, string> = {};
  for (const key of Object.keys(all)) {
    if (keep.some((prefix) => key.startsWith(prefix))) {
      kept[key] = all[key] as string;
    }
  }
  return kept;
}
