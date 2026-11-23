import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { SwatchLegend } from '../SwatchLegend.tsx';

const ENTRIES = [
  {
    key: 'half',
    label: 'An isotope of spin ½',
    swatch: { background: '#a6d4f2', foreground: '#202020' },
  },
  {
    key: 'rare',
    label: 'Under 5 % of the element',
    swatch: { background: '#a6d4f2', foreground: '#202020' },
    hatched: true,
  },
] as const;

test('each entry is its colour and what it means', () => {
  const html = renderToStaticMarkup(<SwatchLegend entries={ENTRIES} />);

  expect(html).toContain('background:#a6d4f2');
  expect(html).toContain('An isotope of spin ½');
  expect(html).toContain('Under 5 % of the element');
  expect(html).not.toContain('<button');
});

test('a hatched entry draws the hatch its cells carry', () => {
  const html = renderToStaticMarkup(<SwatchLegend entries={ENTRIES} />);
  const rare = html.split('data-hatched="true"', 2)[1] ?? '';

  expect(html.split('data-hatched="true"')).toHaveLength(2);
  expect(rare.slice(0, 300)).toContain('repeating-linear-gradient(135deg');
});

test('with a handler each entry becomes a control, and one can be active', () => {
  const html = renderToStaticMarkup(
    <SwatchLegend entries={ENTRIES} onSelect={() => null} selected="rare" />,
  );

  expect(html.split('<button')).toHaveLength(3);

  const active = html.split('aria-pressed="true"', 2)[1] ?? '';

  expect(active).toContain('Under 5 % of the element');
  expect(active).toContain('font-weight:700');
});
