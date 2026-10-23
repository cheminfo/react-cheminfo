/**
 * What a tool server's answer carries for a chat to show it: the link to the
 * site's page people share, and the `meta` naming that page framed on this
 * server — its card inline, the page itself over the full screen.
 */

import { embedMeta } from 'cheminfo-mcp-server';

import type { CardPageOptions } from '../card/core/cardPageUrl.ts';
import { cardPageUrl, framedPageUrl } from '../card/core/cardPageUrl.ts';
import { formatQueryString } from '../router/core/query.ts';

import type { AnswerAddressesInput } from './answerAddresses.ts';
import { joinAddress } from './answerAddresses.ts';

/** How {@link cardMeta} writes the card and the page. */
export interface CardMetaOptions extends CardPageOptions {
  /**
   * The longest card address an answer carries. Browsers take far more, but a
   * proxy reading the request line stops at 8 to 16 KB; past this length the
   * answer carries no card, and the chat draws the answer itself.
   * @default 8000
   */
  maxLength?: number;
}

/** The page an answer is shown on. */
export interface PageAnswer {
  /** The page on the static site people share: what `result.link` says. */
  link: string;
  /**
   * The answer's `meta`: the card on this server, framed inline, and the same
   * page whole for when the reader asks for more. Undefined when the card's
   * address would be longer than `maxLength`.
   */
  meta: Record<string, unknown> | undefined;
}

/**
 * What an answer carries for the view to show a page of this server: inline
 * its card, drawing only the answer; over the full screen the page itself.
 * Both are without the site's chrome, and without the parts `hide` names.
 * @param addresses - Where the site and this server are; only this server's
 *   is read.
 * @param page - The page from the site's own root, with its own query and
 *   without `embed`, `hide` or `card`: `/titration?ind=phenolphthalein`.
 * @param options - The parts left out, what the card draws, and the longest
 *   card address carried.
 * @returns The answer's `meta`, or undefined when the card's address is too
 *   long to carry.
 */
export function cardMeta(
  addresses: AnswerAddressesInput,
  page: string,
  options: CardMetaOptions = {},
): Record<string, unknown> | undefined {
  const { maxLength = 8000, ...written } = options;
  const framed = joinAddress(addresses.publicUrl, page);
  const card = cardPageUrl(framed, written);
  if (card.length > maxLength) return undefined;
  return embedMeta(card, { page: framedPageUrl(framed, written) });
}

/**
 * A page with its query: the link people share, on the static site, and the
 * `meta` the view frames this server's copy of it with. The query is written
 * by `formatQueryString`, so a `+` is escaped, a comma stays a comma, and a
 * parameter left `undefined` or empty is not written: the page reads its own
 * default.
 * @param addresses - Where the site and this server are.
 * @param path - The page, from the site's own root: `/titration`.
 * @param params - Its query, in the order it is written.
 * @param options - The parts left out, what the card draws, and the longest
 *   card address carried.
 * @returns The link and the meta.
 */
export function pageAnswer(
  addresses: AnswerAddressesInput,
  path: string,
  params: Readonly<Record<string, string | undefined>> = {},
  options: CardMetaOptions = {},
): PageAnswer {
  const query = formatQueryString(params);
  const page = query === '' ? path : `${path}?${query}`;
  return {
    link: joinAddress(addresses.siteUrl, page),
    meta: cardMeta(addresses, page, options),
  };
}
