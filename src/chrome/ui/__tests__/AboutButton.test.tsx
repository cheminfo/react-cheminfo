import { renderToStaticMarkup } from 'react-dom/server';
import { beforeAll, expect, test } from 'vitest';

import { CHROME_CATALOG } from '../../../i18n/core/chromeCatalog.ts';
import { SiteLanguage } from '../../../language/ui/SiteLanguage.tsx';
import { AboutButton } from '../AboutButton.tsx';

beforeAll(async () => {
  await CHROME_CATALOG.load('fr');
});

test('the entry is a link carrying the one glyph About has on every site', () => {
  const html = renderToStaticMarkup(<AboutButton href="/about" />);

  expect(html).toContain('class="nav-link nav-link--icon"');
  expect(html).toContain('href="/about"');
  expect(html).toContain('aria-label="About"');
  expect(html).toContain('info-sign');
  expect(html).toContain('<span class="nav-link__label">About</span>');
  expect(html).toContain(
    'title="What this site is, what it is built on, and how to cite it"',
  );
});

test('the About on show takes the brand tint', () => {
  const html = renderToStaticMarkup(<AboutButton active href="/about" />);

  expect(html).toContain('class="nav-link nav-link--icon nav-link--active"');
});

test('the words are the chrome catalog, in the language of the page', () => {
  const html = renderToStaticMarkup(
    <SiteLanguage value="fr">
      <AboutButton href="/fr/about" />
    </SiteLanguage>,
  );

  expect(html).toContain('<span class="nav-link__label">À propos</span>');
  expect(html).toContain('href="/fr/about"');
  expect(html).toContain('Ce qu&#x27;est ce site');
});

test('a site may write its own words and name the entry itself', () => {
  const html = renderToStaticMarkup(
    <AboutButton
      href="/cheminfo/surge/about"
      id="/about"
      label="About Surge"
      title="What Surge enumerates"
    />,
  );

  expect(html).toContain('aria-label="About Surge"');
  expect(html).toContain('title="What Surge enumerates"');
  expect(html).toContain('href="/cheminfo/surge/about"');
});
