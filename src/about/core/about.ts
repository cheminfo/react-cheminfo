import type { BuildInfo } from '../../build/core/buildInfo.ts';
import type { CitedWork } from '../../citation/core/works.ts';
import type { CreditEntry, CreditId } from '../../credits/core/credits.ts';
import { credits } from '../../credits/core/credits.ts';
import { siteById } from '../../ecosystem/core/lookup.ts';
import type { SiteId, SiteRecord } from '../../ecosystem/core/sites.ts';

import type { AboutPerson } from './affiliations.ts';
import type { ProviderEntry, ProviderId } from './providers.ts';
import { providers } from './providers.ts';
import type { MaintainerLine, TeamMember } from './team.ts';
import { aboutMaintainers, aboutTeam, ownTeam } from './team.ts';

export { aboutProblems } from './aboutProblems.ts';

/**
 * What a site says about itself: the one page a visitor opens to find out what
 * the tool is, who provides it, and what it stands on.
 *
 * Every field is content, never markup. A site writes this record and the page
 * is drawn from it, which is what keeps fourteen About pages in one order and
 * one voice — the shape they were in before was fourteen hand-written pages,
 * each crediting a different half of what it runs on.
 */
export interface AboutContent {
  /**
   * The site the page belongs to: its id, or the record itself for a site that
   * is deliberately not listed in the family's Tools menu and therefore not in
   * `ECOSYSTEM_SITES`.
   */
  siteId: SiteId | SiteRecord;
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
   * The people whose work this site is, listed first and ahead of the family's
   * coordinator: a site built around somebody else's science says so. Luc
   * Patiny's line then says he wrote the web interface, unless `contributors`
   * writes it, as a paper's author contributions do.
   * @default undefined
   */
  leads?: ReadonlyArray<AboutPerson & { role: string }>;
  /**
   * Who provides the site, named under "Provided by"; a role, when given,
   * is listed under the names.
   * @default undefined
   */
  people?: readonly AboutPerson[];
  /**
   * Who else worked on the site, listed under the names with what they did.
   * Naming anyone turns "Provided by" into "Who made it", and moves the people
   * maintaining what the site runs on to a section of their own.
   * @default undefined
   */
  contributors?: readonly AboutPerson[];
  /**
   * Whether the family's coordinator is listed under the names. A site that
   * another organisation provides, as Zakodium provides NMRium, names its own
   * people and leaves him out.
   * @default true
   */
  coordinator?: boolean;
  /**
   * Whether the family's people are listed: who coordinates it, who designs
   * its library and who keeps its tooling going. A personal project that only
   * runs on the family's libraries names its own people and nobody else.
   * @default true
   */
  family?: boolean;
  /**
   * Ids into the provider registry: the institutions that provide the site,
   * drawn as logos under "Provided by".
   * @default undefined
   */
  providedBy?: readonly ProviderId[];
  /**
   * Which build is running, from `react-cheminfo/build-info` — never written
   * by hand, which is what keeps it true after the next release.
   * @default undefined — the site's build does not publish one
   */
  build?: BuildInfo;
}

/**
 * The same record with nothing left to look up: every default filled in, and
 * every credit id replaced by the entry it names.
 */
export interface ResolvedAbout {
  /** The site's own record, which carries its name, tagline and colours. */
  site: SiteRecord;
  what: string;
  /** The context paragraphs, empty when the site writes none. */
  paragraphs: readonly string[];
  can: readonly string[];
  /** The borrowed works themselves, in the order the site names them. */
  credits: CreditEntry[];
  /** The works to cite, empty when the site asks for none. */
  cite: readonly CitedWork[];
  /** Who provides the site, empty when the site names nobody. */
  people: readonly AboutPerson[];
  /**
   * The list under the names: who made the site, when it names anyone besides
   * the family's coordinator, or else the family's people where they apply.
   */
  team: readonly TeamMember[];
  /**
   * Who maintains what the site runs on, in a section of their own: empty
   * unless the site was made with somebody besides the family's coordinator.
   */
  maintainers: readonly MaintainerLine[];
  /** The institutions providing the site, empty when the site names none. */
  providedBy: ProviderEntry[];
  /** Which build is running, or `undefined` when the site does not say. */
  build: BuildInfo | undefined;
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
  const site =
    typeof content.siteId === 'string'
      ? siteById(content.siteId)
      : content.siteId;
  const borrowed = credits(content.credits);
  const named = [...(content.people ?? []), ...(content.contributors ?? [])];
  const own = content.family === false;
  return {
    site,
    what: content.what,
    paragraphs: content.paragraphs ?? [],
    can: content.can,
    credits: borrowed,
    cite: content.cite ?? [],
    people: content.people ?? [],
    team: own
      ? ownTeam(named, content.leads)
      : aboutTeam(named, borrowed, content.leads, content.coordinator),
    maintainers: own ? [] : aboutMaintainers(named, borrowed, content.leads),
    providedBy: providers(content.providedBy ?? []),
    build: content.build,
  };
}
