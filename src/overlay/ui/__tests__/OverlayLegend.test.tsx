import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import type { OverlayLegendEntry } from '../OverlayLegend.tsx';
import { OverlayLegend } from '../OverlayLegend.tsx';

const SPECIES: readonly OverlayLegendEntry[] = [
  { id: 'setosa', label: 'Setosa', color: '#e69f00', count: 50 },
  { id: 'versicolor', label: 'Versicolor', color: '#56b4e9', count: 50 },
  { id: 'virginica', label: 'Virginica', color: '#009e73', count: 50 },
];

test('the legend names its encoding, and the group is named by that sentence', () => {
  const html = renderToStaticMarkup(
    <OverlayLegend title="Colour = species" entries={SPECIES} />,
  );

  expect(html).toContain('Colour = species');
  expect(html).toContain('role="group"');
  expect(html).toContain('aria-labelledby=');
  expect(marks(html)).toBe(3);
});

test('a count is written after the label it counts', () => {
  const html = renderToStaticMarkup(
    <OverlayLegend title="Colour = species" entries={SPECIES} />,
  );

  expect(html).toContain('Setosa (50)');
  expect(html).toContain('Virginica (50)');
});

test('nine entries at a cap of eight are written as seven and a fold', () => {
  const html = renderToStaticMarkup(
    <OverlayLegend title="Colour = group" entries={groups(9)} maxEntries={8} />,
  );

  expect(marks(html)).toBe(7);
  expect(html).toContain('Group 6');
  expect(html).not.toContain('Group 7');
  expect(html).toContain('+ 2 more');
});

test('nothing folds while every entry fits', () => {
  const html = renderToStaticMarkup(
    <OverlayLegend title="Colour = group" entries={groups(8)} maxEntries={8} />,
  );

  expect(marks(html)).toBe(8);
  expect(html).toContain('Group 7');
  expect(html).not.toContain('more');
});

test('a legend that filters is a row of buttons; a legend that only names is not', () => {
  const filter = renderToStaticMarkup(
    <OverlayLegend
      title="Colour = species"
      entries={SPECIES}
      onToggle={() => null}
    />,
  );
  const key = renderToStaticMarkup(
    <OverlayLegend title="Colour = species" entries={SPECIES} />,
  );

  expect(buttons(filter)).toBe(3);
  expect(filter).toContain('aria-pressed="true"');
  expect(buttons(key)).toBe(0);
  expect(key).not.toContain('aria-pressed');
});

test('a switched-off entry reads as switched off with the colour taken away', () => {
  const html = renderToStaticMarkup(
    <OverlayLegend
      title="Colour = species"
      entries={[
        { id: 'setosa', label: 'Setosa', color: '#e69f00', muted: true },
        { id: 'virginica', label: 'Virginica', color: '#009e73' },
      ]}
      onToggle={() => null}
    />,
  );

  expect(html).toContain('opacity:0.35');
  expect(html).toContain('text-decoration:line-through');
  expect(html).toContain('aria-pressed="false"');
  expect(html).toContain('aria-pressed="true"');
});

test('a note says why an entry is not drawn in full', () => {
  const html = renderToStaticMarkup(
    <OverlayLegend
      title="Colour = group"
      entries={[
        {
          id: 'edge',
          label: 'Cluster 4',
          color: '#009e73',
          note: 'too few samples to outline',
        },
      ]}
    />,
  );

  expect(html).toContain('too few samples to outline');
});

test('the shape channel is drawn, so one figure can carry two meanings', () => {
  const html = renderToStaticMarkup(
    <OverlayLegend
      title="Colour = species, shape = what it is"
      entries={[
        { id: 'samples', label: 'Samples', color: '#e69f00', shape: 'dot' },
        { id: 'loading', label: 'Loadings', color: '#56b4e9', shape: 'line' },
        { id: 'centre', label: 'Centroids', color: '#009e73', shape: 'cross' },
      ]}
    />,
  );

  expect(html).toContain('<circle');
  expect(html).toContain('<line');
  expect(html).toContain('<path');
  expect(html).toContain('fill="#e69f00"');
  expect(html).toContain('stroke="#56b4e9"');
});

test('the card sits in the corner it was given, and carries its test id', () => {
  const html = renderToStaticMarkup(
    <OverlayLegend
      title="Colour = species"
      entries={SPECIES}
      placement="top-right"
      testId="species-legend"
    />,
  );

  expect(html).toContain('data-testid="species-legend"');
  expect(html).toContain('top:8px');
  expect(html).toContain('right:8px');
});

function groups(count: number): OverlayLegendEntry[] {
  const entries: OverlayLegendEntry[] = [];
  for (let index = 0; index < count; index++) {
    entries.push({
      id: `group-${index}`,
      label: `Group ${index}`,
      color: '#e69f00',
    });
  }
  return entries;
}

function marks(html: string): number {
  return (html.match(/<svg/g) ?? []).length;
}

function buttons(html: string): number {
  return (html.match(/<button/g) ?? []).length;
}
