import { siteById } from './lookup.ts';
import type { EcosystemSite, SiteId } from './sites.ts';

/**
 * The custom properties a site of the family sets on `:root`: the two colours
 * it owns, the readable form of the second one when that is needed, and the
 * accent bound to the first.
 *
 * It is a complete rule rather than a list of declarations, so it drops into a
 * `<style>` of a prerendered page as it is.
 * @param id - The site whose palette is wanted.
 * @returns The `:root` rule, ending in a newline.
 */
export function siteTokensCss(id: SiteId): string {
  const site = siteById(id);
  const answering = answeringColor(site);
  const declarations = [
    `--brand: ${site.brand};`,
    `--brand-alt: ${answering};`,
  ];

  // The answering colour of several sites is a yellow or an amber that sits
  // around 2:1 on white, so text set in it needs the darkened form instead.
  if (site.brandAlt !== answering) {
    declarations.push(`--brand-alt-text: ${site.brandAlt};`);
  }
  declarations.push('--accent: var(--brand);');

  return `:root {\n  ${declarations.join('\n  ')}\n}\n`;
}

/**
 * What a browser paints its own chrome with on that site — the address bar on
 * Android, the title bar of an installed page — which is the site's leading
 * colour.
 * @param id - The site whose colour is wanted.
 * @returns The colour, as the `<meta name="theme-color">` content.
 */
export function siteThemeColor(id: SiteId): string {
  return siteById(id).brand;
}

// The second colour as the site's mark draws it: on the accent element, unless
// the mark inverts the pair and gives the plate the answering colour instead.
function answeringColor(site: EcosystemSite): string {
  return site.mark.accent === site.brand ? site.mark.plate : site.mark.accent;
}
