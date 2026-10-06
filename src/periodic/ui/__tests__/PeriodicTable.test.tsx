import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { categorySwatch } from '../../core/categories.ts';
import { PeriodicTable } from '../PeriodicTable.tsx';
import { UNIT, ofWidth } from '../unit.ts';

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
  expect(cell.slice(0, 2000)).toContain('outline-style:solid');
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

test('the corner is a button only when the table takes the whole of it', () => {
  const plain = renderToStaticMarkup(<PeriodicTable headers />);
  const withCorner = renderToStaticMarkup(
    <PeriodicTable headers onSelectAll={() => null} />,
  );

  // Left alone the corner stays empty, as it always was.
  expect(plain).not.toContain('aria-label="All elements"');
  expect(withCorner).toContain(
    '<button type="button" aria-label="All elements"',
  );

  // It stands where the two strips meet, and points into the grid it takes.
  const corner = withCorner.split('aria-label="All elements"', 2)[1] ?? '';

  expect(corner.slice(0, 600)).toContain('grid-column:1;grid-row:1');
  expect(corner.slice(0, 600)).toContain('>◢</button>');
});

test('a clickable header says what it is on hover, not only to a reader', () => {
  const clickable = renderToStaticMarkup(
    <PeriodicTable headers onSelectRange={() => null} />,
  );

  expect(clickable).toContain('aria-label="Group 18" title="Group 18"');
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

test('a class given to the table lands on its outermost element', () => {
  const html = renderToStaticMarkup(<PeriodicTable className="picker" />);

  expect(html.startsWith('<div class="picker"')).toBe(true);
});

test('a long value is written smaller rather than cut short', () => {
  const short = renderToStaticMarkup(<PeriodicTable detailOf={() => '2.55'} />);
  const long = renderToStaticMarkup(
    <PeriodicTable detailOf={() => '8.988e-5'} />,
  );

  // Four glyphs have room to spare, so they are written at the cap; eight do
  // not, and the whole table steps down with them rather than cutting any.
  expect(short).toContain(`font-size:max(0.4rem, ${ofWidth(1.5)})`);
  expect(long).toContain(`font-size:max(0.4rem, ${ofWidth(0.95)})`);
  expect(short).not.toContain('text-overflow');
  expect(long).not.toContain('text-overflow');
});

test('one size writes the third line of every cell of a table', () => {
  const html = renderToStaticMarkup(
    <PeriodicTable detailOf={(element) => element.name} />,
  );
  const size = `font-size:max(0.4rem, ${ofWidth(0.95)})`;

  // Tin and praseodymium are written alike; the longer of the two is condensed
  // to fit rather than written smaller than its neighbours.
  expect(cellOf(html, 'Sn')).toContain(size);
  expect(cellOf(html, 'Pr')).toContain(size);
  expect(cellOf(html, 'Sn')).not.toContain('transform:scaleX');
  expect(cellOf(html, 'Pr')).toContain('transform:scaleX(0.7');
});

test('a wide symbol is written smaller so it stays clear of the shells', () => {
  const html = renderToStaticMarkup(
    <PeriodicTable shellsOf={() => [2, 8, 1]} />,
  );

  // Iron has room beside the column of electrons; curium, an em wider, does
  // not, and steps down rather than running into it.
  expect(cellOf(html, 'Fe')).toContain(
    `font-size:max(0.5rem, ${ofWidth(2.1)})`,
  );
  expect(cellOf(html, 'Cm')).toContain(
    `font-size:max(0.5rem, ${ofWidth(1.707)})`,
  );
});

test('the electrons of each shell stand down the right edge, at one size', () => {
  const bare = renderToStaticMarkup(<PeriodicTable />);
  const html = renderToStaticMarkup(
    <PeriodicTable
      detailOf={(element) => element.name}
      shellsOf={(element) => (element.symbol === 'Fr' ? SEVEN : [2, 8, 1])}
    />,
  );

  // The deepest stack of the table is what the size fits, so francium's seven
  // and sodium's three are written alike.
  expect(cellOf(html, 'Fr')).toContain('2\n8\n18\n32\n18\n8\n1');
  expect(cellOf(html, 'Na')).toContain(
    `font-size:max(0.3rem, ${ofWidth(0.81)})`,
  );
  expect(cellOf(html, 'Fr')).toContain(
    `font-size:max(0.3rem, ${ofWidth(0.81)})`,
  );
  // The column is reserved in the cell rather than laid over the symbol.
  expect(cellOf(html, 'Na')).toContain(
    `grid-template-columns:1fr ${ofWidth(1.2)};column-gap:${ofWidth(0.5)}`,
  );
  expect(bare).toContain('grid-template-columns:1fr;');
  expect(bare).not.toContain('grid-row:1 / span 3');
});

/** Francium's shells, the deepest stack of the table. */
const SEVEN = [2, 8, 18, 32, 18, 8, 1];

/**
 * The markup of one cell.
 * @param html - The whole table.
 * @param symbol - The element to read.
 * @returns What that cell carries.
 */
function cellOf(html: string, symbol: string): string {
  return (html.split(`data-symbol="${symbol}"`, 2)[1] ?? '').slice(0, 2000);
}

test('every cell has the same three bands, whether or not a value is written', () => {
  const bare = renderToStaticMarkup(<PeriodicTable />);
  const withValue = renderToStaticMarkup(
    <PeriodicTable detailOf={() => '1'} />,
  );

  for (const html of [bare, withValue]) {
    expect(html).toContain(
      `grid-template-rows:${ofWidth(1.8)} 1fr ${ofWidth(1.8)}`,
    );
    expect(html).toContain(`repeat(7, ${ofWidth(6.8)})`);
  }
});

test('the type of a cell is a share of the table, so it grows with it', () => {
  const html = renderToStaticMarkup(<PeriodicTable />);

  expect(html).toContain('container-type:inline-size');
  expect(html).toContain(UNIT);
  expect(html).not.toContain('aspect-ratio');
});

test('a render that never measures falls back to the container unit', () => {
  // A server render, and a prerendered page before its script runs: nothing
  // has set the property, so the drawing is the one it has always been.
  const html = renderToStaticMarkup(<PeriodicTable headers />);

  expect(html).toContain('var(--periodic-unit, 1cqw)');
  expect(html).not.toContain('--periodic-unit:');
  expect(html).not.toContain('getBoundingClientRect');
});

test('the empty block holds what the tool writes there, and nothing by default', () => {
  const bare = renderToStaticMarkup(<PeriodicTable />);
  const html = renderToStaticMarkup(
    <PeriodicTable inset={<span>Rubidium, [Kr] 5s1</span>} />,
  );

  expect(bare).not.toContain('grid-column:3 / span 10');
  expect(html).toContain('grid-column:3 / span 10');
  expect(html).toContain('grid-row:1 / span 3');
  expect(html).toContain('<span>Rubidium, [Kr] 5s1</span>');
});

test('the header strips shift the empty block with the cells', () => {
  const html = renderToStaticMarkup(
    <PeriodicTable headers inset={<span>here</span>} />,
  );

  expect(html).toContain('grid-column:4 / span 10');
  expect(html).toContain('grid-row:2 / span 3');
});
