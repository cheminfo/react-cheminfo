import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { siteById } from '../../core/lookup.ts';
import { ECOSYSTEM_SITES } from '../../core/sites.ts';
import { SiteMark } from '../marks.tsx';

test('a mark is drawn from the site itself or from its identifier alike', () => {
  const byId = renderToStaticMarkup(<SiteMark siteId="pdb" />);
  const bySite = renderToStaticMarkup(<SiteMark site={siteById('pdb')} />);

  expect(byId).toBe(bySite);
  expect(byId).toContain('width="28" height="28"');
  expect(byId).toContain('fill="#2563eb"');
  expect(byId).toContain('fill="#fbbf24"');
});

test('a mark with neither the site nor its identifier says so', () => {
  expect(() => renderToStaticMarkup(<SiteMark />)).toThrow(
    'SiteMark needs one of its `site` and `siteId` props',
  );
});

test('token colours let a site retune its own mark', () => {
  const html = renderToStaticMarkup(<SiteMark siteId="pdb" colors="tokens" />);

  expect(html).toContain('fill="var(--brand)"');
  expect(html).toContain('fill="var(--brand-alt)"');
  expect(html).not.toContain('#2563eb');
  expect(html).not.toContain('#fbbf24');
});

test('the plate can be dropped for a mark already on a coloured surface', () => {
  const withPlate = renderToStaticMarkup(<SiteMark siteId="smiles" />);
  const without = renderToStaticMarkup(
    <SiteMark siteId="smiles" plate={false} />,
  );

  expect(withPlate).toContain('<rect');
  expect(without).not.toContain('<rect');
  expect(without).toContain('stroke="#ea580c"');
});

test('a plate as light as the page keeps its hairline', () => {
  const html = renderToStaticMarkup(<SiteMark siteId="lcao" size={16} />);

  expect(html).toContain('width="16" height="16"');
  expect(html).toContain('stroke="#dfe3e8"');
  expect(html).toContain('rx="6.5"');
});

test('every site of the family has a mark that draws', () => {
  for (const site of ECOSYSTEM_SITES) {
    const html = renderToStaticMarkup(<SiteMark siteId={site.id} />);

    expect(html.startsWith('<svg')).toBe(true);
    expect(html).not.toContain('undefined');
  }
});
