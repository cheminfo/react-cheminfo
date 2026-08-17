import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { ECOSYSTEM_SITES } from '../../core/sites.ts';
import { Wordmark } from '../Wordmark.tsx';

test('a one-word name takes .cheminfo after a faint dot', () => {
  const html = renderToStaticMarkup(<Wordmark siteId="smiles" />);

  expect(html).toContain('<span class="wordmark__lead" style="color:#1c6e42">');
  expect(html).toContain('>smiles</span>');
  expect(html).toContain(
    '<span class="wordmark__dot" style="color:var(--text-faint, #8a96a3)">.</span>',
  );
  expect(html).toContain('<span class="wordmark__alt" style="color:#9a3412">');
  expect(html).toContain('>cheminfo</span>');
});

test('a name that splits on itself carries no domain and no dot', () => {
  const html = renderToStaticMarkup(<Wordmark siteId="equilibrium" />);

  expect(html).toContain('>Equi</span>');
  expect(html).toContain('>Librium</span>');
  expect(html).not.toContain('wordmark__dot');
  expect(html).not.toContain('cheminfo');
});

test('no site ever writes the .org', () => {
  for (const site of ECOSYSTEM_SITES) {
    const html = renderToStaticMarkup(<Wordmark siteId={site.id} />);

    expect(html).not.toContain('.org');
  }
});

test('the size is the font size, and the family class is always carried', () => {
  const plain = renderToStaticMarkup(<Wordmark siteId="pt" />);
  const sized = renderToStaticMarkup(
    <Wordmark siteId="pt" size={26} className="brand__name" />,
  );

  expect(plain).toContain('class="wordmark"');
  expect(plain).toContain('font-size:17px');
  expect(sized).toContain('class="wordmark brand__name"');
  expect(sized).toContain('font-size:26px');
});
