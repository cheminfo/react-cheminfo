import { expect, test } from 'vitest';

import type { CubicPiece } from '../curves.ts';
import { curveOutline, curvePieces } from '../curves.ts';
import type { Point } from '../types.ts';

const ARC: Point[] = [
  { x: 0, y: 0 },
  { x: 10, y: -10 },
  { x: 20, y: 0 },
];
const SQUARE: Point[] = [
  { x: 0, y: 0 },
  { x: 10, y: 0 },
  { x: 10, y: 10 },
  { x: 0, y: 10 },
];

function round(point: Point): Point {
  return {
    x: Math.round(point.x * 1000) / 1000 || 0,
    y: Math.round(point.y * 1000) / 1000 || 0,
  };
}

function rounded(pieces: CubicPiece[]): CubicPiece[] {
  return pieces.map((piece) => ({
    from: round(piece.from),
    control1: round(piece.control1),
    control2: round(piece.control2),
    to: round(piece.to),
  }));
}

test('three points make a symmetric arc, leaving and reaching its ends square to the chord', () => {
  expect(rounded(curvePieces(ARC, false))).toStrictEqual([
    {
      from: { x: 0, y: 0 },
      control1: { x: 0, y: -4.714 },
      control2: { x: 5.286, y: -10 },
      to: { x: 10, y: -10 },
    },
    {
      from: { x: 10, y: -10 },
      control1: { x: 14.714, y: -10 },
      control2: { x: 20, y: -4.714 },
      to: { x: 20, y: 0 },
    },
  ]);
});

test('a closed curve has a piece per side, the last one back to the first point', () => {
  const pieces = rounded(curvePieces(SQUARE, true));

  expect(pieces).toHaveLength(4);
  // Through the corners of a square, the sides bulge outwards.
  expect(pieces[0]).toStrictEqual({
    from: { x: 0, y: 0 },
    control1: { x: 2.357, y: -2.357 },
    control2: { x: 7.643, y: -2.357 },
    to: { x: 10, y: 0 },
  });
  expect(pieces[3]?.to).toStrictEqual({ x: 0, y: 0 });
});

test('a short side keeps its control arms to a third of itself beside a long one', () => {
  const [short] = curvePieces(
    [
      { x: 0, y: 0 },
      { x: 3, y: 0 },
      { x: 40, y: 30 },
    ],
    false,
  );
  const arm = (a: Point, b: Point) => Math.hypot(b.x - a.x, b.y - a.y);

  expect(arm(short?.from as Point, short?.control1 as Point)).toBeCloseTo(
    1,
    10,
  );
  expect(arm(short?.to as Point, short?.control2 as Point)).toBeCloseTo(1, 10);
});

test('the outline follows every piece through each point, and a closed one ends where it starts', () => {
  const open = curveOutline(ARC, false);

  expect(open).toHaveLength(33);
  expect(open[0]).toStrictEqual({ x: 0, y: 0 });
  expect(open[16]).toStrictEqual({ x: 10, y: -10 });
  expect(open[32]).toStrictEqual({ x: 20, y: 0 });
  // The middle of the first piece bows out past the straight side.
  expect(open[8]?.x).toBeCloseTo(3.232, 3);
  expect(open[8]?.y).toBeCloseTo(-6.768, 3);

  const closed = curveOutline(SQUARE, true);

  expect(closed).toHaveLength(65);
  expect(closed.at(-1)).toStrictEqual({ x: 0, y: 0 });
  expect(curveOutline([{ x: 4, y: 5 }], false)).toStrictEqual([{ x: 4, y: 5 }]);
});
