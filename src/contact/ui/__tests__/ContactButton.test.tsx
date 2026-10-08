import { renderToStaticMarkup } from 'react-dom/server';
import { beforeAll, expect, test } from 'vitest';

import { CHROME_CATALOG } from '../../../i18n/core/chromeCatalog.ts';
import { SiteLanguage } from '../../../language/ui/SiteLanguage.tsx';
import { ContactButton } from '../ContactButton.tsx';

const FORM = 'https://forms.example.org/contact?site={site}&page={page}';

beforeAll(async () => {
  await CHROME_CATALOG.load('fr');
});

test('the entry opens the form in a new tab, with the site and the page filled in', () => {
  const html = renderToStaticMarkup(
    <ContactButton
      siteId="surge"
      formUrl={FORM}
      page="https://surge.cheminfo.org/?mf=C6H14"
    />,
  );

  expect(html).toContain(
    'href="https://forms.example.org/contact?site=surge&amp;page=https%3A%2F%2Fsurge.cheminfo.org%2F%3Fmf%3DC6H14"',
  );
  expect(html).toContain('target="_blank"');
  expect(html).toContain('rel="noreferrer"');
  expect(html).toContain('class="nav-link nav-link--icon"');
  expect(html).toContain('aria-label="Contact"');
  expect(html).toContain('<span class="nav-link__label">Contact</span>');
  expect(html).toContain(
    'title="A question, a problem or an idea? Write to us"',
  );
});

test('without a form address there is no entry', () => {
  expect(
    renderToStaticMarkup(<ContactButton siteId="surge" formUrl="" />),
  ).toBe('');
});

test('the words are the chrome catalog, in the language of the page', () => {
  const html = renderToStaticMarkup(
    <SiteLanguage value="fr">
      <ContactButton siteId="equilibrium" formUrl={FORM} page="" />
    </SiteLanguage>,
  );

  expect(html).toContain(
    'title="Une question, un problème, une idée ? Écrivez-nous"',
  );
  expect(html).toContain(
    'href="https://forms.example.org/contact?site=equilibrium&amp;page="',
  );
});
