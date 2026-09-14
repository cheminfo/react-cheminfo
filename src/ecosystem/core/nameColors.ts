import { FAMILY_TOKEN_VALUES, TOKEN } from '../../tokens/core/familyTokens.ts';

import type { EcosystemSite } from './types.ts';

/** The colour each half of a site's name is written in. */
export interface SiteNameColors {
  /** The first half of the name. */
  lead: string;
  /** The second half of the name. */
  alt: string;
  /** The faint dot between an address-shaped name's two halves. */
  dot: string;
}

/** Where the family's own colours in a name come from. */
export interface SiteNameColorsOptions {
  /**
   * `tokens` reads the family's ink and faint grey from the page, falling back
   * to their values; `literal` writes the values out, for a document that
   * loads no stylesheet of ours, such as a social card.
   * @default 'tokens'
   */
  colors?: 'tokens' | 'literal';
}

/**
 * How a site's name is coloured, so a wordmark in a header, a tile in a menu
 * and a social card never write the same name two different ways.
 *
 * A site whose own logo leaves one half in black says so with `name.ink`, and
 * the colour it owns then falls on the other half rather than being spent on
 * both.
 * @param site - The site being named.
 * @param options - Whether the family's colours are read from the page.
 * @returns The colour of each half, and of the dot between them.
 */
export function siteNameColors(
  site: EcosystemSite,
  options: SiteNameColorsOptions = {},
): SiteNameColors {
  const literal = options.colors === 'literal';
  const ink = literal ? FAMILY_TOKEN_VALUES['--text'] : TOKEN.text;
  const { ink: inkHalf } = site.name;
  return {
    lead: inkHalf === 'lead' ? ink : site.brand,
    alt:
      inkHalf === 'alt' ? ink : inkHalf === 'lead' ? site.brand : site.brandAlt,
    dot: literal ? FAMILY_TOKEN_VALUES['--text-faint'] : TOKEN.textFaint,
  };
}
