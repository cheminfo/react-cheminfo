/**
 * One `application/ld+json` block describing the tool.
 *
 * It is the same on every page of a site — what varies per page is the head —
 * so it is written into the built page once rather than per route.
 */

import { siteDisplayName } from '../../ecosystem/core/lookup.ts';

import type { SiteFilesOptions } from './siteFiles.ts';
import { originOf, resolveSite } from './siteFiles.ts';

/** The sequence that must not appear raw inside a script element. */
const SCRIPT_SAFE_LESS_THAN = String.raw`\u003c`;

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
  /**
   * What the tool does, in the words a search result is read in. A site whose
   * indexed sentence says more than the line its tile in the family menu
   * carries writes it here.
   * @default the site's tagline
   */
  description?: string;
  /**
   * What a browser has to offer for the tool to run. Ours run in the page.
   * @default 'Requires JavaScript'
   */
  browserRequirements?: string;
  /**
   * The currency the price is quoted in. The price is zero either way, but the
   * pair has to agree with the audience the site is read by.
   * @default 'EUR'
   */
  currency?: string;
}

/**
 * The structured-data block, ready to put in the head.
 *
 * It always says the tool is free: the price is zero, and a block that leaves
 * that implicit is one a rich result declines to show.
 * @param options - The site, and what kind of application it is.
 * @returns The script tag.
 */
export function structuredDataScript(options: StructuredDataOptions): string {
  const site = resolveSite(options.site);
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: siteDisplayName(site),
    url: `${originOf(options)}/`,
    description: options.description ?? site.tagline,
    applicationCategory: options.category ?? 'EducationalApplication',
    operatingSystem: options.operatingSystem ?? 'Any modern browser',
    browserRequirements: options.browserRequirements ?? 'Requires JavaScript',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: options.currency ?? 'EUR',
    },
    isAccessibleForFree: true,
    publisher: { '@type': 'Organization', name: 'cheminfo' },
  };
  const json = JSON.stringify(data, null, 2).replaceAll(
    '<',
    SCRIPT_SAFE_LESS_THAN,
  );
  return `<script type="application/ld+json">\n${json}\n</script>`;
}
