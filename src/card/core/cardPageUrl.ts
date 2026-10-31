/**
 * The two addresses a chat frames for one answer: the card, inline, and the
 * page itself, over the full screen. Both are the site's page under `embed`,
 * so neither carries the site's chrome; the card adds `card` and what only it
 * reads.
 */

import type { QueryEntry } from '../../router/core/query.ts';
import { formatQueryEntries } from '../../router/core/query.ts';
import { EMBED_PARAM, HIDE_PARAM } from '../../share/core/config.ts';

import { CARD_PARAM, ONLY_PARAM } from './cardAddress.ts';

/** How {@link framedPageUrl} frames a page. */
export interface FramedPageOptions {
  /**
   * The parts of the page left out, on the card and on the full page alike:
   * keys of the site's `hide` vocabulary, written `hide=a,b`.
   * @default []
   */
  hide?: readonly string[];
}

/** What {@link cardPageUrl} adds to the framed page. */
export interface CardPageOptions extends FramedPageOptions {
  /**
   * What `card` carries, for a site whose page draws more than one card:
   * wikidata's `card=infobox`.
   * @default '1'
   */
  card?: string;
  /**
   * The facts a precise question asked, written `only=formula,mass` after
   * `card`: the card draws what the answer is about and only those.
   * @default [] - the card draws everything
   */
  only?: readonly string[];
  /**
   * What only the card reads, written after `card` and `only` in the order given, e.g.
   * `{ rows: '10' }`. A value left `undefined` or empty is not written.
   * @default {}
   */
  extra?: Readonly<Record<string, string | undefined>>;
}

/**
 * The page under `embed=1`, and `hide` when parts are left out: what a chat
 * shows over the full screen when the reader asks for more than the card.
 * @param page - The site's page as people open it, with its own query and
 *   without `embed`, `hide` or `card`; absolute, or a path.
 * @param options - The parts left out.
 * @returns The framed page's address.
 */
export function framedPageUrl(
  page: string,
  options: FramedPageOptions = {},
): string {
  const { hide = [] } = options;
  const entries: QueryEntry[] = [[EMBED_PARAM, '1']];
  if (hide.length > 0) entries.push([HIDE_PARAM, hide.join(',')]);
  return withQueryEntries(page, entries);
}

/**
 * The card of an answer: the framed page with `card`, and what only the card
 * reads after it.
 * @param page - The site's page as people open it, with its own query and
 *   without `embed`, `hide` or `card`; absolute, or a path.
 * @param options - The parts left out, and what the card draws.
 * @returns The card's address.
 */
export function cardPageUrl(
  page: string,
  options: CardPageOptions = {},
): string {
  const { card = '1', only = [], extra = {} } = options;
  const entries: QueryEntry[] = [[CARD_PARAM, card]];
  if (only.length > 0) entries.push([ONLY_PARAM, only.join(',')]);
  for (const [key, value] of Object.entries(extra)) {
    if (value !== undefined && value !== '') entries.push([key, value]);
  }
  return withQueryEntries(framedPageUrl(page, options), entries);
}

/**
 * Append parameters to an address, before its fragment.
 * @param address - The address, with or without a query.
 * @param entries - The parameters, in the order they are written.
 * @returns The address carrying them.
 */
function withQueryEntries(
  address: string,
  entries: readonly QueryEntry[],
): string {
  const hashIndex = address.indexOf('#');
  const head = hashIndex === -1 ? address : address.slice(0, hashIndex);
  const fragment = hashIndex === -1 ? '' : address.slice(hashIndex);
  const separator = head.includes('?')
    ? head.endsWith('?') || head.endsWith('&')
      ? ''
      : '&'
    : '?';
  return `${head}${separator}${formatQueryEntries(entries)}${fragment}`;
}
