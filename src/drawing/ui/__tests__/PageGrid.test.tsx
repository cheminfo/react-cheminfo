/**
 * The lines between the sheets of a drawing, and the number of each sheet
 * that holds something, sized in screen pixels whatever the zoom.
 */

import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { boxSheets } from '../../render/pageGrid.ts';
import { PageGrid } from '../PageGrid.tsx';

test('each sheet holding something is numbered in its corner, at a constant size on screen', () => {
  const markup = renderToStaticMarkup(
    <PageGrid
      sheets={[
        { x: 0, y: 0, width: 100, height: 200 },
        { x: 100, y: 0, width: 100, height: 200 },
      ]}
      visible={{ x: -10, y: -10, width: 220, height: 220 }}
      pixel={0.5}
    />,
  );

  expect(markup).toMatch(/^<g data-testid="draw-page-grid" class="no-print"/);
  expect(markup).toContain(
    '<text class="draw-sheet__number" x="3" y="8.5" font-size="5.5">Page 1</text>',
  );
  expect(markup).toContain(
    '<text class="draw-sheet__number" x="103" y="8.5" font-size="5.5">Page 2</text>',
  );
});

test('with the page lines hidden, nothing is drawn', () => {
  expect(
    renderToStaticMarkup(
      <PageGrid
        sheets={[]}
        visible={{ x: 0, y: 0, width: 1, height: 1 }}
        pixel={1}
      />,
    ),
  ).toBe('');
});

test('the sheets an editor knowing its drawing as boxes prints, in reading order', () => {
  const page = { width: 100, height: 200, x: 0, y: 0 };

  expect(
    boxSheets(
      [
        { x: 150, y: 10, width: 20, height: 20 },
        { x: 10, y: 250, width: 20, height: 20 },
        { x: 20, y: 20, width: 10, height: 10 },
      ],
      page,
    ),
  ).toStrictEqual([
    { x: 0, y: 0, width: 100, height: 200 },
    { x: 100, y: 0, width: 100, height: 200 },
    { x: 0, y: 200, width: 100, height: 200 },
  ]);
  expect(boxSheets([], page)).toStrictEqual([
    { x: 0, y: 0, width: 100, height: 200 },
  ]);
});
