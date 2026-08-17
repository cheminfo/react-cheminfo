/**
 * The head of the page a crawler is handed.
 *
 * Googlebot renders JavaScript, but Bing, a Slack unfurl, an LMS preview and
 * every academic indexer read the HTML that came off the wire — so the title,
 * the description and the canonical of a page must already be in it. A site
 * with a server rewrites them per request; a static one writes one file per
 * address at build time. Both call this, which is pure string work: no
 * `window`, no `node:fs`.
 */

import { siteById, siteDisplayName } from '../../ecosystem/core/lookup.ts';
import type { EcosystemSite, SiteId } from '../../ecosystem/core/sites.ts';
import { escapeAttribute, escapeText } from '../../share/core/escape.ts';

import type { DocumentMeta } from './documentMeta.ts';
import type { RouteMeta } from './routes.ts';
import { pageMetaFor, trimTrailingSlash } from './routes.ts';

/** Which site is being served, and what it answers. */
export interface PageMetaOptions {
  /** The site, named or passed. */
  site: EcosystemSite | SiteId;
  /** Every address it answers, each with its title and description. */
  routes: readonly RouteMeta[];
  /** The address being written, query string included. */
  url: string;
  /**
   * Origin every absolute address is built on. A server passes the one the
   * request arrived on; a build leaves it out and the site's own host is used.
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
 * @param html - The built page.
 * @param options - Which site, which address, and where it is served from.
 * @returns The page, with its head rewritten for that route.
 */
export function injectPageMeta(html: string, options: PageMetaOptions): string {
  const site = resolveSite(options.site);
  const meta = pageMetaFor(options.routes, options.url);
  const name = siteDisplayName(site);
  const origin = trimTrailingSlash(options.origin ?? `https://${site.host}`);
  const { title, canonical } = pageDocumentMeta(options);
  const image = absolute(options.image ?? '/og.png', origin);

  const head = [
    `<link rel="canonical" href="${escapeAttribute(canonical)}" />`,
    '<meta property="og:type" content="website" />',
    `<meta property="og:site_name" content="${escapeAttribute(name)}" />`,
    `<meta property="og:title" content="${escapeAttribute(title)}" />`,
    `<meta property="og:description" content="${escapeAttribute(meta.description)}" />`,
    `<meta property="og:url" content="${escapeAttribute(canonical)}" />`,
    `<meta property="og:image" content="${escapeAttribute(image)}" />`,
    '<meta name="twitter:card" content="summary_large_image" />',
  ].join('\n');

  return insertBeforeHeadEnd(
    replaceDescription(replaceTitle(html, title), meta.description),
    head,
  );
}

/**
 * What the page on screen is called and where it is indexed, for the app to
 * write after an in-app move.
 *
 * The same title and canonical the build wrote into the file it served, so a
 * click that changes the page cannot disagree with the page a crawler fetched.
 * @param options - Which site, which address, and where it is served from.
 * @returns The title, the description and the canonical of that address.
 */
export function pageDocumentMeta(options: PageMetaOptions): Required<DocumentMeta> {
  const site = resolveSite(options.site);
  const meta = pageMetaFor(options.routes, options.url);
  const origin = trimTrailingSlash(options.origin ?? `https://${site.host}`);
  return {
    title: `${meta.title} — ${siteDisplayName(site)}`,
    description: meta.description,
    canonical: `${origin}${meta.path}`,
  };
}

/**
 * Put an addition at the end of the head, where a tracking snippet and a
 * structured-data block both belong.
 * @param html - The page.
 * @param addition - The markup to add, taken as written.
 * @returns The page, with the addition before `</head>`.
 */
export function insertBeforeHeadEnd(html: string, addition: string): string {
  const head = html.lastIndexOf('</head>');
  if (head === -1) return `${html}\n${addition}\n`;
  return `${html.slice(0, head)}${addition}\n${html.slice(head)}`;
}

function resolveSite(site: EcosystemSite | SiteId): EcosystemSite {
  return typeof site === 'string' ? siteById(site) : site;
}

function absolute(target: string, origin: string): string {
  return target.startsWith('/') ? `${origin}${target}` : target;
}

function replaceTitle(html: string, title: string): string {
  const replacement = `<title>${escapeText(title)}</title>`;
  return html.includes('<title>')
    ? html.replace(/<title>[\s\S]*?<\/title>/, replacement)
    : insertBeforeHeadEnd(html, replacement);
}

function replaceDescription(html: string, description: string): string {
  const replacement = `<meta name="description" content="${escapeAttribute(description)}" />`;
  const existing = /<meta[^>]*name="description"[^>]*>/;
  return existing.test(html)
    ? html.replace(existing, replacement)
    : insertBeforeHeadEnd(html, replacement);
}
