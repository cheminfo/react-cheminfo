/**
 * What a deployed page can say about itself: which release it is, when it was
 * built, and from which commit.
 *
 * A site of ours is a link somebody handed out in a course, so the first
 * question a report raises is *which one of these is running*. The record is
 * filled by the build rather than written by hand — a version a human types
 * into a source file is a version that is wrong by the next release.
 */
export interface BuildInfo {
  /** The released version, from the package.json at the repository root. */
  version: string;
  /** When the build ran, as an ISO instant to the second: `2026-09-16T09:41:07Z`. */
  builtAt: string;
  /**
   * The full commit the build was made from.
   * @default undefined — the build could not see the repository
   */
  commit?: string;
  /**
   * The version of `react-cheminfo` the site is built against, which is what
   * says whether a site is running the current chrome.
   * @default undefined — the build could not read it
   */
  reactCheminfo?: string;
}

/**
 * The version a build reports when the repository has never been released.
 *
 * release-please writes the version into the root `package.json`, so a site
 * whose first release has not happened yet is built from the `0.0.0` it was
 * scaffolded with. That is not a version anybody can look up, so nothing shows
 * it: a page saying `0.0.0` reads as a bug rather than as a release.
 */
export const UNRELEASED_VERSION = '0.0.0';

/**
 * The version to show a reader, if there is one.
 * @param build - What the build published about itself, or `undefined`.
 * @returns The released version, or `undefined` when the build published none
 * or has never been released.
 */
export function releasedVersion(
  build: BuildInfo | undefined,
): string | undefined {
  const version = build?.version;
  if (version === undefined || version === UNRELEASED_VERSION) return undefined;
  return version;
}

/**
 * The commit as it is written for a reader.
 * @param commit - The full hash.
 * @returns Its first seven characters, which is what git itself shows.
 */
export function shortCommit(commit: string): string {
  return commit.slice(0, SHORT_COMMIT_LENGTH);
}

/**
 * The build instant as it is read on the page.
 * @param builtAt - The ISO instant the build wrote.
 * @returns The day and the time, in UTC, e.g. `2026-09-16 09:41:07 UTC`.
 */
export function formatBuiltAt(builtAt: string): string {
  const seconds = builtAt.slice(0, SECOND_LENGTH).replace('T', ' ');
  return `${seconds} UTC`;
}

const SHORT_COMMIT_LENGTH = 7;
const SECOND_LENGTH = 19;
