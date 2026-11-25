import { expect, test } from 'vitest';

import {
  HALO,
  arrayOf,
  boundsOf,
  boxContains,
  boxCorners,
  boxFromCorners,
  clampToBox,
  distanceToSegment,
  haloStrokeWidth,
  isFiniteNumber,
  isRecord,
  pictureCorners,
  polygonContains,
  signedArea,
  textWidth,
  turnAbout,
} from '../../../core.ts';

const SQUARE = [
  { x: 0, y: 0 },
  { x: 1, y: 0 },
  { x: 1, y: 1 },
  { x: 0, y: 1 },
];

test('a worker turns and bounds points through react-cheminfo/core', () => {
  const turned = turnAbout({ x: 0, y: 0 }, 90)({ x: 1, y: 0 });

  expect(turned).toStrictEqual({ x: expect.closeTo(0, 12), y: 1 });
  expect(
    boundsOf(
      [
        { x: 1, y: 2 },
        { x: 4, y: -1 },
      ],
      1,
    ),
  ).toStrictEqual({ x: 0, y: -2, width: 5, height: 5 });
});

test('a worker measures and hits shapes through react-cheminfo/core', () => {
  expect(signedArea(SQUARE)).toBe(1);
  expect(polygonContains(SQUARE, { x: 0.5, y: 0.5 })).toBe(true);
  expect(polygonContains(SQUARE, { x: 1.5, y: 0.5 })).toBe(false);
  expect(
    distanceToSegment({ x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }),
  ).toBe(1);
  expect(textWidth('60000', 11)).toBeCloseTo(30.58, 2);
});

test('a worker reads boxes and pictures through react-cheminfo/core', () => {
  const box = boxFromCorners({ x: 4, y: 6 }, { x: 1, y: 2 });

  expect(box).toStrictEqual({ x: 1, y: 2, width: 3, height: 4 });
  expect(boxCorners(box)).toStrictEqual([
    { x: 1, y: 2 },
    { x: 4, y: 2 },
    { x: 4, y: 6 },
    { x: 1, y: 6 },
  ]);
  expect(boxContains(box, { x: 4, y: 6 })).toBe(true);
  expect(clampToBox(box, { x: 10, y: 0 })).toStrictEqual({ x: 4, y: 2 });
  expect(
    pictureCorners({ x: 0, y: 0, width: 4, height: 2, rotation: 0 }),
  ).toStrictEqual([
    { x: 0, y: 0 },
    { x: 4, y: 0 },
    { x: 4, y: 2 },
    { x: 0, y: 2 },
  ]);
});

test('a worker checks what it read through react-cheminfo/core', () => {
  expect([isRecord({ a: 1 }), isRecord([1]), isRecord(null)]).toStrictEqual([
    true,
    false,
    false,
  ]);
  expect([
    isFiniteNumber(2.5),
    isFiniteNumber(Number.NaN),
    isFiniteNumber('2'),
  ]).toStrictEqual([true, false, false]);
  expect(
    arrayOf([1, 'two', 3], (item) =>
      typeof item === 'number' ? item * 10 : undefined,
    ),
  ).toStrictEqual([10, 30]);
});

test('a picture painted where no SVG is reads the halo through react-cheminfo/core', () => {
  expect([HALO.dark, HALO.opacity, haloStrokeWidth(2)]).toStrictEqual([
    '#000000',
    0.6,
    4,
  ]);
});
