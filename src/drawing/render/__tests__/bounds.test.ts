/**
 * The box primitives take up on the page, strokes included, and the box two
 * boxes fit in together.
 */

import { expect, test } from 'vitest';

import { primitivesBounds, unionBox } from '../bounds.ts';
import type { Primitive } from '../primitives.ts';

test('a line reaches half its width past each end', () => {
  expect(
    primitivesBounds([
      { kind: 'line', from: { x: 0, y: 0 }, to: { x: 10, y: 5 }, width: 2 },
    ]),
  ).toStrictEqual({ x: -1, y: -1, width: 12, height: 7 });
});

test('a polygon takes its corners, a path its extent widened by its stroke', () => {
  expect(
    primitivesBounds([
      {
        kind: 'polygon',
        points: [
          { x: 1, y: 2 },
          { x: 5, y: -3 },
          { x: 3, y: 7 },
        ],
      },
    ]),
  ).toStrictEqual({ x: 1, y: -3, width: 4, height: 10 });
  expect(
    primitivesBounds([
      {
        kind: 'path',
        d: 'M0 0L4 4',
        width: 1,
        extent: [
          { x: 0, y: 0 },
          { x: 4, y: 4 },
        ],
      },
    ]),
  ).toStrictEqual({ x: -0.5, y: -0.5, width: 5, height: 5 });
});

test('a dot takes its radius all round', () => {
  expect(primitivesBounds([{ kind: 'dot', x: 3, y: 4, r: 2 }])).toStrictEqual({
    x: 1,
    y: 2,
    width: 4,
    height: 4,
  });
});

test('a text runs from its cap height to its descent, as wide as its glyphs', () => {
  const box = primitivesBounds([
    { kind: 'text', text: 'OH', x: 10, y: 20, size: 10 },
  ]);

  expect(box?.x).toBe(10);
  expect(box?.y).toBeCloseTo(20 - 7.18, 10);
  expect(box?.width).toBeCloseTo(7.78 + 7.22, 10);
  expect(box?.height).toBeCloseTo(7.18 + 2.1, 10);
});

test('an image takes its turned corners', () => {
  const box = primitivesBounds([
    {
      kind: 'image',
      href: 'data:image/png;base64,AAAA',
      x: 10,
      y: 20,
      width: 40,
      height: 20,
      rotation: 90,
    },
  ]);

  expect(box?.x).toBeCloseTo(20, 10);
  expect(box?.y).toBeCloseTo(10, 10);
  expect(box?.width).toBeCloseTo(20, 10);
  expect(box?.height).toBeCloseTo(40, 10);
});

test('primitives together take the box of them all; nothing has no box', () => {
  expect(
    primitivesBounds([
      { kind: 'dot', x: 0, y: 0, r: 1 },
      { kind: 'dot', x: 10, y: -5, r: 1 },
    ]),
  ).toStrictEqual({ x: -1, y: -6, width: 12, height: 7 });
  expect(primitivesBounds([])).toBeUndefined();
  expect(
    primitivesBounds([{ kind: 'unknown' } as unknown as Primitive]),
  ).toBeUndefined();
});

test('two boxes fit in their union, and an absent one adds nothing', () => {
  const a = { x: 0, y: 0, width: 10, height: 5 };
  const b = { x: -2, y: 3, width: 4, height: 8 };

  expect(unionBox(a, b)).toStrictEqual({ x: -2, y: 0, width: 12, height: 11 });
  expect(unionBox(undefined, b)).toBe(b);
  expect(unionBox(a, undefined)).toBe(a);
  expect(unionBox(undefined, undefined)).toBeUndefined();
});
