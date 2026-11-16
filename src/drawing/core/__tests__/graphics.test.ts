import { expect, test } from 'vitest';

import {
  newGraphic,
  patchedGraphic,
  scaleGraphic,
  shiftGraphic,
  transformGraphic,
} from '../graphicEdits.ts';
import { distanceToGraphic } from '../graphicOutline.ts';
import type { DrawGraphic } from '../graphics.ts';
import { graphicCorners, isBoxGraphic, isClosedGraphic } from '../graphics.ts';
import { parseGraphic } from '../parseGraphic.ts';

const BOX: DrawGraphic = {
  type: 'graphic',
  id: 'd1',
  kind: 'rectangle',
  x: 0,
  y: 0,
  width: 20,
  height: 10,
};
const TRIANGLE: DrawGraphic = {
  type: 'graphic',
  id: 'd2',
  kind: 'polygon',
  points: [
    { x: 40, y: 0 },
    { x: 60, y: 0 },
    { x: 50, y: 10 },
  ],
};

// The graphics of a file that fit the schema.
function parsedAll(values: readonly unknown[]): DrawGraphic[] {
  const graphics: DrawGraphic[] = [];
  for (const value of values) {
    const graphic = parseGraphic(value);
    if (graphic) graphics.push(graphic);
  }
  return graphics;
}

test('a box is a rectangle or an ellipse, and only a line and a polyline are open', () => {
  expect(isBoxGraphic(BOX)).toBe(true);
  expect(isBoxGraphic(TRIANGLE)).toBe(false);
  expect(isClosedGraphic(TRIANGLE)).toBe(true);
  expect(isClosedGraphic({ kind: 'ellipse' })).toBe(true);
  expect(isClosedGraphic({ kind: 'polyline' })).toBe(false);
  expect(isClosedGraphic({ kind: 'line' })).toBe(false);
});

test('a box holds its corners, turned with it, and an ellipse the middles of its sides', () => {
  expect(graphicCorners(BOX)).toStrictEqual([
    { x: 0, y: 0 },
    { x: 20, y: 0 },
    { x: 20, y: 10 },
    { x: 0, y: 10 },
  ]);
  expect(graphicCorners({ ...BOX, kind: 'ellipse' })).toStrictEqual([
    { x: 10, y: 0 },
    { x: 20, y: 5 },
    { x: 10, y: 10 },
    { x: 0, y: 5 },
  ]);

  const turned = graphicCorners({ ...BOX, rotation: 90 });
  const expected = [
    { x: 15, y: -5 },
    { x: 15, y: 15 },
    { x: 5, y: 15 },
    { x: 5, y: -5 },
  ];

  expect(turned).toHaveLength(4);

  for (let index = 0; index < expected.length; index++) {
    expect(turned[index]?.x).toBeCloseTo(expected[index]?.x ?? Number.NaN, 10);
    expect(turned[index]?.y).toBeCloseTo(expected[index]?.y ?? Number.NaN, 10);
  }
});

test('a patch keeps only what the kind of shape can carry', () => {
  const line = newGraphic(
    {
      kind: 'line',
      points: [
        { x: 0, y: 0 },
        { x: 10.004, y: 0 },
      ],
    },
    'd1',
  );

  expect(line).toStrictEqual({
    type: 'graphic',
    id: 'd1',
    kind: 'line',
    points: [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
    ],
  });
  // A line has no inside to fill, and no corners to round.
  expect(
    patchedGraphic(line, { fill: '#0072b2', radius: 3, dashed: true }),
  ).toStrictEqual({ ...line, dashed: true });

  const filled = patchedGraphic(BOX, {
    fill: '#e69f0080',
    outline: false,
    kind: 'polygon',
  });

  expect(filled).toStrictEqual({
    ...BOX,
    fill: '#e69f0080',
    outline: false,
  });
  // Without its fill, a shape is drawn by its outline again.
  expect(patchedGraphic(filled, { fill: undefined })).toStrictEqual(BOX);
});

test('a shape is moved, and scaled about a centre', () => {
  expect(shiftGraphic(BOX, { x: 5, y: -2.5 })).toStrictEqual({
    ...BOX,
    x: 5,
    y: -2.5,
  });
  expect(shiftGraphic(TRIANGLE, { x: 5, y: -2.5 })).toStrictEqual({
    ...TRIANGLE,
    points: [
      { x: 45, y: -2.5 },
      { x: 65, y: -2.5 },
      { x: 55, y: 7.5 },
    ],
  });
  expect(scaleGraphic({ ...BOX, radius: 2 }, { x: 0, y: 0 }, 2)).toStrictEqual({
    ...BOX,
    width: 40,
    height: 20,
    radius: 4,
  });
});

test('an open shape is reached along its outline, a filled one anywhere inside', () => {
  expect(distanceToGraphic(BOX, { x: 10, y: 5 })).toBe(5);
  expect(distanceToGraphic({ ...BOX, fill: '#56b4e9' }, { x: 10, y: 5 })).toBe(
    0,
  );
  expect(
    distanceToGraphic({ ...BOX, kind: 'ellipse' }, { x: 10, y: 5 }),
  ).toBeCloseTo(5, 1);
  // A rounded corner passes 5√2 − 5 from the corner of its box.
  expect(
    distanceToGraphic(
      { ...BOX, width: 30, height: 30, radius: 5 },
      {
        x: 0,
        y: 0,
      },
    ),
  ).toBeCloseTo(2.07, 1);
});

test('shapes read from a file are kept only when they fit the schema', () => {
  const objects = parsedAll([
    {
      type: 'graphic',
      id: 'd1',
      kind: 'rectangle',
      x: 0,
      y: 0,
      width: 20,
      height: 10,
      radius: 2,
      fill: '#e69f0080',
      outline: false,
      lineWidth: 1.2,
      dashed: true,
      color: '#0072b2',
    },
    {
      type: 'graphic',
      id: 'd2',
      kind: 'polygon',
      points: [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
      ],
    },
    {
      type: 'graphic',
      id: 'd3',
      kind: 'line',
      points: [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
        { x: 2, y: 2 },
      ],
    },
    {
      type: 'graphic',
      id: 'd4',
      kind: 'polyline',
      points: [
        { x: 0, y: 0 },
        { x: 5, y: 5 },
      ],
      fill: '#000000',
      lineWidth: 20,
      color: 'red',
    },
    {
      type: 'graphic',
      id: 'd5',
      kind: 'ellipse',
      x: 0,
      y: 0,
      width: -3,
      height: 4,
    },
    {
      type: 'graphic',
      id: 'd6',
      kind: 'star',
      x: 0,
      y: 0,
      width: 3,
      height: 4,
    },
    {
      type: 'graphic',
      id: 'd7',
      kind: 'ellipse',
      x: 0,
      y: 0,
      width: 3,
      height: 4,
      outline: false,
    },
  ]);

  expect(objects).toStrictEqual([
    {
      type: 'graphic',
      id: 'd1',
      kind: 'rectangle',
      x: 0,
      y: 0,
      width: 20,
      height: 10,
      radius: 2,
      fill: '#e69f0080',
      outline: false,
      lineWidth: 1.2,
      dashed: true,
      color: '#0072b2',
    },
    {
      type: 'graphic',
      id: 'd4',
      kind: 'polyline',
      points: [
        { x: 0, y: 0 },
        { x: 5, y: 5 },
      ],
    },
    {
      type: 'graphic',
      id: 'd7',
      kind: 'ellipse',
      x: 0,
      y: 0,
      width: 3,
      height: 4,
    },
  ]);
  expect(parseGraphic({ kind: 'rectangle', x: 0, y: 0 })).toBeUndefined();
});

test('a curve is reached along the curve, not along its straight sides', () => {
  const arc: DrawGraphic = {
    type: 'graphic',
    id: 'd1',
    kind: 'polyline',
    points: [
      { x: 0, y: 0 },
      { x: 10, y: -10 },
      { x: 20, y: 0 },
    ],
    smooth: true,
  };
  const near = { x: 3.2, y: -6.8 };

  expect(distanceToGraphic(arc, near)).toBeCloseTo(0.02, 1);
  expect(distanceToGraphic({ ...arc, smooth: undefined }, near)).toBeCloseTo(
    2.55,
    2,
  );
});

test('only a polyline or a polygon is smooth, from a file or from a patch', () => {
  const points = [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
    { x: 5, y: 8 },
  ];

  expect(
    parsedAll([
      { type: 'graphic', id: 'd1', kind: 'polygon', points, smooth: true },
      {
        type: 'graphic',
        id: 'd2',
        kind: 'line',
        points: points.slice(0, 2),
        smooth: true,
      },
      { type: 'graphic', id: 'd3', kind: 'polyline', points, smooth: 'yes' },
    ]),
  ).toStrictEqual([
    { type: 'graphic', id: 'd1', kind: 'polygon', points, smooth: true },
    { type: 'graphic', id: 'd2', kind: 'line', points: points.slice(0, 2) },
    { type: 'graphic', id: 'd3', kind: 'polyline', points },
  ]);

  const curve = patchedGraphic(TRIANGLE, { smooth: true });

  expect(curve).toStrictEqual({ ...TRIANGLE, smooth: true });
  expect(patchedGraphic(curve, { smooth: undefined })).toStrictEqual(TRIANGLE);
  expect(patchedGraphic(BOX, { smooth: true })).toStrictEqual(BOX);
});

test('the control points set by hand go where the curve goes, and are kept only on a curve', () => {
  const plain: DrawGraphic = {
    type: 'graphic',
    id: 'd1',
    kind: 'polyline',
    points: [
      { x: 0, y: 0 },
      { x: 10, y: -10 },
      { x: 20, y: 0 },
    ],
    smooth: true,
  };
  const curve: DrawGraphic = {
    ...plain,
    controls: [
      null,
      { before: { x: 6, y: -10 }, after: { x: 14, y: -10 } },
      null,
    ],
  };

  expect(shiftGraphic(curve, { x: 1, y: 2 })).toMatchObject({
    controls: [
      null,
      { before: { x: 7, y: -8 }, after: { x: 15, y: -8 } },
      null,
    ],
  });
  expect(scaleGraphic(curve, { x: 0, y: 0 }, 2)).toMatchObject({
    controls: [
      null,
      { before: { x: 12, y: -20 }, after: { x: 28, y: -20 } },
      null,
    ],
  });

  const turned = transformGraphic(curve, {
    pivot: { x: 0, y: 0 },
    scale: 1,
    rotation: 90,
  });

  expect(turned).toMatchObject({
    points: [
      { x: 0, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 20 },
    ],
    controls: [
      null,
      { before: { x: 10, y: 6 }, after: { x: 10, y: 14 } },
      null,
    ],
  });
  // A polyline that is no longer smooth has no tangent left to set.
  expect(patchedGraphic(curve, { smooth: undefined })).toStrictEqual({
    type: 'graphic',
    id: 'd1',
    kind: 'polyline',
    points: curve.points,
  });

  expect(
    parsedAll([
      curve,
      { ...curve, id: 'd2', controls: [null, null] },
      { ...curve, id: 'd3', controls: [null, { before: { x: 1 } }, null] },
      { ...curve, id: 'd4', smooth: false },
    ]),
  ).toStrictEqual([
    curve,
    { ...plain, id: 'd2' },
    { ...plain, id: 'd3' },
    { type: 'graphic', id: 'd4', kind: 'polyline', points: curve.points },
  ]);
});
