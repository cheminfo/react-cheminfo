import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { ECOSYSTEM_SITES, siteUrl } from '../../core/sites.ts';
import { EcosystemLinks } from '../EcosystemLinks.tsx';
import { EcosystemMenu } from '../EcosystemMenu.tsx';

test('every site of the family is a followable link in the markup', () => {
  const html = renderToStaticMarkup(<EcosystemLinks />);

  for (const site of ECOSYSTEM_SITES) {
    expect(html).toContain(`href="${siteUrl(site)}"`);
  }

  expect(html.match(/<a /g)).toHaveLength(16);
});

test('what each site does is text in the page, never a title attribute', () => {
  const html = renderToStaticMarkup(<EcosystemLinks />);

  for (const site of ECOSYSTEM_SITES) {
    expect(html).toContain(`>${site.tagline}</div>`);
  }

  expect(html).not.toContain('title=');
});

test('the name of each site is text a link can be read by', () => {
  const html = renderToStaticMarkup(<EcosystemLinks />);

  expect(html).toContain('>smiles</span>');
  expect(html).toContain('>Chem</span>');
  expect(html).toContain('>Calc</span>');
});

test('a crawler is never told to ignore one of them', () => {
  const html = renderToStaticMarkup(<EcosystemLinks currentSiteId="tex" />);

  expect(html).not.toContain('nofollow');
  expect(html).not.toContain('rel=');
  expect(html).not.toContain('target=');
});

test('the site it sits on is written but not linked', () => {
  const html = renderToStaticMarkup(<EcosystemLinks currentSiteId="tex" />);

  expect(html).toContain('you are here');
  expect(html).not.toContain('href="https://tex.cheminfo.org/"');
  expect(html.match(/<a /g)).toHaveLength(15);
});

test('the row layout writes the names only, and still links every site', () => {
  const html = renderToStaticMarkup(<EcosystemLinks layout="row" />);

  expect(html.match(/<a /g)).toHaveLength(16);
  expect(html).toContain('>smiles.cheminfo.org</a>');
  expect(html).not.toContain(ECOSYSTEM_SITES[0]?.tagline ?? '');
});

test('the menu carries the same links, for the visitor who opens it', () => {
  const html = renderToStaticMarkup(<EcosystemMenu currentSiteId="tex" />);

  expect(html.match(/<a /g)).toHaveLength(15);
  expect(html).toContain('target="_blank"');
});
