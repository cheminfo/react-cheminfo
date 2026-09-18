// tokens-ok: file — the block a site renders is written here.
import { siteById } from './lookup.ts';
import type { SiteId, SiteRecord } from './sites.ts';

/**
 * The custom properties a site of the family sets on `:root`: the two colours
 * it owns, the readable form of the second one when that is needed, and the
 * accent bound to the first.
 *
 * It is a complete rule rather than a list of declarations, so it drops into a
 * `<style>` of a prerendered page as it is.
 * @param site - The site whose palette is wanted: its id, or the record of a
 *   site that is not one of the family.
 * @returns The `:root` rule, ending in a newline.
 */
export function siteTokensCss(site: SiteId | SiteRecord): string {
  const record = typeof site === 'string' ? siteById(site) : site;
  const answering = answeringColor(record);
  const declarations = [
    `--brand: ${record.brand};`,
    `--brand-alt: ${answering};`,
  ];

  // The answering colour of several sites is a yellow or an amber that sits
  // around 2:1 on white, so text set in it needs the darkened form instead.
  if (record.brandAlt !== answering) {
    declarations.push(`--brand-alt-text: ${record.brandAlt};`);
  }
  declarations.push('--accent: var(--brand);');

  return `:root {\n  ${declarations.join('\n  ')}\n}\n`;
}

// The second colour as the site's mark draws it: on the accent element, unless
// the mark inverts the pair and gives the plate the answering colour instead.
function answeringColor(site: SiteRecord): string {
  return site.mark.accent === site.brand ? site.mark.plate : site.mark.accent;
}
