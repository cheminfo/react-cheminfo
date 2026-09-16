/**
 * Read the commit a build is made from, without running git.
 *
 * The image build cannot run git: `.dockerignore` keeps `.git` out of the
 * context and `node:alpine` ships no git binary, while the shared
 * `docker-image` workflow passes no build argument a commit could arrive in.
 * What a site does instead is let three paths back into the context —
 * `.git/HEAD`, `.git/refs` and `.git/packed-refs`, a few kilobytes — and those
 * three are enough to resolve the hash by reading files.
 */

import { readFileSync } from 'node:fs';
import { dirname, isAbsolute, join, resolve } from 'node:path';

/**
 * The commit `HEAD` names, read from the repository above a directory.
 * @param start - Where to start looking; every ancestor is tried in turn.
 * @returns The full hash, or `undefined` when the repository is out of reach —
 *   which is what a build sees when the three paths were not let back in.
 */
export function readGitHead(start: string): string | undefined {
  const gitDir = findGitDir(start);
  if (gitDir === undefined) return undefined;

  const head = readText(join(gitDir, 'HEAD'));
  if (head === undefined) return undefined;

  // A checkout made by `actions/checkout` is detached, so `HEAD` is the hash
  // itself and neither `refs` nor `packed-refs` is read at all.
  if (!head.startsWith('ref:')) return asCommit(head);

  const ref = head.slice('ref:'.length).trim();
  const loose = readText(join(gitDir, ref));
  return (
    asCommit(loose) ??
    commitInPackedRefs(readText(join(gitDir, 'packed-refs')), ref)
  );
}

/**
 * The commit named by the environment, for a build that cannot see `.git`.
 * @returns The hash, or `undefined` when no variable names one.
 */
export function commitFromEnvironment(): string | undefined {
  return (
    asCommit(process.env.GITHUB_SHA) ??
    asCommit(process.env.SOURCE_COMMIT) ??
    asCommit(process.env.GIT_COMMIT)
  );
}

/**
 * The `.git` directory governing a path.
 * @param start - Where to start looking.
 * @returns Its absolute path, or `undefined` when there is none above `start`.
 */
export function findGitDir(start: string): string | undefined {
  let directory = resolve(start);

  for (;;) {
    const candidate = join(directory, '.git');
    const text = readText(candidate);
    // A worktree and a submodule write a file naming the real directory; a
    // plain repository has the directory itself, which reads as `undefined`.
    if (text?.startsWith('gitdir:')) {
      const target = text.slice('gitdir:'.length).trim();
      return isAbsolute(target) ? target : resolve(directory, target);
    }
    if (readText(join(candidate, 'HEAD')) !== undefined) return candidate;

    const parent = dirname(directory);
    if (parent === directory) return undefined;
    directory = parent;
  }
}

/**
 * The hash a packed `refs` file gives a ref.
 * @param packed - The contents of `packed-refs`, when there is one.
 * @param ref - The ref to look up, e.g. `refs/heads/main`.
 * @returns The hash, or `undefined` when the file does not carry the ref.
 */
function commitInPackedRefs(
  packed: string | undefined,
  ref: string,
): string | undefined {
  if (packed === undefined) return undefined;

  for (const line of packed.split('\n')) {
    // `#` is the header and `^` the object a tag points at: neither is a ref.
    if (line.startsWith('#') || line.startsWith('^')) continue;
    const space = line.indexOf(' ');
    if (space === -1 || line.slice(space + 1).trim() !== ref) continue;
    return asCommit(line.slice(0, space));
  }

  return undefined;
}

function asCommit(value: string | undefined): string | undefined {
  const text = value?.trim();
  return text !== undefined && COMMIT.test(text) ? text : undefined;
}

function readText(path: string): string | undefined {
  try {
    return readFileSync(path, 'utf8').trim();
  } catch {
    return undefined;
  }
}

// Forty hexadecimal characters, or sixty-four in a repository on sha256.
const COMMIT = /^[\da-f]{40}(?:[\da-f]{24})?$/;
