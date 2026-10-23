import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { PropertyTable } from '../PropertyTable.tsx';

test('each value is a copy target, a missing one a plain cell', () => {
  const html = renderToStaticMarkup(
    <PropertyTable
      title="Composition"
      rows={[
        { label: 'Monoisotopic mass', value: '180.0634', note: 'Da' },
        { label: 'Formula', value: <b>C6H12O6</b>, copy: 'C6H12O6' },
        { label: 'logP', value: '—' },
      ]}
    />,
  );

  expect(html).toContain('<h3 class="properties__title">Composition</h3>');
  expect(html).toContain(
    'Monoisotopic mass<span class="properties__note">Da</span>',
  );
  expect(html).toContain('Copy the Monoisotopic mass (180.0634)');
  expect(html).toContain('Copy the Formula (C6H12O6)');
  expect(html).not.toContain('Copy the logP');
});

test('a group may go without a heading', () => {
  const html = renderToStaticMarkup(
    <PropertyTable rows={[{ label: 'Charge', value: 0 }]} />,
  );

  expect(html).not.toContain('<h3');
  expect(html).toContain('Copy the Charge (0)');
});
