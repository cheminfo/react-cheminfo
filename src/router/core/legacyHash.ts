import { splitAddress } from './address.ts';
import { normalizeBasePath, stripBasePath } from './basePath.ts';

/** How a legacy hash link is turned into the path it means. */
export interface LegacyHashOptions {
  /**
   * Carry the query string of the address over to the path. The share
   * configuration lives there, so an embed stays configured across the move.
   * A query written inside the fragment itself always wins over it.
   * @default true
   */
  keepSearch?: boolean;
}

/** How an address is read when adopting the path a legacy hash link meant. */
export interface AdoptLegacyHashOptions extends LegacyHashOptions {
  /**
   * The path the site is mounted at, so a legacy link to a tool served under
   * one is recognised as sitting on its root.
   * @default ''
   */
  basePath?: string;
}

/**
 * The path a link written before the site routed by path points at.
 *
 * Those links are in course pages, in bookmarks and inside other people's
 * iframes, so they are answered rather than dropped. Only a fragment shaped
 * like a path is one: an anchor such as `#results` names a place inside a page
 * and comes back `null`.
 * @param address - A full address, or the fragment on its own, e.g. `/#/tutorial/3`.
 * @param options - Whether the query string is carried over.
 * @returns The path form of the address, or `null` when it names no page.
 */
export function pathFromLegacyHash(
  address: string,
  options: LegacyHashOptions = {},
): string | null {
  const outer = splitAddress(address);
  if (outer.fragment === '' || !outer.fragment.startsWith('/')) return null;

  const inner = splitAddress(outer.fragment);
  if (inner.path === '/') return null;

  const keepSearch = options.keepSearch ?? true;
  const search = inner.search || (keepSearch ? outer.search : '');
  return search === '' ? inner.path : `${inner.path}?${search}`;
}

/**
 * The address to put in the bar in place of a legacy hash link, before anything
 * reads it.
 *
 * Called once at startup with `location.pathname + location.search +
 * location.hash`, so nothing downstream has to know the site ever routed by the
 * hash. Only a visitor sitting on the site's root is moved: a fragment on a
 * real page is an anchor of that page, not an address of its own.
 * @param address - The address the browser is on.
 * @param options - Whether the query is carried over, and the site's mount path.
 * @returns The address to replace it with, or `null` when there is nothing to adopt.
 */
export function adoptLegacyHashAddress(
  address: string,
  options: AdoptLegacyHashOptions = {},
): string | null {
  const basePath = normalizeBasePath(options.basePath ?? '');
  if (stripBasePath(basePath, splitAddress(address).path) !== '/') return null;

  const path = pathFromLegacyHash(address, options);
  if (path === null) return null;
  if (basePath === '') return path;

  const { path: adopted, search } = splitAddress(path);
  const mounted = `${basePath}${adopted}`;
  return search === '' ? mounted : `${mounted}?${search}`;
}
