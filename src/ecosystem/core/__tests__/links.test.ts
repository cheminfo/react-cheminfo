import { expect, test } from 'vitest';

import { renderEcosystemLinksHtml } from '../links.ts';
import { ECOSYSTEM_SITES, siteUrl } from '../sites.ts';

test('every site of the family is one followable list item', () => {
  const html = renderEcosystemLinksHtml();

  expect(html.match(/<li>/g)).toHaveLength(15);

  for (const site of ECOSYSTEM_SITES) {
    expect(html).toContain(
      `<li><a href="${siteUrl(site)}">${site.host}</a> — ${site.tagline}</li>`,
    );
  }
});

test('the list opens and closes on its own', () => {
  const html = renderEcosystemLinksHtml();

  expect(html.startsWith('<ul class="ecosystem-links">\n')).toBe(true);
  expect(html.endsWith('</ul>\n')).toBe(true);
});

test('every angle bracket of the page belongs to a tag this wrote', () => {
  const html = renderEcosystemLinksHtml();

  // The list, and four tags per site: the item, the link, and both closings.
  expect(html.match(/</g)).toHaveLength(62);
  expect(html.match(/>/g)).toHaveLength(62);
  expect(html).not.toContain('&');
});
