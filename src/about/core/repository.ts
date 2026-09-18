/**
 * What can be linked to inside a repository, and when.
 *
 * Only GitHub has the addresses the About page builds — a release tag, a
 * commit — and only a repository a visitor can open is worth pointing them at.
 */

/** Where our repositories live, and the only host whose paths we know. */
const GITHUB = 'https://github.com/';

/**
 * The sources as a base a release or a commit can be appended to.
 * @param repository - Where the sources live.
 * @returns The address without its trailing slash, or `undefined` when it is
 * not a GitHub repository and nothing inside it can be addressed.
 */
export function githubSources(repository: string): string | undefined {
  const sources = repository.endsWith('/')
    ? repository.slice(0, -1)
    : repository;
  return sources.startsWith(GITHUB) ? sources : undefined;
}
