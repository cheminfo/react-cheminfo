/**
 * The glyph a mark that is not a sample is drawn with: a cross unless it asks
 * for a disc, a ring, a square or one of the polygons a sample can take; a
 * rule shape names no point, so it is drawn as the cross.
 *
 * Every glyph is eleven pixels square, centred on (100, 50).
 */

import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { pointShapePath } from '../../core/pointShape.ts';
import type { ScatterPixelMark } from '../scatterMarkGlyph.tsx';
import { markGlyph } from '../scatterMarkGlyph.tsx';

const CENTRE: ScatterPixelMark = {
  label: 'Cluster 1',
  x: 100,
  y: 50,
  color: '#d55e00',
};

function draw(mark: Partial<ScatterPixelMark>): string {
  return renderToStaticMarkup(
    <svg>{markGlyph({ ...CENTRE, ...mark }, 11, 'k0')}</svg>,
  );
}

const CROSS =
  '<svg><path data-mark="Cluster 1" d="M94.5 44.5L105.5 55.5M105.5 44.5L94.5 55.5" ' +
  'fill="none" stroke="#d55e00"></path></svg>';

test('a mark with no shape is a cross, named for the hover card and the tests', () => {
  expect(draw({})).toBe(CROSS);
});

test('a rule shape names no point, so it is drawn as the cross too', () => {
  expect(draw({ shape: 'line' })).toBe(CROSS);
  expect(draw({ shape: 'dashed' })).toBe(CROSS);
});

test('a dot is a filled disc, and a ring the same disc left open', () => {
  expect(draw({ shape: 'dot' })).toBe(
    '<svg><circle data-mark="Cluster 1" cx="100" cy="50" r="5.5" fill="#d55e00" stroke="none"></circle></svg>',
  );
  expect(draw({ shape: 'ring' })).toBe(
    '<svg><circle data-mark="Cluster 1" cx="100" cy="50" r="5.5" fill="none" stroke="#d55e00"></circle></svg>',
  );
});

test('a square fills the glyph’s whole box', () => {
  expect(draw({ shape: 'square' })).toBe(
    '<svg><rect data-mark="Cluster 1" x="94.5" y="44.5" width="11" height="11" fill="#d55e00" stroke="none"></rect></svg>',
  );
});

test('the polygons are the very shapes a sample takes, at the disc’s size', () => {
  for (const shape of ['triangle', 'triangle-down', 'diamond'] as const) {
    expect(draw({ shape })).toBe(
      `<svg><path data-mark="Cluster 1" d="${String(pointShapePath(shape, 100, 50, 5.5))}" fill="#d55e00" stroke="none"></path></svg>`,
    );
  }
});
