// @vitest-environment jsdom
/**
 * What a canvas frames: the drawing with the whole of a figure of a set size,
 * and the sheets that hold something.
 */

import { act } from 'react';
import { afterEach, beforeEach, expect, test } from 'vitest';

import { mountRoot, root, unmountRoot } from '../../../__tests__/root.ts';
import type { Box, FigureSize } from '../../core/types.ts';
import { figureBox } from '../../render/pageGrid.ts';
import type { Scene } from '../../render/primitives.ts';
import type { PageOutline } from '../usePageSheet.ts';
import { usePageSheet } from '../usePageSheet.ts';

const SCENE: Scene = {
  items: [],
  bounds: { x: 0, y: 0, width: 100, height: 50 },
};
const SHEETS: Box[] = [
  { x: -10, y: -10, width: 200, height: 300 },
  { x: 190, y: -10, width: 200, height: 300 },
];

const seen: PageOutline[] = [];

function Probe(props: { figure?: FigureSize }) {
  seen.push(usePageSheet(SCENE, SHEETS, props.figure));
  return null;
}

beforeEach(() => {
  seen.length = 0;
  mountRoot();
});

afterEach(() => {
  unmountRoot();
});

test('a drawing of no set size frames its own bounds and the sheets it is on', () => {
  act(() => {
    root.render(<Probe />);
  });

  expect(seen[0]).toStrictEqual({
    outline: undefined,
    sheets: SHEETS,
    drawing: SCENE.bounds,
    pages: { x: -10, y: -10, width: 400, height: 300 },
  });
});

test('a figure wider than the drawing is framed whole, and kept while nothing changes', () => {
  const figure = { width: 300 };
  act(() => {
    root.render(<Probe figure={figure} />);
  });
  act(() => {
    root.render(<Probe figure={figure} />);
  });
  const outline = figureBox(SCENE, figure);

  expect(outline.width).toBe(300);
  expect(seen[0]?.outline).toStrictEqual(outline);
  expect(seen[0]?.drawing).toStrictEqual({
    x: outline.x,
    y: Math.min(0, outline.y),
    width: 300,
    height: Math.max(50, outline.y + outline.height) - Math.min(0, outline.y),
  });
  expect(seen[1]).toBe(seen[0]);
});
