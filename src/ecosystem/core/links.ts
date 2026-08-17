import { ECOSYSTEM_SITES, siteUrl } from './sites.ts';

/**
 * Every site of the family as a plain list of links, for the `<noscript>` of a
 * page whose body is an empty root element.
 *
 * A crawler that runs no script sees nothing else of the page, so this is the
 * only path it has from one of our tools to the next — and each entry carries
 * the line saying what it opens, as real text.
 * @returns The `<ul>`, for the caller to place inside its own `<noscript>`.
 */
export function renderEcosystemLinksHtml(): string {
  let html = '<ul class="ecosystem-links">\n';
  for (const site of ECOSYSTEM_SITES) {
    const href = escapeHtml(siteUrl(site));
    const host = escapeHtml(site.host);
    const tagline = escapeHtml(site.tagline);
    html += `<li><a href="${href}">${host}</a> — ${tagline}</li>\n`;
  }
  return `${html}</ul>\n`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}
