/**
 * The card of an answer, as its address says it.
 *
 * A chat shows a tool's answer twice: inline, as a card drawing only what the
 * question asked, and over the full screen, as the site's page. The card is
 * that page with `card` in its query, always with `embed`, so the card and
 * the page behind it read the same parameters and can never disagree about
 * what was asked. `card` is read by its presence: `?card` and `?card=1` both
 * ask for it.
 *
 * Pure string work: the page reads these addresses, and the tool server
 * writes them, in Node.
 */

import { parseQueryEntries } from '../../router/core/query.ts';
import { EMBED_PARAM, HIDE_PARAM } from '../../share/core/config.ts';

/** The parameter asking for the answer's card instead of the page. */
export const CARD_PARAM = 'card';

/**
 * Whether an address asks for a card.
 * @param search - The query string, with or without its leading `?`.
 * @returns True when it names `card`, with a value or bare.
 */
export function isCardAddress(search: string): boolean {
  for (const [key] of parseQueryEntries(search)) {
    if (key === CARD_PARAM) return true;
  }
  return false;
}

/**
 * The address a card is at: `globalThis.location`, a `URL`, or any record of
 * the three parts.
 */
export interface CardLocation {
  /** Its origin, e.g. `https://equilibrium.cheminfo.org`. */
  readonly origin: string;
  /** Its path, the mount and a language prefix included. */
  readonly pathname: string;
  /** Its query string, with or without its `?`. */
  readonly search: string;
}

/** How {@link sitePageUrl} tells the card's parameters from the page's. */
export interface SitePageOptions {
  /**
   * The parameters only the site's card reads, beside `card` itself: what a
   * card draws beyond the page, e.g. `['rows']`, `['scale', 'ph']`.
   * @default []
   */
  cardParams?: readonly string[];
  /**
   * Read a `+` in a key as a plus rather than as a space, as
   * `parseQueryEntries` does. A key carries no `+` on any site of the family,
   * so this only matters to a site that writes its own addresses with
   * `URLSearchParams`.
   * @default true
   */
  literalPlus?: boolean;
  /**
   * A parameter the page at a given path does not read, though another page
   * of the site does: a tutorial step reads no InChI, the converter does.
   * @default undefined - nothing beyond `card`, `embed`, `hide` and
   *   `cardParams` is left out
   */
  isCardOnly?: (key: string, pathname: string) => boolean;
}

/**
 * The site's own page a card stands for, with its chrome: the card's address
 * without `card`, `embed`, `hide` and what only the card reads. Every other
 * parameter is kept exactly as it was written, so the `+` of a charged atom
 * stays a plus and the commas of a list stay commas. This is the address an
 * answer's `link` names, and the one the card's Details button opens.
 * @param location - The card's address: `globalThis.location`, or
 *   `new URL(href)` for an address held as text.
 * @param options - What only the site's card reads.
 * @returns The page's absolute address, without a fragment.
 */
export function sitePageUrl(
  location: CardLocation,
  options: SitePageOptions = {},
): string {
  const { cardParams = [], literalPlus = true, isCardOnly } = options;
  const dropped = new Set([CARD_PARAM, EMBED_PARAM, HIDE_PARAM, ...cardParams]);
  const kept: string[] = [];
  const search = location.search.startsWith('?')
    ? location.search.slice(1)
    : location.search;
  for (const part of search.split('&')) {
    const [entry] = parseQueryEntries(part, { literalPlus });
    if (entry === undefined || dropped.has(entry[0])) continue;
    if (isCardOnly?.(entry[0], location.pathname)) continue;
    kept.push(part);
  }
  const query = kept.join('&');
  return `${location.origin}${location.pathname}${query === '' ? '' : `?${query}`}`;
}
