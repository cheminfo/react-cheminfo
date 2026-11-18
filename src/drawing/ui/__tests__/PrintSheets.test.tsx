/**
 * The drawing as it goes on paper: one sheet per box, sized in points, and the
 * paper the printer is asked for.
 */

import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { PrintSheets } from '../PrintSheets.tsx';

test('each sheet of the grid fills a sheet of the paper, edge to edge', () => {
  const markup = renderToStaticMarkup(
    <PrintSheets
      page={{ width: 100, height: 200 }}
      boxes={[
        { x: 0, y: 0, width: 100, height: 200 },
        { x: 100, y: 0, width: 100, height: 200 },
      ]}
      paged
      figure={(box) => <rect x={box.x} y={box.y} width="5" height="5" />}
    />,
  );

  expect(markup).toBe(
    '<div class="draw-print draw-print--sheets" data-testid="print-figure"><style>@page { size: 100pt 200pt; margin: 0; }</style><svg class="draw-print__figure" width="100pt" height="200pt" viewBox="0 0 100 200"><rect x="0" y="0" width="5" height="5"></rect></svg><svg class="draw-print__figure" width="100pt" height="200pt" viewBox="100 0 100 200"><rect x="100" y="0" width="5" height="5"></rect></svg></div>',
  );
});

test('with the grid hidden, the whole figure goes on one sheet with the printer margins', () => {
  const markup = renderToStaticMarkup(
    <PrintSheets
      page={{ width: 100, height: 200 }}
      boxes={[{ x: -5, y: -5, width: 30, height: 20 }]}
      paged={false}
      figure={() => null}
    />,
  );

  expect(markup).toBe(
    '<div class="draw-print" data-testid="print-figure"><style>@page { size: 100pt 200pt; }</style><svg class="draw-print__figure" width="30pt" height="20pt" viewBox="-5 -5 30 20"></svg></div>',
  );
});
