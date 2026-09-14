import type { SiteId } from '../src/ecosystem/core/sites.ts';

/**
 * Three real sites, so the Brand toolbar shows a genuine range of pairs. Their
 * colours are read from the sites' records, the way a site renders them.
 */
export const BRAND_SITES = [
  'vcl',
  'surge',
  'smiles',
] as const satisfies readonly SiteId[];

/** The site the canvas opens on. */
export const DEFAULT_BRAND_SITE: SiteId = BRAND_SITES[0];

/**
 * The site a toolbar value names, falling back to the default so a stale value
 * in a shared link never leaves the canvas unpainted.
 * @param name - The name the toolbar currently holds.
 * @returns The site whose two colours the story is read under.
 */
export function brandSiteNamed(name: unknown): SiteId {
  for (const site of BRAND_SITES) {
    if (site === name) return site;
  }
  return DEFAULT_BRAND_SITE;
}
