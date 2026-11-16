import { expect, test } from 'vitest';

import { newGraphic } from '../graphicEdits.ts';
import type { SketchStep } from '../graphicTools.ts';
import {
  GRAPHIC_TOOLS,
  clickedGraphic,
  draggedGraphic,
  isSketchTool,
  sketchStep,
} from '../graphicTools.ts';
import type { NewGraphic } from '../graphics.ts';
import type { Point } from '../types.ts';

const L = 14.4;

// A shape as a drawing adds it, rounded and given the first identifier.
function added(graphic: NewGraphic | undefined) {
  return graphic ? newGraphic(graphic, 'd1') : undefined;
}

// The corners a step adds, or a failure for a step that adds none.
function cornersOf(step: SketchStep): Point[] {
  if (step.kind !== 'add') throw new Error('Expected a corner');
  return step.corners;
}

test('three of the eight shape tools draw corner by corner', () => {
  expect(GRAPHIC_TOOLS.filter((tool) => isSketchTool(tool))).toStrictEqual([
    'polyline',
    'curve',
    'polygon',
  ]);
});

test('a click places a rectangle three bonds by two, centred, and nothing for a sketch tool', () => {
  expect(added(clickedGraphic('rectangle', { x: 10, y: 20 }, L))).toStrictEqual(
    {
      type: 'graphic',
      id: 'd1',
      kind: 'rectangle',
      x: -11.6,
      y: 5.6,
      width: 43.2,
      height: 28.8,
    },
  );
  expect(added(clickedGraphic('circle', { x: 0, y: 0 }, L))).toStrictEqual({
    type: 'graphic',
    id: 'd1',
    kind: 'ellipse',
    x: -14.4,
    y: -14.4,
    width: 28.8,
    height: 28.8,
  });
  expect(added(clickedGraphic('line', { x: 0, y: 0 }, L))).toStrictEqual({
    type: 'graphic',
    id: 'd1',
    kind: 'line',
    points: [
      { x: -14.4, y: 0 },
      { x: 14.4, y: 0 },
    ],
  });
  expect(clickedGraphic('polygon', { x: 0, y: 0 }, L)).toBeUndefined();
});

test('a drag spans a box, a square with shift, and a circle from its centre', () => {
  const start = { x: 0, y: 0 };
  const end = { x: 30, y: -10 };

  expect(
    added(draggedGraphic('ellipse', start, end, { unit: L, even: false })),
  ).toStrictEqual({
    type: 'graphic',
    id: 'd1',
    kind: 'ellipse',
    x: 0,
    y: -10,
    width: 30,
    height: 10,
  });
  expect(
    added(
      draggedGraphic('rounded-rectangle', start, end, { unit: L, even: true }),
    ),
  ).toStrictEqual({
    type: 'graphic',
    id: 'd1',
    kind: 'rectangle',
    x: 0,
    y: -30,
    width: 30,
    height: 30,
    radius: 5.76,
  });
  expect(
    added(
      draggedGraphic(
        'circle',
        { x: 5, y: 5 },
        { x: 8, y: 9 },
        { unit: L, even: false },
      ),
    ),
  ).toStrictEqual({
    type: 'graphic',
    id: 'd1',
    kind: 'ellipse',
    x: 0,
    y: 0,
    width: 10,
    height: 10,
  });
  expect(
    draggedGraphic(
      'rectangle',
      start,
      { x: 2, y: 2 },
      { unit: L, even: false },
    ),
  ).toBeUndefined();
  expect(
    draggedGraphic('curve', start, end, { unit: L, even: false }),
  ).toBeUndefined();
});

test('a line follows the pointer, and snaps to 15° with shift', () => {
  const start = { x: 0, y: 0 };
  const end = { x: 20, y: 1 };

  expect(
    added(draggedGraphic('line', start, end, { unit: L, even: false })),
  ).toStrictEqual({
    type: 'graphic',
    id: 'd1',
    kind: 'line',
    points: [
      { x: 0, y: 0 },
      { x: 20, y: 1 },
    ],
  });
  expect(
    added(draggedGraphic('line', start, end, { unit: L, even: true })),
  ).toStrictEqual({
    type: 'graphic',
    id: 'd1',
    kind: 'line',
    points: [
      { x: 0, y: 0 },
      { x: 20.02, y: 0 },
    ],
  });
});

test('a polyline takes a corner per click, skips the corner just placed, and closes on its first', () => {
  const options = { tool: 'polyline', unit: L, even: false } as const;
  const first = { x: 0, y: 0 };

  expect(sketchStep([first], { x: 20, y: 0 }, options)).toStrictEqual({
    kind: 'add',
    corners: [first, { x: 20, y: 0 }],
    graphicKind: 'polyline',
    smooth: false,
  });

  const two = [first, { x: 20, y: 0 }];

  // A second click on the corner just placed is the end of a double click.
  expect(sketchStep(two, { x: 21, y: 1 }, options)).toStrictEqual({
    kind: 'skip',
  });
  // Two corners are a line: there is nothing to close yet.
  expect(sketchStep(two, { x: 1, y: 1 }, options)).toStrictEqual({
    kind: 'add',
    corners: [...two, { x: 1, y: 1 }],
    graphicKind: 'polyline',
    smooth: false,
  });

  const three = [...two, { x: 20, y: 20 }];

  expect(sketchStep(three, { x: 1, y: 1 }, options)).toStrictEqual({
    kind: 'close',
  });
  expect(sketchStep([], { x: 5, y: 5 }, options)).toStrictEqual({
    kind: 'add',
    corners: [{ x: 5, y: 5 }],
    graphicKind: 'polyline',
    smooth: false,
  });
});

test('a polygon is closed from its third corner, a curve is smooth, and shift snaps a side', () => {
  const two = [
    { x: 0, y: 0 },
    { x: 0, y: 30 },
  ];

  expect(
    sketchStep(
      two,
      { x: 30, y: 30 },
      { tool: 'polygon', unit: L, even: false },
    ),
  ).toStrictEqual({
    kind: 'add',
    corners: [...two, { x: 30, y: 30 }],
    graphicKind: 'polygon',
    smooth: false,
  });
  expect(
    sketchStep(two, { x: 30, y: 30 }, { tool: 'curve', unit: L, even: false }),
  ).toMatchObject({ graphicKind: 'polyline', smooth: true });

  const snapped = sketchStep(
    [{ x: 0, y: 0 }],
    { x: 20, y: 1 },
    { tool: 'polyline', unit: L, even: true },
  );
  const corner = cornersOf(snapped)[1];

  expect(corner?.x).toBeCloseTo(20.025, 3);
  expect(corner?.y).toBeCloseTo(0, 10);
});
