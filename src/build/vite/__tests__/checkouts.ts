/**
 * Checkouts on disk for the build-record tests, carrying only what the build
 * reads, removed after each test.
 */

import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

/** A commit a checkout's HEAD names. */
export const COMMIT = 'a1b2c3d4e5f60718293a4b5c6d7e8f9012345678';
/** Another commit, for a branch the HEAD does not name. */
export const OTHER = '0f1e2d3c4b5a69788796a5b4c3d2e1f001234567';

const made: string[] = [];

/**
 * A checkout on disk, carrying only what the build reads.
 * @param files - Path relative to the root, and what it holds.
 * @returns The root of the checkout.
 */
export function checkout(files: Record<string, string>): string {
  const root = mkdtempSync(join(tmpdir(), 'cheminfo-build-'));
  made.push(root);
  for (const [path, contents] of Object.entries(files)) {
    const target = join(root, path);
    mkdirSync(join(target, '..'), { recursive: true });
    writeFileSync(target, contents);
  }
  return root;
}

/** Remove every checkout made since the last call. */
export function removeCheckouts(): void {
  let root = made.pop();
  while (root !== undefined) {
    rmSync(root, { force: true, recursive: true });
    root = made.pop();
  }
}
