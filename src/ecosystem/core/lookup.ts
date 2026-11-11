import type { SiteGroup, SiteGroupId } from './groups.ts';
import { SITE_GROUPS } from './groups.ts';
import type { EcosystemSite, SiteId, SiteRecord } from './sites.ts';
import { ECOSYSTEM_SITES } from './sites.ts';
import { UNLISTED_SITES } from './unlistedSites.ts';

// What a site is looked up in: the listed ones, then those no menu shows yet.
const KNOWN_SITES: readonly EcosystemSite[] = [
  ...ECOSYSTEM_SITES,
  ...UNLISTED_SITES,
];

/** One topic and the sites written under it. */
export interface GroupedSites {
  /** The topic. */
  group: SiteGroup;
  /** Its sites, in the order they are declared. */
  sites: EcosystemSite[];
}

/**
 * The family gathered under its topics, which is how a menu and a footer list
 * it. A topic nobody is written under is left out rather than headed over an
 * empty space.
 * @returns Each topic that has sites, in the order the topics are declared.
 */
export function groupedSites(): GroupedSites[] {
  const grouped: GroupedSites[] = [];
  for (const group of SITE_GROUPS) {
    const sites = sitesInGroup(group.id);
    if (sites.length > 0) grouped.push({ group, sites });
  }
  return grouped;
}

/**
 * The sites written under one topic.
 * @param id - The topic being asked for.
 * @returns Its sites, in the order they are declared.
 */
export function sitesInGroup(id: SiteGroupId): EcosystemSite[] {
  const sites: EcosystemSite[] = [];
  for (const site of ECOSYSTEM_SITES) {
    if (site.group === id) sites.push(site);
  }
  return sites;
}

/**
 * One site of the family, by the identifier its entry carries — listed in the
 * menu or not yet.
 * @param id - The site being asked for.
 * @returns The site.
 * @throws {Error} When no site of the family carries that identifier.
 */
export function siteById(id: SiteId): EcosystemSite {
  for (const site of KNOWN_SITES) {
    if (site.id === id) return site;
  }
  throw new Error(`unknown ecosystem site: ${id}`);
}

/**
 * One site of the family, by an identifier read from elsewhere — a figure, a
 * link — which may name no site at all, or a site under a name it has since
 * left.
 * @param id - The identifier.
 * @returns The site, or `undefined` when no site carries that identifier.
 */
export function findSiteById(id: string): EcosystemSite | undefined {
  for (const site of KNOWN_SITES) {
    if (site.id === id || site.formerIds?.includes(id)) return site;
  }
  return undefined;
}

/**
 * The identifier a site goes by now, for one read from a figure or a file,
 * which may be one it has since left. An identifier no site carries is itself.
 * @param id - The identifier read.
 * @returns The site's present identifier, or `id`.
 */
export function presentSiteId(id: string): string {
  return findSiteById(id)?.id ?? id;
}

/**
 * Whether an identifier read from a figure, a document or a workspace names
 * the site reading it, under its present identifier or one it was known by
 * before, so what was saved before a rename still opens.
 * @param named - The identifier the saved thing carries.
 * @param site - The site reading it.
 * @returns Whether they are one site.
 */
export function isSameSite(named: string, site: string): boolean {
  if (named === site) return true;
  return findSiteById(site)?.formerIds?.includes(named) ?? false;
}

/**
 * The site's name as prose, for a page title, a card or a citation.
 *
 * An address-shaped name is written as the address it is — `3d` and `cheminfo`
 * are two halves of `3d.cheminfo.org`, and joining them would read `3dcheminfo`
 * — while a product-shaped one is its two halves run together, as its wordmark
 * sets them.
 * @param site - The site being named.
 * @returns What the site is called, in one string.
 */
export function siteDisplayName(site: SiteRecord): string {
  return site.name.dot === true
    ? site.host
    : `${site.name.lead}${site.name.alt}`;
}

/**
 * The site a page is being served from, so a header can mark itself as the
 * current one without being told which site it belongs to.
 *
 * The host is whatever the browser reports, so it may carry a port and may or
 * may not carry the `www.` two of our sites are written with. Neither changes
 * which site it is, and a host belonging to nobody — a development server, a
 * preview deployment — is simply not one of ours.
 * @param host - What `location.host` reads, or any host-shaped string.
 * @returns The site served from that host, or undefined for any other host.
 */
export function findSiteByHost(host: string): EcosystemSite | undefined {
  const wanted = normalizeHost(host);
  if (wanted === '') return undefined;

  for (const site of KNOWN_SITES) {
    if (normalizeHost(site.host) === wanted) return site;
    for (const former of site.formerHosts ?? []) {
      if (normalizeHost(former) === wanted) return site;
    }
  }
  return undefined;
}

function normalizeHost(host: string): string {
  const withoutPort = host.trim().toLowerCase().split(':', 1)[0] ?? '';
  return withoutPort.startsWith('www.') ? withoutPort.slice(4) : withoutPort;
}
