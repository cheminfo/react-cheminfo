import { UNRELEASED_VERSION } from '../build/core/buildInfo.ts';
import { findRepositoryRoot } from '../build/vite/buildInfo.ts';
import { manifestVersion } from '../build/vite/manifest.ts';

/**
 * The release a server's repository is at, as release-please writes it.
 *
 * Read from the `package.json` at the repository root, found by the same
 * climbing rule `cheminfoBuildInfo` follows: a `backend` or `server` directory
 * keeps the `0.0.0` it was scaffolded with, or none at all, while the root is
 * the manifest a release bumps. A manifest that cannot be read is not a reason
 * to refuse to start, so it reads as unreleased instead.
 *
 *   const version = readRepositoryVersion(import.meta.dirname);
 * @param fromDirectory - Where to start climbing, usually the server's own
 * directory.
 * @returns The version, or `'0.0.0'` when the root manifest carries none.
 */
export function readRepositoryVersion(fromDirectory: string): string {
  return (
    manifestVersion(findRepositoryRoot(fromDirectory)) ?? UNRELEASED_VERSION
  );
}
