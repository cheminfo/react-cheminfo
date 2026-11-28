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

/**
 * The origin every link of a slide carries, from what the player hands a
 * layout.
 * @param props - The slide's place in its talk.
 * @param props.talkId - How the publishing site names the talk.
 * @param props.slideIndex - Which slide, zero-based.
 * @param props.site - Which site published the deck, when it is played
 *   elsewhere.
 * @returns The origin, naming the site only when one is given.
 */
export function slideOriginOf(props: {
  talkId: string;
  slideIndex: number;
  site?: string;
}): TalkOrigin {
  const { talkId, slideIndex, site } = props;
  return site === undefined
    ? { talkId, slide: slideIndex }
    : { talkId, slide: slideIndex, site };
}

/**
 * Where an address a deck wrote actually points.
 *
 * A deck writes `/mf-finder?mass=300`, meaning its own site. Played there it is
 * exactly that; played on another site of the family it has to be resolved
 * against the site that wrote it, or the link lands on a page that does not
 * exist.
 * @param href - The address the slide wrote.
 * @param talkOrigin - Where the publishing site lives, when it is not this
 *   one, as `https://host`.
 * @returns A root-relative address prefixed with that origin; anything else —
 *   an absolute address, a protocol-relative one, a relative one, or any
 *   address when no origin is given — as written.
 */
export function resolveTalkAddress(href: string, talkOrigin?: string): string {
  if (
    talkOrigin === undefined ||
    !href.startsWith('/') ||
    href.startsWith('//')
  ) {
    return href;
  }
  return `${talkOrigin.replace(/\/$/, '')}${href}`;
}

/** What {@link followTalkOrigin} is told about the page on screen. */
export interface FollowTalkOriginOptions {
  /** Whether the page is a talk or the list of talks, which forget the way back. */
  onTalkPage: boolean;
  /**
   * The `ECOSYSTEM_SITES` id of this site: an origin naming another site is
   * not followed, because that deck is played there.
   * @default undefined — any site's origin is followed
   */
  site?: string;
}

/**
 * Which slide a page reached from a demo link leads back to, while the
 * presenter browses on through the site.
 * @param kept - The origin remembered so far, or `null`.
 * @param search - The query string on screen, with or without its `?`.
 * @param options - See {@link FollowTalkOriginOptions}.
 * @returns The origin the address names, else the one kept; `null` once a
 *   talk or the list is open again.
 */
export function followTalkOrigin(
  kept: TalkOrigin | null,
  search: string,
  options: FollowTalkOriginOptions,
): TalkOrigin | null {
  const { onTalkPage, site } = options;
  if (onTalkPage) return null;
  const parsed = parseTalkOrigin(search);
  if (parsed === null) return kept;
  const ours =
    site === undefined || parsed.site === undefined || parsed.site === site;
  return ours ? parsed : kept;
}

const ORIGIN_RE =
  /^talk:(?:(?<site>[\da-z-]+):)?(?<talkId>[^:]+):(?<slide>\d+)$/i;
