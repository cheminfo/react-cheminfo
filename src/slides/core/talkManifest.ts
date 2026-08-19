import type { Talk } from './talk.ts';

/**
 * How one site publishes its talks so another can list them.
 *
 * The talks themselves are Markdown files served by the site that gave them;
 * a manifest is the small JSON index a sibling site fetches to show them
 * without holding a copy. It is read tolerantly, because the site fetching it
 * has no control over the version of the file it gets.
 */

/** One talk, as a listing shows it. */
export interface TalkSummary {
  /** How the publishing site names the talk in its addresses. */
  id: string;
  /** The talk title. */
  title: string;
  /**
   * A second line under the title.
   * @default undefined
   */
  subtitle?: string;
  /**
   * Conference or event it was given at.
   * @default undefined
   */
  event?: string;
  /**
   * When it was given, as an ISO date (`YYYY-MM-DD`).
   * @default undefined
   */
  date?: string;
  /**
   * Who presented it.
   * @default undefined
   */
  author?: string;
  /** How many slides it holds. */
  slideCount: number;
}

/** Every talk one site publishes. */
export interface TalkManifest {
  /** The `ECOSYSTEM_SITES` id of the site that gave the talks. */
  site: string;
  /** Where that site is served from, as `https://host`. */
  origin: string;
  /** The talks, in the order the site lists them. */
  talks: TalkSummary[];
}

/**
 * The listing entry for one parsed talk.
 * @param id - How the site names the talk in its addresses.
 * @param talk - The parsed talk.
 * @returns Its summary, carrying only the metadata a listing shows.
 */
export function talkSummary(id: string, talk: Talk): TalkSummary {
  const summary: TalkSummary = {
    id,
    title: talk.meta.title,
    slideCount: talk.slides.length,
  };
  if (talk.meta.subtitle !== undefined) summary.subtitle = talk.meta.subtitle;
  if (talk.meta.event !== undefined) summary.event = talk.meta.event;
  if (talk.meta.date !== undefined) summary.date = talk.meta.date;
  if (talk.meta.author !== undefined) summary.author = talk.meta.author;
  return summary;
}

/**
 * Build the manifest a site publishes.
 * @param input - The site, where it is served from, and its parsed talks.
 * @param input.site - The `ECOSYSTEM_SITES` id of the publishing site.
 * @param input.origin - Where that site is served from, as `https://host`.
 * @param input.talks - The talks, each with the id the site names it by.
 * @returns The manifest, ready to be written as JSON.
 */
export function buildTalkManifest(input: {
  /** The `ECOSYSTEM_SITES` id of the publishing site. */
  site: string;
  /** Where that site is served from, as `https://host`. */
  origin: string;
  /** The talks, each with the id the site names it by. */
  talks: ReadonlyArray<{ id: string } & Talk>;
}): TalkManifest {
  const talks: TalkSummary[] = [];
  for (const talk of input.talks) {
    talks.push(talkSummary(talk.id, talk));
  }
  return { site: input.site, origin: input.origin, talks };
}

/**
 * Read a manifest a sibling site published.
 *
 * Unknown keys are ignored and an entry missing what a listing needs is
 * dropped, so a site running an older or newer version of the format still
 * lists whatever it can understand instead of showing nothing.
 * @param value - The parsed JSON, of unknown shape.
 * @returns The manifest, or `null` when the value is not one.
 */
export function parseTalkManifest(value: unknown): TalkManifest | null {
  if (typeof value !== 'object' || value === null) return null;
  const record = value as Record<string, unknown>;
  const site = text(record.site);
  const origin = text(record.origin);
  if (site === undefined || origin === undefined) return null;
  if (!Array.isArray(record.talks)) return null;
  const talks: TalkSummary[] = [];
  for (const entry of record.talks) {
    const summary = parseSummary(entry);
    if (summary !== null) talks.push(summary);
  }
  return { site, origin, talks };
}

/**
 * Where the Markdown source of one talk of a manifest is served.
 * @param manifest - The manifest naming the publishing site.
 * @param id - Which talk.
 * @returns The absolute URL of the talk source.
 */
export function talkSourceUrl(manifest: TalkManifest, id: string): string {
  return `${manifest.origin.replace(TRAILING_SLASHES, '')}/talks/${id}.md`;
}

function parseSummary(value: unknown): TalkSummary | null {
  if (typeof value !== 'object' || value === null) return null;
  const record = value as Record<string, unknown>;
  const id = text(record.id);
  const title = text(record.title);
  const slideCount = record.slideCount;
  if (id === undefined || title === undefined) return null;
  if (typeof slideCount !== 'number' || !Number.isFinite(slideCount)) {
    return null;
  }
  const summary: TalkSummary = {
    id,
    title,
    slideCount: Math.max(Math.trunc(slideCount), 0),
  };
  const subtitle = text(record.subtitle);
  const event = text(record.event);
  const date = text(record.date);
  const author = text(record.author);
  if (subtitle !== undefined) summary.subtitle = subtitle;
  if (event !== undefined) summary.event = event;
  if (date !== undefined) summary.date = date;
  if (author !== undefined) summary.author = author;
  return summary;
}

function text(value: unknown): string | undefined {
  return typeof value === 'string' && value !== '' ? value : undefined;
}

const TRAILING_SLASHES = /\/+$/;
