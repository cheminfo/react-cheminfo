/**
 * A directory's `package.json`, read under Node with nothing else loaded, so a
 * server can ask for its version without pulling the build in.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * The `package.json` a directory holds, parsed.
 * @param directory - The directory.
 * @returns Its fields, or `undefined` when there is none or it does not parse.
 */
export function readManifest(
  directory: string,
): Record<string, unknown> | undefined {
  try {
    return JSON.parse(
      readFileSync(join(directory, 'package.json'), 'utf8'),
    ) as Record<string, unknown>;
  } catch {
    return undefined;
  }
}

/**
 * The version a directory's `package.json` states.
 * @param directory - The directory.
 * @returns The version, or `undefined` when it states none.
 */
export function manifestVersion(directory: string): string | undefined {
  const version = readManifest(directory)?.version;
  return typeof version === 'string' && version.length > 0
    ? version
    : undefined;
}
