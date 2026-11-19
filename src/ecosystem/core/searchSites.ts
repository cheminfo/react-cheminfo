import { SITE_GROUPS } from './groups.ts';
import { ECOSYSTEM_SITES } from './sites.ts';
import type { EcosystemSite } from './types.ts';

/** How {@link searchSites} reads the sites. */
export interface SiteSearchOptions {
  /**
   * More text each site answers to, such as its tagline and its topic in the
   * language of the page, searched beside the English record.
   * @default undefined — the English record alone
   */
  texts?: (site: EcosystemSite) => readonly string[];
  /**
   * The sites searched.
   * @default ECOSYSTEM_SITES — every site the Tools menu lists
   */
  sites?: readonly EcosystemSite[];
}

/**
 * The sites of the family that answer what was typed, best first.
 *
 * Every word typed has to be found somewhere a site is known by — its name,
 * its address, a name it had before, its tagline or its topic — with case and
 * accents ignored, so `equilibre` finds the page that writes `équilibre`. A
 * word the name or the address starts with ranks a site first, then a word
 * inside the name, then one found anywhere else; ties keep the order of the
 * catalogue.
 * @param query - What was typed.
 * @param options - See {@link SiteSearchOptions}.
 * @returns The sites found, best first; none for a query with no word in it.
 * @example
 * searchSites('nmr')[0]?.id; // 'nmr'
 */
export function searchSites(
  query: string,
  options: SiteSearchOptions = {},
): EcosystemSite[] {
  const words = searchWords(query);
  if (words.length === 0) return [];
  const { texts, sites = ECOSYSTEM_SITES } = options;

  const found: Array<{ site: EcosystemSite; score: number; at: number }> = [];
  for (let at = 0; at < sites.length; at++) {
    const site = sites[at];
    if (site === undefined) continue;
    const score = siteScore(site, words, texts?.(site) ?? []);
    if (score > 0) found.push({ site, score, at });
  }
  return found
    .toSorted(
      (first, second) => second.score - first.score || first.at - second.at,
    )
    .map((entry) => entry.site);
}

/**
 * The words a query is made of, as they are compared: lowercased, without
 * accents.
 * @param query - What was typed.
 * @returns Its words, none for a blank query.
 */
export function searchWords(query: string): string[] {
  return foldText(query)
    .split(/\s+/u)
    .filter((word) => word !== '');
}

function siteScore(
  site: EcosystemSite,
  words: readonly string[],
  extra: readonly string[],
): number {
  const name = foldText(`${site.name.lead}${site.name.alt}`);
  const host = foldText(site.host);
  const text = foldText(
    [
      site.id,
      site.name.lead,
      site.name.alt,
      site.host,
      ...(site.formerIds ?? []),
      ...(site.formerHosts ?? []),
      site.tagline,
      SITE_GROUPS.find((group) => group.id === site.group)?.label ?? '',
      ...extra,
    ].join(' '),
  );

  let score = 0;
  for (const word of words) {
    if (!text.includes(word) && !name.includes(word)) return 0;
    if (name.startsWith(word) || host.startsWith(word)) score += 3;
    else if (name.includes(word)) score += 2;
    else score += 1;
  }
  return score;
}

function foldText(text: string): string {
  return text.normalize('NFD').replaceAll(/\p{M}/gu, '').toLowerCase();
}
