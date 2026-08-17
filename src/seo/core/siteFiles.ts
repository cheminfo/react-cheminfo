/**
 * The files and blocks a crawler reads besides the head: the sitemap, the
 * robots policy, the structured-data block and the list of addresses a visitor
 * without JavaScript can still follow.
 *
 * All four are derived from the site's own record and its route table, so a
 * page added to the table is added to every one of them at once.
 */

import { siteById, siteDisplayName } from '../../ecosystem/core/lookup.ts';
import type { EcosystemSite, SiteId } from '../../ecosystem/core/sites.ts';
import { escapeAttribute, escapeText } from '../../share/core/escape.ts';

import type { RouteMeta } from './routes.ts';
import { trimTrailingSlash } from './routes.ts';

/** The sequence that must not appear raw inside a script element. */
const SCRIPT_SAFE_LESS_THAN = String.raw`\u003c`;

/** What a crawler is told about the site as a whole. */
export interface SiteFilesOptions {
  /** The site, named or passed. */
  site: EcosystemSite | SiteId;
  /** Every address it answers. */
  routes: readonly RouteMeta[];
  /**
   * Origin every absolute address is built on.
   * @default `https://<the site's host>`
   */
  origin?: string;
}

/**
 * Every routed address, as the sitemap lists them.
 * @param options - The site and its routes.
 * @returns The `sitemap.xml` document.
 */
export function sitemapXml(options: SiteFilesOptions): string {
  const origin = originOf(options);
  const entries = options.routes
    .map(
      (route) =>
        `  <url><loc>${escapeText(`${origin}${route.path}`)}</loc></url>`,
    )
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>
`;
}

/**
 * The crawl policy.
 *
 * Our tools are meant to be found, so only the endpoints are disallowed — an
 * API prefix and its documentation are not pages. The sitemap is named only
 * because this module also writes it: a `Sitemap:` line pointing at a 404 is
 * reported as an error on every fetch.
 * @param options - The site and its routes.
 * @param disallow - Address prefixes to keep out of the index.
 * @returns The `robots.txt` document.
 */
export function robotsTxt(
  options: SiteFilesOptions,
  disallow: readonly string[] = [],
): string {
  const lines = ['User-agent: *', 'Allow: /'];
  for (const path of disallow) lines.push(`Disallow: ${path}`);
  lines.push('', `Sitemap: ${originOf(options)}/sitemap.xml`, '');
  return lines.join('\n');
}

/** What the structured-data block says the tool is. */
export interface StructuredDataOptions extends SiteFilesOptions {
  /**
   * The schema.org application category.
   * @default 'EducationalApplication'
   */
  category?: string;
  /**
   * What the tool needs to run.
   * @default 'Any modern browser'
   */
  operatingSystem?: string;
}

/**
 * One `application/ld+json` block describing the tool.
 *
 * It is the same on every page of a site — what varies per page is the head —
 * so it is written into the built page once rather than per route.
 * @param options - The site, and what kind of application it is.
 * @returns The script tag, ready to put in the head.
 */
export function structuredDataScript(options: StructuredDataOptions): string {
  const site = resolveSite(options.site);
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: siteDisplayName(site),
    url: `${originOf(options)}/`,
    description: site.tagline,
    applicationCategory: options.category ?? 'EducationalApplication',
    operatingSystem: options.operatingSystem ?? 'Any modern browser',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
    publisher: { '@type': 'Organization', name: 'cheminfo' },
  };
  const json = JSON.stringify(data, null, 2).replaceAll(
    '<',
    SCRIPT_SAFE_LESS_THAN,
  );
  return `<script type="application/ld+json">\n${json}\n</script>`;
}

/**
 * A readable page for a visitor, or a crawler, with no JavaScript.
 *
 * The body of our sites is an empty root element, so this is the only crawl
 * path through them that costs nothing to render — and it is honest: it says
 * the tool needs JavaScript, and links every address it answers.
 * @param options - The site and its routes.
 * @returns The `noscript` block, ready to put in the body.
 */
export function noscriptIndex(options: SiteFilesOptions): string {
  const site = resolveSite(options.site);
  const items = options.routes
    .map(
      (route) =>
        `    <li><a href="${escapeAttribute(route.path)}">${escapeText(route.title)}</a></li>`,
    )
    .join('\n');
  return `<noscript>
  <h1>${escapeText(siteDisplayName(site))}</h1>
  <p>${escapeText(site.tagline)} This tool needs JavaScript; these are the pages it offers:</p>
  <ul>
${items}
  </ul>
</noscript>`;
}

function resolveSite(site: EcosystemSite | SiteId): EcosystemSite {
  return typeof site === 'string' ? siteById(site) : site;
}

function originOf(options: SiteFilesOptions): string {
  return trimTrailingSlash(
    options.origin ?? `https://${resolveSite(options.site).host}`,
  );
}
