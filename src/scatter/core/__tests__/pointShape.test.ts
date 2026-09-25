import { expect, test } from 'vitest';

import type { OverlaySampleShape } from '../../../overlay/core/overlayMarks.ts';
import { pointShapePath } from '../pointShape.ts';

function corners(path: string | null): Array<[number, number]> {
  const found: Array<[number, number]> = [];
  for (const match of (path ?? '').matchAll(
    /[ML](?<x>[\d.-]+) (?<y>[\d.-]+)/g,
  )) {
    found.push([Number(match.groups?.x), Number(match.groups?.y)]);
  }
  return found;
}

function area(points: ReadonlyArray<[number, number]>): number {
  let twice = 0;
  for (let index = 0; index < points.length; index++) {
    const [x1, y1] = points[index] ?? [0, 0];
    const [x2, y2] = points[(index + 1) % points.length] ?? [0, 0];
    twice += x1 * y2 - x2 * y1;
  }
  return Math.abs(twice) / 2;
}

test('a disc is left to a circle', () => {
  expect(pointShapePath('dot', 50, 50, 10)).toBeNull();
});

test('a square is written corner by corner, rounded for the markup', () => {
  expect(pointShapePath('square', 50, 50, 10)).toBe(
    'M41.14 41.14L58.86 41.14L58.86 58.86L41.14 58.86Z',
  );
});

test('every shape covers the area of the disc it stands in for', () => {
  const shapes: OverlaySampleShape[] = [
    'square',
    'triangle',
    'diamond',
    'triangle-down',
  ];
  for (const shape of shapes) {
    expect(area(corners(pointShapePath(shape, 50, 50, 10)))).toBeCloseTo(
      Math.PI * 100,
      0,
    );
  }
});

test('a triangle is balanced on its sample, and the two point opposite ways', () => {
  const up = corners(pointShapePath('triangle', 50, 50, 10));
  const down = corners(pointShapePath('triangle-down', 50, 50, 10));

  for (const triangle of [up, down]) {
    const centreX =
      (triangle[0]?.[0] ?? 0) / 3 +
      (triangle[1]?.[0] ?? 0) / 3 +
      (triangle[2]?.[0] ?? 0) / 3;
    const centreY =
      (triangle[0]?.[1] ?? 0) / 3 +
      (triangle[1]?.[1] ?? 0) / 3 +
      (triangle[2]?.[1] ?? 0) / 3;

    expect(centreX).toBeCloseTo(50, 1);
    expect(centreY).toBeCloseTo(50, 1);
  }

  expect(up[0]).toStrictEqual([50, 34.45]);
  expect(down[0]).toStrictEqual([50, 65.55]);
});
