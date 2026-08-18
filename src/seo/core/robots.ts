/**
 * The crawl policy.
 *
 * Our tools are meant to be found, so only the endpoints are kept out of the
 * index — an API prefix and its documentation are not pages — and each one may
 * say in a comment why, because a policy nobody can read is a policy nobody
 * maintains.
 *
 * Every line of this file is a directive, so nothing an author writes may
 * become one they did not: a path is a single line that says something, and
 * carries no fragment, or it is refused; and a comment is folded onto the one
 * line it is written as.
 */

import { joinBasePath } from '../../router/core/basePath.ts';

import type { SiteFilesOptions } from './siteFiles.ts';
import { mountPathOf, originOf } from './siteFiles.ts';

/** One address kept out of the index, and why. */
export interface RobotsDisallow {
  /**
   * The address prefix, from the site's own root, e.g. `/v1/`. It is a path,
   * on one line, saying something, carrying no `#`, and padded by nothing: a
   * blank one would read as `Disallow: /` and keep the whole site out of the
   * index — RFC 9309 eats the trailing whitespace of a line, so `"   "` is read
   * as nothing at all — one carrying a line break would write whatever follows
   * it as a directive of its own, everything from a `#` onwards is read as a
   * comment, which truncates the path silently, and a padded one is not the
   * address it looks like: `" /v1/"` does not start at the site root, so it is
   * written `Disallow: / /v1/` and matches no address at all, leaving the
   * endpoint crawled by the very line meant to keep it out.
   */
  path: string;
  /**
   * One sentence written as a `#` line above the directive. The `#` is added
   * when it is not already there, every run of whitespace is folded to a single
   * space so the sentence stays on its own line, and a blank one is written as
   * no line at all.
   * @default undefined — the directive is written on its own
   */
  comment?: string;
}

const NEWLINE = /[\n\r]/;

const WHITESPACE = /\s+/g;

/**
 * The crawl policy of the address the site is served at.
 *
 * Every path is written under the mount, so a build published as one tool among
 * several on a shared host allows what it actually answers rather than claiming
 * the whole host. The sitemap is named only because this module also writes it:
 * a `Sitemap:` line pointing at a 404 is reported as an error on every fetch.
 * @param options - The site, its routes, and where it is served.
 * @param disallow - Addresses to keep out of the index, each optionally with
 * the sentence saying why.
 * @returns The `robots.txt` document.
 * @throws {Error} When a disallowed address is blank, spans more than one line,
 * carries a `#` or is padded with whitespace, or when the deployment named an
 * origin that is not an absolute address.
 */
export function robotsTxt(
  options: SiteFilesOptions,
  disallow: ReadonlyArray<string | RobotsDisallow> = [],
): string {
  const mount = mountPathOf(options);
  const lines = ['User-agent: *', `Allow: ${joinBasePath(mount, '/')}`];

  for (const entry of disallow) {
    const rule = typeof entry === 'string' ? { path: entry } : entry;
    const comment =
      rule.comment === undefined ? undefined : commentLine(rule.comment);
    if (comment !== undefined) lines.push(comment);
    lines.push(`Disallow: ${joinBasePath(mount, disallowPath(rule.path))}`);
  }

  lines.push('', `Sitemap: ${originOf(options)}/sitemap.xml`, '');
  return lines.join('\n');
}

function disallowPath(path: string): string {
  if (path === '') {
    throw new Error('a disallowed address is a path, never the empty string');
  }
  if (path.trim() === '') {
    throw new Error(
      `a disallowed address is a path, never blank: ${JSON.stringify(path)}`,
    );
  }
  if (NEWLINE.test(path)) {
    throw new Error(
      `a disallowed address is written on one line: ${JSON.stringify(path)}`,
    );
  }
  if (path.includes('#')) {
    throw new Error(
      `a disallowed address carries no fragment: ${JSON.stringify(path)}`,
    );
  }
  if (path !== path.trim()) {
    throw new Error(
      `a disallowed address is written without padding: ${JSON.stringify(path)}`,
    );
  }
  return path;
}

function commentLine(comment: string): string | undefined {
  const text = comment.replaceAll(WHITESPACE, ' ').trim();
  if (text === '') return undefined;
  return text.startsWith('#') ? text : `# ${text}`;
}
