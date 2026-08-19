import { firstValues, parseQuery } from '../../share/core/query.ts';

/**
 * The round trip from a slide to a live demo and back.
 *
 * A demo link opens the real tool, so the presenter is then on an ordinary page
 * of an ordinary site with no way back to the talk. One query parameter carries
 * where they came from, which is enough for that page to offer the way back —
 * and, because the site the talk lives on may not be the site the demo runs on,
 * the parameter names both.
 */

/** The query parameter a demo link carries its origin in. */
export const TALK_ORIGIN_PARAM = 'from';

/** Where a demo was opened from. */
export interface TalkOrigin {
  /** Which talk, as the publishing site names it. */
  talkId: string;
  /** Which slide of it, zero-based. */
  slide: number;
  /**
   * The `ECOSYSTEM_SITES` id of the site the talk is published by, for a demo
   * that runs on a different site than the talk.
   * @default undefined — the talk lives on the site the demo runs on
   */
  site?: string;
}

/**
 * Write an origin as the value of the `from` parameter.
 * @param origin - Which talk and slide the demo was opened from.
 * @returns `talk:<site>:<id>:<slide>`, or `talk:<id>:<slide>` when the talk
 *   lives on the site the link points at.
 */
export function formatTalkOrigin(origin: TalkOrigin): string {
  const slide = Math.max(Math.trunc(origin.slide), 0);
  const site = origin.site === undefined ? '' : `${origin.site}:`;
  return `talk:${site}${origin.talkId}:${slide}`;
}

/**
 * Read the origin out of an address's query string.
 *
 * Anything malformed reads as no origin at all: a link retyped from a slide, or
 * one written before the talk was renamed, must still open the tool it points
 * at rather than fail on its way in.
 * @param search - The query string, with or without its leading `?`.
 * @returns The origin, or `null` when the address carries none.
 */
export function parseTalkOrigin(search: string): TalkOrigin | null {
  const value = firstValues(parseQuery(search)).get(TALK_ORIGIN_PARAM);
  if (value === undefined) return null;
  const match = ORIGIN_RE.exec(value);
  const talkId = match?.groups?.talkId;
  const slide = Number.parseInt(match?.groups?.slide ?? '', 10);
  if (talkId === undefined || !Number.isFinite(slide)) return null;
  const site = match?.groups?.site;
  return site === undefined ? { talkId, slide } : { talkId, slide, site };
}

/**
 * Point a demo link at its target, carrying where it was opened from.
 * @param href - The target, relative or absolute, with or without a query.
 * @param origin - Which talk and slide the link sits on.
 * @returns The same address with the `from` parameter added, its own
 *   parameters and its fragment untouched.
 */
export function withTalkOrigin(href: string, origin: TalkOrigin): string {
  const cut = href.indexOf('#');
  const address = cut === -1 ? href : href.slice(0, cut);
  const fragment = cut === -1 ? '' : href.slice(cut);
  const separator = address.includes('?') ? '&' : '?';
  // A colon reads as a colon in these links, and parses back identically.
  const value = encodeURIComponent(formatTalkOrigin(origin)).replaceAll(
    '%3A',
    ':',
  );
  return `${address}${separator}${TALK_ORIGIN_PARAM}=${value}${fragment}`;
}

const ORIGIN_RE =
  /^talk:(?:(?<site>[\da-z-]+):)?(?<talkId>[^:]+):(?<slide>\d+)$/i;
