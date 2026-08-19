import type { CitedWork } from '../../citation/core/works.ts';
import type { CreditEntry, CreditId } from '../../credits/core/credits.ts';
import { credits } from '../../credits/core/credits.ts';
import { siteById } from '../../ecosystem/core/lookup.ts';
import type { EcosystemSite, SiteId } from '../../ecosystem/core/sites.ts';

/**
 * What a site says about itself: the one page a visitor opens to find out what
 * the tool is, what it stands on, and who to tell when it breaks.
 *
 * Every field is content, never markup. A site writes this record and the page
 * is drawn from it, which is what keeps fourteen About pages in one order and
 * one voice — the shape they were in before was fourteen hand-written pages,
 * each crediting a different half of what it runs on.
 */
export interface AboutContent {
  /** The site the page belongs to. */
  siteId: SiteId;
  /** One sentence: what this tool is. */
  what: string;
  /**
   * At most two short paragraphs of context — what the site replaces, where
   * its numbers come from, what it deliberately does not do.
   * @default undefined
   */
  paragraphs?: readonly string[];
  /** Three to six one-line entries: what a visitor can do here. */
  can: readonly string[];
  /** Ids into the shared credits registry, in display order. */
  credits: readonly CreditId[];
  /**
   * Works to cite, from the citation module.
   * @default undefined — the site asks for no citation of its own
   */
  cite?: readonly CitedWork[];
  /**
   * Licence the site itself is published under.
   * @default 'MIT'
   */
  license?: string;
  /**
   * Where the sources live.
   * @default the repository of the ECOSYSTEM_SITES record
   */
  repository?: string;
  /**
   * The running version, when the site knows it.
   * @default undefined
   */
  version?: string;
  /**
   * Where a problem is reported.
   * @default the repository's /issues
   */
  issues?: string;
}

/**
 * The same record with nothing left to look up: every default filled in, and
 * every credit id replaced by the entry it names.
 */
export interface ResolvedAbout {
  /** The site's own record, which carries its name, tagline and colours. */
  site: EcosystemSite;
  what: string;
  /** The context paragraphs, empty when the site writes none. */
  paragraphs: readonly string[];
  can: readonly string[];
  /** The borrowed works themselves, in the order the site names them. */
  credits: CreditEntry[];
  /** The works to cite, empty when the site asks for none. */
  cite: readonly CitedWork[];
  license: string;
  repository: string;
  /** The running version, or `undefined` when the site does not know it. */
  version: string | undefined;
  issues: string;
}

/**
 * Fill in what a site left to the family, and resolve what it named.
 * @param content - What the site wrote about itself.
 * @returns The record the About page is drawn from.
 * @throws {Error} When the site is not one of the family, or when a credit id
 *   is not in the registry: an About page that silently drops a borrowed work
 *   credits nobody.
 */
export function resolveAbout(content: AboutContent): ResolvedAbout {
  const site = siteById(content.siteId);
  const repository = content.repository ?? site.repository;

  return {
    site,
    what: content.what,
    paragraphs: content.paragraphs ?? [],
    can: content.can,
    credits: credits(content.credits),
    cite: content.cite ?? [],
    license: content.license ?? DEFAULT_LICENSE,
    repository,
    version: content.version,
    issues: content.issues ?? `${withoutTrailingSlash(repository)}/issues`,
  };
}

/**
 * What is wrong with a record before anyone reads the page it draws.
 *
 * Short and efficient prose is the house style, and prose is exactly what no
 * test, lint rule or type ever checks: a `what` that runs to a paragraph and a
 * `can` list of a dozen lines both compile. This is where that is caught, so a
 * site can assert it in its own suite rather than discover it in review.
 * @param content - What the site wrote about itself.
 * @returns One line per problem, in reading order; empty when there is none.
 */
export function aboutProblems(content: AboutContent): string[] {
  const problems: string[] = [];

  if (content.what.length > WHAT_LIMIT) {
    problems.push(
      `\`what\` is ${content.what.length} characters: one sentence of at most ${WHAT_LIMIT} says what the tool is.`,
    );
  }

  const can = content.can;
  if (can.length < CAN_MIN || can.length > CAN_MAX) {
    problems.push(
      `\`can\` lists ${can.length} entries: between ${CAN_MIN} and ${CAN_MAX} is what a visitor reads before deciding to stay.`,
    );
  }
  for (let index = 0; index < can.length; index++) {
    const line = can[index] ?? '';
    if (line.length > CAN_LINE_LIMIT) {
      problems.push(
        `\`can\` entry ${index + 1} is ${line.length} characters: one line of at most ${CAN_LINE_LIMIT}, not a sentence about it.`,
      );
    }
  }

  const paragraphs = content.paragraphs ?? [];
  if (paragraphs.length > PARAGRAPH_MAX) {
    problems.push(
      `\`paragraphs\` holds ${paragraphs.length}: at most ${PARAGRAPH_MAX} short paragraphs of context, and the rest belongs in the README.`,
    );
  }
  for (let index = 0; index < paragraphs.length; index++) {
    const paragraph = paragraphs[index] ?? '';
    if (paragraph.length > PARAGRAPH_LIMIT) {
      problems.push(
        `paragraph ${index + 1} is ${paragraph.length} characters: at most ${PARAGRAPH_LIMIT}, or it is documentation rather than context.`,
      );
    }
  }

  if (content.credits.length === 0) {
    problems.push(
      '`credits` is empty: every page of ours stands on borrowed work, and naming it is what the section is for.',
    );
  }

  return problems;
}

/** What a site is published under unless it says otherwise. */
const DEFAULT_LICENSE = 'MIT';

const WHAT_LIMIT = 160;
const CAN_MIN = 3;
const CAN_MAX = 6;
const CAN_LINE_LIMIT = 90;
const PARAGRAPH_MAX = 2;
const PARAGRAPH_LIMIT = 400;

function withoutTrailingSlash(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}
