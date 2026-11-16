import { expect, test } from 'vitest';

import { patchedGraphic, transformGraphic } from '../graphicEdits.ts';
import {
  gradientAngle,
  gradientCentre,
  parseGradient,
} from '../graphicGradients.ts';
import type { DrawGraphic } from '../graphics.ts';
import { parseGraphic } from '../parseGraphic.ts';

const BOX: DrawGraphic = {
  type: 'graphic',
  id: 'd1',
  kind: 'rectangle',
  x: 0,
  y: 0,
  width: 20,
  height: 10,
  fill: '#f4f4f4',
  gradient: { kind: 'reflected', color: '#8c8c8c', angle: 90 },
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
  fill: '#e69f00',
  gradient: { kind: 'linear', color: '#ffffff' },
};

const LIT: DrawGraphic = {
  type: 'graphic',
  id: 'd1',
  kind: 'rectangle',
  x: 0,
  y: 0,
  width: 20,
  height: 10,
  fill: '#ffffff',
  gradient: { kind: 'radial', color: '#000000', centre: { x: -1, y: -1 } },
};

test('a direction is kept from 0 up to 360 degrees, to a hundredth', () => {
  expect(gradientAngle(370)).toBe(10);
  expect(gradientAngle(-90)).toBe(270);
  expect(gradientAngle(359.999)).toBe(0);
  expect(gradientAngle(12.346)).toBe(12.35);
});

test('a gradient read from a file is kept only on a filled shape, and only when it fits', () => {
  expect(parseGraphic(BOX)).toStrictEqual(BOX);
  expect(
    parseGraphic({ ...BOX, gradient: { kind: 'linear', color: '#000' } }),
  ).not.toHaveProperty('gradient');
  expect(
    parseGraphic({ ...BOX, gradient: { kind: 'conic', color: '#000000' } }),
  ).not.toHaveProperty('gradient');
  expect(
    parseGraphic({
      ...BOX,
      gradient: { kind: 'linear', color: '#000000', angle: 370 },
    }),
  ).toStrictEqual({
    ...BOX,
    gradient: { kind: 'linear', color: '#000000', angle: 10 },
  });
  expect(
    parseGraphic({
      ...BOX,
      gradient: { kind: 'radial', color: '#000000', angle: 45 },
    }),
  ).toStrictEqual({ ...BOX, gradient: { kind: 'radial', color: '#000000' } });

  const { fill: _fill, ...unfilled } = BOX;

  expect(parseGraphic(unfilled)).not.toHaveProperty('gradient');
  expect(parseGraphic({ ...TRIANGLE, kind: 'polyline' })).not.toHaveProperty(
    'gradient',
  );
  expect(parseGradient('linear')).toBeUndefined();
});

test('a centre is kept inside the shape, and only on a radial gradient', () => {
  expect(gradientCentre({ x: 2, y: -0.333 })).toStrictEqual({
    x: 1,
    y: -0.33,
  });
  expect(gradientCentre({ x: 0, y: -0 })).toBeUndefined();
  expect(parseGraphic(LIT)).toStrictEqual(LIT);
  expect(
    parseGraphic({
      ...LIT,
      gradient: { kind: 'linear', color: '#000000', centre: { x: 1, y: 1 } },
    }),
  ).toStrictEqual({ ...LIT, gradient: { kind: 'linear', color: '#000000' } });
  expect(
    parseGraphic({
      ...LIT,
      gradient: { kind: 'radial', color: '#000000', centre: { x: 'left' } },
    }),
  ).toStrictEqual({ ...LIT, gradient: { kind: 'radial', color: '#000000' } });
});

test('a shape that loses its fill loses its gradient', () => {
  const plain = patchedGraphic(BOX, { fill: undefined });

  expect(plain).not.toHaveProperty('gradient');
  expect(plain).not.toHaveProperty('fill');
});

test('a gradient turns with its shape', () => {
  const quarter = { pivot: { x: 0, y: 0 }, scale: 1, rotation: 90 };

  expect(transformGraphic(BOX, quarter)).toMatchObject({
    rotation: 90,
    gradient: BOX.gradient,
  });

  const triangle = transformGraphic(TRIANGLE, quarter);

  expect(triangle).toMatchObject({
    gradient: { kind: 'linear', color: '#ffffff', angle: 90 },
  });

  const back = transformGraphic(triangle, { ...quarter, rotation: -90 });

  expect(back.gradient).toStrictEqual(TRIANGLE.gradient);
});

test('the centre of a path turns with the path', () => {
  const triangle: DrawGraphic = {
    type: 'graphic',
    id: 'd2',
    kind: 'polygon',
    points: [
      { x: 0, y: 0 },
      { x: 20, y: 0 },
      { x: 0, y: 10 },
    ],
    fill: '#ffffff',
    gradient: { kind: 'radial', color: '#000000', centre: { x: -1, y: -1 } },
  };
  const turned = transformGraphic(triangle, {
    pivot: { x: 10, y: 5 },
    scale: 1,
    rotation: 180,
  });

  // The right-angled corner, at the top left, is now at the bottom right.
  expect(turned.gradient).toStrictEqual({
    kind: 'radial',
    color: '#000000',
    centre: { x: 1, y: 1 },
  });
});
