/**
 * A readable page for a visitor, or a crawler, with no JavaScript.
 *
 * The body of our sites is an empty root element, so this is the only crawl
 * path through them that costs nothing to render — and it is honest: it says
 * the tool needs JavaScript, and links the addresses it answers.
 */

import { siteById, siteDisplayName } from '../../ecosystem/core/lookup.ts';
import type { EcosystemSite, SiteId } from '../../ecosystem/core/sites.ts';
import { ECOSYSTEM_SITES, siteUrl } from '../../ecosystem/core/sites.ts';
import { joinBasePath } from '../../router/core/basePath.ts';
import { escapeAttribute, escapeText } from '../../share/core/escape.ts';

import type { RouteMeta } from './routes.ts';
import type { SiteFilesOptions } from './siteFiles.ts';
import { mountPathOf, resolveSite } from './siteFiles.ts';

/** How the addresses of the site's own pages are written. */
export type NoscriptHrefs = 'absolute' | 'relative';

/** A page the block links, and the pages listed under it. */
export interface NoscriptRoute extends RouteMeta {
  /**
   * Pages listed under this one, as a list nested in its item — the sections of
   * an exercise set under the set itself.
   * @default undefined — the item carries no list
   */
  children?: readonly NoscriptRoute[];
}

/** Which of the family's other sites are listed, and how. */
export interface NoscriptEcosystem {
  /**
   * The sites listed, in the order they are named. The site writing the block
   * is never one of them, whether or not it is named: the list is headed *Our
   * other tools*.
   * @default every other site in the family, in the family's own order
   */
  sites?: readonly SiteId[];
  /**
   * Whether each host is followed by ` — ` and the site's one-line tagline.
   * @default true
   */
  taglines?: boolean;
}

/** The prose of the block, where the site says more than its record does. */
export interface NoscriptText {
  /**
   * The heading the block opens with.
   * @default the site's display name
   */
  heading?: string;
  /**
   * The paragraph under it, taken as written. It is the one place a reader with
   * no JavaScript is told what the tool is, so it may say more than the tagline
   * — but it still has to say that the tool needs JavaScript.
   * @default the tagline, followed by the sentence naming the requirement
   */
  intro?: string;
  /**
   * Whether the family's other sites are listed under the site's own pages, and
   * which of them. A crawler that runs no script has no other path from one of
   * our tools to the next, so a site that lists none leaves it with none.
   * `true` lists every other site with its tagline; an object names the sites,
   * or drops the taglines, or both.
   * @default false
   */
  ecosystem?: boolean | NoscriptEcosystem;
  /**
   * How the site's own addresses are written. `'absolute'` writes them from the
   * root of the host, under the mount the origin names. `'relative'` writes
   * `./exercises` and `./`, which the page resolves against its own `<base>` —
   * the only shape that works for an image whose mount is chosen at container
   * startup, because it bakes no mount into the build at all. The `<base>` such
   * a deployment stamps in ends with a slash, or a relative address resolves
   * one directory too high.
   * @default 'absolute'
   */
  hrefs?: NoscriptHrefs;
  /**
   * The pages the block links, when they are not the site's whole route table.
   * A crawl path is a menu: a site whose table carries an entry per tutorial
   * step lists the tutorial, not its hundred and thirty-seven steps.
   * @default every route the site answers
   */
  routes?: readonly NoscriptRoute[];
}

/** What the block says, and which addresses it links. */
export interface NoscriptOptions
  extends Omit<SiteFilesOptions, 'routes'>, Omit<NoscriptText, 'routes'> {
  /** The addresses it links, each with the label it is linked under. */
  routes: readonly NoscriptRoute[];
}

/**
 * The `noscript` block, ready to put in the body.
 *
 * An absolute address is written under the mount the deployment named, so a
 * build published as one tool among several on a shared host links its own
 * pages rather than the root of the host it shares.
 * @param options - The site, the pages it links, and the prose that opens the
 * block.
 * @returns The block.
 * @throws {Error} When the deployment named an origin that is not an absolute
 * address.
 */
export function noscriptIndex(options: NoscriptOptions): string {
  const site = resolveSite(options.site);
  const hrefs = options.hrefs ?? 'absolute';
  const mount = hrefs === 'absolute' ? mountPathOf(options) : '';
  const heading = escapeText(options.heading ?? siteDisplayName(site));
  const intro = escapeText(
    options.intro ??
      `${site.tagline} This tool needs JavaScript; these are the pages it offers:`,
  );

  return `<noscript>
  <h1>${heading}</h1>
  <p>${intro}</p>${pageList(options.routes, mount, hrefs, '  ')}${familyList(site.id, options.ecosystem)}
</noscript>`;
}

function pageList(
  routes: readonly NoscriptRoute[],
  mount: string,
  hrefs: NoscriptHrefs,
  indent: string,
): string {
  // A list with no item is not a list: `<ul>` holds at least one `<li>`.
  if (routes.length === 0) return '';
  const items = routes
    .map((route) => pageItem(route, mount, hrefs, `${indent}  `))
    .join('\n');
  return `\n${indent}<ul>\n${items}\n${indent}</ul>`;
}

function pageItem(
  route: NoscriptRoute,
  mount: string,
  hrefs: NoscriptHrefs,
  indent: string,
): string {
  const href = escapeAttribute(pageHref(route.path, mount, hrefs));
  const label = escapeText(labelOf(route));
  const note =
    route.note === undefined || route.note.trim() === ''
      ? ''
      : ` — ${escapeText(route.note)}`;
  const children = route.children ?? [];
  const link = `<a href="${href}">${label}</a>${note}`;
  if (children.length === 0) return `${indent}<li>${link}</li>`;
  return `${indent}<li>${link}${pageList(children, mount, hrefs, `${indent}  `)}
${indent}</li>`;
}

function pageHref(path: string, mount: string, hrefs: NoscriptHrefs): string {
  if (hrefs === 'absolute') return joinBasePath(mount, path);
  return `./${path.startsWith('/') ? path.slice(1) : path}`;
}

function labelOf(route: NoscriptRoute): string {
  const short = route.short;
  return short !== undefined && short.trim() !== '' ? short : route.title;
}

function familyList(
  current: SiteId,
  ecosystem: boolean | NoscriptEcosystem | undefined,
): string {
  if (ecosystem === undefined || ecosystem === false) return '';
  const listed = ecosystem === true ? {} : ecosystem;
  const taglines = listed.taglines ?? true;
  const items: string[] = [];
  for (const site of familySites(listed.sites)) {
    if (site.id === current) continue;
    const tagline = taglines ? ` — ${escapeText(site.tagline)}` : '';
    items.push(
      `    <li><a href="${escapeAttribute(siteUrl(site))}">${escapeText(site.host)}</a>${tagline}</li>`,
    );
  }
  if (items.length === 0) return '';
  return `
  <h2>Our other tools</h2>
  <ul>
${items.join('\n')}
  </ul>`;
}

function familySites(sites: readonly SiteId[] | undefined): EcosystemSite[] {
  if (sites === undefined) return [...ECOSYSTEM_SITES];
  return sites.map((id) => siteById(id));
}
