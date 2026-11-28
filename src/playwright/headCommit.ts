/**
 * The commit the checkout stands on, for a browser suite checking the About of
 * a site that has never been released: its build badge names that commit.
 */

import { execFileSync } from 'node:child_process';

/**
 * The short hash of the commit the checkout stands on.
 * @returns Its seven characters, or `null` before the first commit or where
 * there is no git.
 */
export function headCommit(): string | null {
  try {
    return execFileSync('git', ['rev-parse', '--short=7', 'HEAD'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return null;
  }
}
