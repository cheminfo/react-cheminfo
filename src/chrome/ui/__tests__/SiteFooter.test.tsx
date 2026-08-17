import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { SiteFooter } from '../SiteFooter.tsx';

test('the footer is chrome, so it carries no-print', () => {
  const html = renderToStaticMarkup(<SiteFooter siteId="regexp" />);

  expect(html).toContain('<footer class="app-footer no-print">');
  expect(html).toContain('<div class="app-footer__inner">');
});

test('the family is listed, and the site it sits on is not linked', () => {
  const html = renderToStaticMarkup(<SiteFooter siteId="regexp" />);

  expect(html).toContain('href="https://smiles.cheminfo.org/"');
  expect(html).not.toContain('href="https://regexp.cheminfo.org/"');
  expect(html).toContain('you are here');
  expect(html).toContain('Our other tools');
});

test('a footer with no room writes the names only', () => {
  const html = renderToStaticMarkup(
    <SiteFooter siteId="regexp" layout="row" heading="The family" />,
  );

  expect(html).toContain('The family');
  expect(html).toContain('>regexp.cheminfo.org</span>');
  expect(html).not.toContain('Our other tools');
});

test('what the site adds comes under the family', () => {
  const html = renderToStaticMarkup(
    <SiteFooter siteId="regexp">
      <p className="licence">MIT</p>
    </SiteFooter>,
  );

  expect(html.indexOf('Our other tools')).toBeLessThan(
    html.indexOf('class="licence"'),
  );
});

test('an embedded page is given no footer at all', () => {
  const html = renderToStaticMarkup(<SiteFooter siteId="regexp" embedded />);

  expect(html).toBe('');
});
