import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { categorySwatch } from '../../core/categories.ts';
import { PeriodicTable } from '../PeriodicTable.tsx';

test('every element is drawn, announced by name rather than by symbol', () => {
  const html = renderToStaticMarkup(<PeriodicTable />);

  expect(html.split('data-testid="element-')).toHaveLength(119);
  expect(html).toContain('aria-label="Chlorine (Cl, Z = 17)"');
  expect(html).toContain('aria-label="Oganesson (Og, Z = 118)"');
});

test('a cell takes its family colour, and its ink, by default', () => {
  const html = renderToStaticMarkup(<PeriodicTable />);
  const halogen = categorySwatch('halogen');

  expect(html).toContain(`background:${halogen.background}`);
  expect(html).toContain(`color:${halogen.foreground}`);
});

test('the selected cell is outlined, so a property colour survives selection', () => {
  const html = renderToStaticMarkup(<PeriodicTable selected="Fe" />);
  const cell = html.split('data-testid="element-Fe"', 2)[1] ?? '';

  expect(cell).toContain('aria-pressed="true"');
  expect(cell.slice(0, 600)).toContain('outline:2px solid');
  expect(html).toContain(
    `background:${categorySwatch('transition-metal').background}`,
  );
});

test('the caller decides the colour and the third line of each cell', () => {
  const html = renderToStaticMarkup(
    <PeriodicTable
      swatchOf={() => ({ background: '#123456', foreground: '#abcdef' })}
      detailOf={(element) => String(element.period)}
    />,
  );

  expect(html).toContain('background:#123456');
  expect(html).not.toContain(categorySwatch('halogen').background);
  expect(html).toContain('>7</span>');
});

test('an element outside the shown set is dimmed rather than removed', () => {
  const html = renderToStaticMarkup(
    <PeriodicTable isIncluded={(element) => element.period === 2} />,
  );

  expect(html.split('data-testid="element-')).toHaveLength(119);
  expect(html.split('opacity:0.28')).toHaveLength(111);
});

test('the site names the elements when it carries its own names', () => {
  const html = renderToStaticMarkup(
    <PeriodicTable
      nameOf={(element) => `Élément ${String(element.atomicNumber)}`}
    />,
  );

  expect(html).toContain('aria-label="Élément 17 (Cl, Z = 17)"');
});

test('the header strips are drawn only when asked, as labels or as buttons', () => {
  const plain = renderToStaticMarkup(<PeriodicTable />);
  const labelled = renderToStaticMarkup(<PeriodicTable headers />);
  const clickable = renderToStaticMarkup(
    <PeriodicTable headers onSelectRange={() => null} />,
  );

  expect(plain).not.toContain('grid-column:1;grid-row:1">1</div>');
  // A label is a plain div carrying the number; only a clickable strip is a
  // button, and only a button needs to say which run it stands for.
  expect(labelled).toContain('grid-column:1;grid-row:8">7</div>');
  expect(labelled).not.toContain('aria-label="Group 18"');
  expect(clickable).toContain('<button type="button" aria-label="Group 18"');
  expect(clickable).toContain('<button type="button" aria-label="Period 7"');
});

test('the markers stand where the two series were lifted out, unless waived', () => {
  const withMarkers = renderToStaticMarkup(<PeriodicTable />);
  const without = renderToStaticMarkup(<PeriodicTable markers={false} />);

  expect(withMarkers).toContain('57–71');
  expect(withMarkers).toContain('89–103');
  expect(without).not.toContain('57–71');
});

test('the header strips shift every cell by one row and one column', () => {
  const plain = renderToStaticMarkup(<PeriodicTable />);
  const withHeaders = renderToStaticMarkup(<PeriodicTable headers />);

  expect(plain.split('data-testid="element-H"', 2)[1]).toContain(
    'grid-column:1;grid-row:1',
  );
  expect(withHeaders.split('data-testid="element-H"', 2)[1]).toContain(
    'grid-column:2;grid-row:2',
  );
});

test('the legend is drawn only when asked, and names every family', () => {
  const plain = renderToStaticMarkup(<PeriodicTable />);
  const withLegend = renderToStaticMarkup(<PeriodicTable legend />);

  expect(plain).not.toContain('Alkaline earth');
  expect(withLegend).toContain('Alkali metal');
  expect(withLegend).toContain('Post-transition');
  expect(withLegend).toContain('Lanthanoid');
  expect(withLegend).toContain('Actinoid');
});
