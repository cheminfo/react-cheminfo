/**
 * The cover over everything around a page shown alone: the view with the page
 * cut out of it, and the page's edge.
 */

import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { PageMask } from '../PageMask.tsx';

test('the view is covered but for the page, cut out by the even–odd rule', () => {
  expect(
    renderToStaticMarkup(
      <PageMask
        sheet={{ x: 10, y: 20, width: 100, height: 200 }}
        visible={{ x: -50, y: -40, width: 300, height: 400 }}
      />,
    ),
  ).toBe(
    '<g data-testid="draw-page-mask" aria-hidden="true"><path class="draw-page-mask" fill-rule="evenodd" d="M-50 -40h300v400h-300ZM10 20h100v200h-100Z"></path><rect class="draw-page-edge" x="10" y="20" width="100" height="200"></rect></g>',
  );
});

test('with no page shown alone, nothing is covered', () => {
  expect(
    renderToStaticMarkup(
      <PageMask sheet={null} visible={{ x: 0, y: 0, width: 1, height: 1 }} />,
    ),
  ).toBe('');
});
