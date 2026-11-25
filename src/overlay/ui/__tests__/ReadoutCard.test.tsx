import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { ReadoutCard } from '../ReadoutCard.tsx';

test('the card writes its title and what it names, its rows with their chips, and the way out when dismissable', () => {
  const html = renderToStaticMarkup(
    <ReadoutCard
      title="Islet"
      aside="Polygon"
      rows={[
        { key: 'area', label: 'Area', value: '1 204 µm²' },
        { key: 'c1', label: 'Insulin', value: '80', color: '#009e73' },
      ]}
      footer="+ 2 more"
      onDismiss={() => undefined}
      minWidth={160}
      maxWidth={352}
      testId="card"
    />,
  );
  // The dismiss button brings its own style element: not text of the card.
  const markup = html.replaceAll(/<style[^]*?<\/style>/g, '');
  const texts = [...markup.matchAll(/>(?<text>[^<]+)</g)].map(
    (match) => match.groups?.text,
  );

  expect(texts).toStrictEqual([
    'Islet',
    ' Polygon',
    'Area',
    '1 204 µm²',
    'Insulin',
    '80',
    '+ 2 more',
  ]);
  expect(html).toContain('min-width:160px;max-width:352px');
  expect(html).toContain('aria-label="Dismiss"');
  expect(html).toContain('background:#009e73');
  expect(html).toContain('data-testid="card"');
});

test('a card of sentences leads with its picture, wraps its values whole and ends with its notes', () => {
  const html = renderToStaticMarkup(
    <ReadoutCard
      title="Smooth"
      lead={<canvas data-testid="picture" />}
      rows={[
        { key: 'settings', label: 'Settings', value: 'σ 2 px\nedges kept' },
      ]}
      notes={<p>Switched off: its input passes through.</p>}
      wraps
    />,
  );
  const order = ['Smooth', 'data-testid="picture"', 'Settings', 'σ 2 px'].map(
    (part) => html.indexOf(part),
  );

  expect([
    order.toSorted((a, b) => a - b).join(',') === order.join(','),
    html.indexOf('Switched off') > html.indexOf('edges kept'),
    html.includes('white-space:normal'),
    html.includes(
      'flex:none;white-space:nowrap">Settings</span><span style="margin-left:auto;font-weight:600;font-variant-numeric:tabular-nums;white-space:pre-line;flex:1 1 0;min-width:0;text-align:right;overflow-wrap:anywhere">',
    ),
  ]).toStrictEqual([true, true, true, true]);
});
