/**
 * The edge of a figure of a set size on the canvas, and the icon of a row or
 * a column of objects.
 */

import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { ArrangeIcon } from '../ArrangeIcon.tsx';
import { FigureOutline } from '../FigureOutline.tsx';

test('a figure of a set size is outlined; one fitting the drawing is not', () => {
  expect(
    renderToStaticMarkup(
      <FigureOutline box={{ x: -10, y: 5, width: 240, height: 120 }} />,
    ),
  ).toBe(
    '<rect class="draw-figure-outline" data-testid="draw-figure-outline" x="-10" y="5" width="240" height="120"></rect>',
  );
  expect(renderToStaticMarkup(<FigureOutline box={undefined} />)).toBe('');
});

test('the icon of a column is the icon of a row turned a quarter', () => {
  const row = renderToStaticMarkup(<ArrangeIcon along="row" />);
  const column = renderToStaticMarkup(<ArrangeIcon along="column" />);

  expect(row).toContain('<g><rect x="0" y="7.25"');
  expect(column).toContain(
    '<g transform="rotate(90 8 8)"><rect x="0" y="7.25"',
  );
  expect(column.replace(' transform="rotate(90 8 8)"', '')).toBe(row);
  expect(row.match(/<rect /g)).toHaveLength(4);
});
