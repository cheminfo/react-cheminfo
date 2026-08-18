/**
 * The head of the page a crawler is handed.
 *
 * Googlebot renders JavaScript, but Bing, a Slack unfurl, an LMS preview and
 * every academic indexer read the HTML that came off the wire — so the title,
 * the description and the canonical of a page must already be in it. A site
 * with a server writes them per request; a static one writes one file per
 * address at build time. Both call this, which is pure string work: no
 * `window`, no `node:fs`.
 *
 * The page it is given is the template, which declares where its head goes and
 * carries none of its own, so this only ever writes — see `./template.ts`.
 */

import { siteDisplayName } from '../../ecosystem/core/lookup.ts';
import type { EcosystemSite, SiteId } from '../../ecosystem/core/sites.ts';
import { escapeAttribute, escapeText } from '../../share/core/escape.ts';

import type { DocumentMeta } from './documentMeta.ts';
import type { RouteMeta } from './routes.ts';
import { pageMetaFor } from './routes.ts';
import { mountPathOf, originOf, resolveSite } from './siteFiles.ts';
import { PAGE_HEAD_MARKER, fill } from './template.ts';

/** Which site is being served, and what it answers. */
export interface PageMetaOptions {
  /** The site, named or passed. */
  site: EcosystemSite | SiteId;
  /** Every address it answers, each with its title and description. */
  routes: readonly RouteMeta[];
  /**
   * The address being written, query string included: a path, or the absolute
   * address an app reads off the page it is on.
   */
  url: string;
  /**
   * Where the site is served, mount path included, e.g.
   * `https://learn.cheminfo.org/surge`. A server passes the one the request
   * arrived on; a build leaves it out and the site's own host is used. Every
   * address written here is composed on it, so the mount is carried by the
   * origin rather than applied a second time. It is an absolute address, or it
   * is refused.
   * @default `https://<the site's host>`
   */
  origin?: string;
  /**
   * The card a link to the page unfurls into, as an absolute address or a path.
   * @default '/og.png'
   */
  image?: string;
}

/**
 * Give a page the title, the description and the canonical address of the route
 * it answers, plus the card a link to it unfurls into.
 * @param html - The built template.
 * @param options - Which site, which address, and where it is served from.
 * @returns The page, with its head written for that route.
 * @throws {Error} When the page carries no `<!--cheminfo:head-->`, when the
 * site answers no route, or when it names an origin that is not an absolute
 * address.
 */
export function injectPageMeta(html: string, options: PageMetaOptions): string {
  return fill(html, PAGE_HEAD_MARKER, pageHeadTags(options));
}

/**
 * The head a route is indexed and shared under, for a caller writing more into
 * the same place — a structured-data block, a tracking snippet.
 * @param options - Which site, which address, and where it is served from.
 * @returns The tags, one per line.
 * @throws {Error} When the site answers no route, or names an origin that is
 * not an absolute address.
 */
export function pageHeadTags(options: PageMetaOptions): string {
  const name = siteDisplayName(resolveSite(options.site));
  const description = routeMetaOf(options).description;
  const origin = originOf(options);
  const { title, canonical } = pageDocumentMeta(options);
  const image = absolute(options.image ?? '/og.png', origin);

  return [
    `<title>${escapeText(title)}</title>`,
    `<meta name="description" content="${escapeAttribute(description)}" />`,
    `<link rel="canonical" href="${escapeAttribute(canonical)}" />`,
    '<meta property="og:type" content="website" />',
    `<meta property="og:site_name" content="${escapeAttribute(name)}" />`,
    `<meta property="og:title" content="${escapeAttribute(title)}" />`,
    `<meta property="og:description" content="${escapeAttribute(description)}" />`,
    `<meta property="og:url" content="${escapeAttribute(canonical)}" />`,
    `<meta property="og:image" content="${escapeAttribute(image)}" />`,
    '<meta name="twitter:card" content="summary_large_image" />',
  ].join('\n');
}

/**
 * What the page on screen is called and where it is indexed, for the app to
 * write after an in-app move.
 *
 * The same title and canonical the build wrote into the file it served, so a
 * click that changes the page cannot disagree with the page a crawler fetched.
 * @param options - Which site, which address, and where it is served from.
 * @returns The title, the description and the canonical of that address.
 * @throws {Error} When the site answers no route, or names an origin that is
 * not an absolute address.
 */
export function pageDocumentMeta(
  options: PageMetaOptions,
): Required<DocumentMeta> {
  const site = resolveSite(options.site);
  const meta = routeMetaOf(options);
  return {
    title: `${meta.title} — ${siteDisplayName(site)}`,
    description: meta.description,
    canonical: `${originOf(options)}${meta.path}`,
  };
}

// A server behind a mount is handed the address the browser asked for, and the
// route table is written from the site's own root, so the mount the origin
// carries is taken off it before the table is read.
function routeMetaOf(options: PageMetaOptions): RouteMeta {
  return pageMetaFor(options.routes, options.url, mountPathOf(options));
}

function absolute(target: string, origin: string): string {
  return target.startsWith('/') ? `${origin}${target}` : target;
}
