/**
 * The other addresses of a framed tool: its own page, opened whole, and its
 * About, framed in turn.
 */

import {
  formatQueryEntries,
  parseQueryEntries,
} from '../../router/core/query.ts';
import { EMBED_PARAM, HIDE_PARAM } from '../../share/core/config.ts';

/**
 * The page a framed tool shows, as a visitor opens it on its own site: the
 * same address without the parameters that framed it.
 * @param url - The framed address, `?embed=1` included.
 * @returns The absolute address, its own parameters kept as written.
 */
export function toolPageUrl(url: string): string {
  const address = new URL(url);
  const entries = parseQueryEntries(address.search).filter(
    ([key]) => key !== EMBED_PARAM && key !== HIDE_PARAM,
  );
  const query = formatQueryEntries(entries);
  return `${address.origin}${address.pathname}${query === '' ? '' : `?${query}`}`;
}

/**
 * The About of a framed tool, framed in turn: who made it, what it is built
 * on and how to cite it, without the site's chrome.
 * @param url - The framed address.
 * @returns The absolute address of the About, framed.
 */
export function toolAboutUrl(url: string): string {
  return new URL(`/about?${EMBED_PARAM}=1`, url).href;
}
