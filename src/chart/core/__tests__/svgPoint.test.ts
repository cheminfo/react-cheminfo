import { expect, test } from 'vitest';

import type { ScreenMatrix } from '../svgPoint.ts';
import { svgPointAt } from '../svgPoint.ts';

/** A chart drawn at twice its user units, ten pixels in from the page corner. */
const doubled = surface(matrix(2, 0, 0, 2, 10, 20));

test('a pointer is placed in user units rather than in screen pixels', () => {
  expect(svgPointAt(doubled, 110, 220)).toStrictEqual({ x: 50, y: 100 });
});

test('the origin of the chart is where the matrix says it is', () => {
  expect(svgPointAt(doubled, 10, 20)).toStrictEqual({ x: 0, y: 0 });
});

test('a chart drawn at its natural size still answers', () => {
  const plain = surface(matrix(1, 0, 0, 1, 0, 0));

  expect(svgPointAt(plain, 366, 140)).toStrictEqual({ x: 366, y: 140 });
});

test('a rotated chart is undone as well as a scaled one', () => {
  const quarterTurn = surface(matrix(0, 1, -1, 0, 0, 0));

  expect(svgPointAt(quarterTurn, 0, 30)).toStrictEqual({ x: 30, y: 0 });
});

test('a surface that is not on screen has no position to give', () => {
  expect(svgPointAt(null, 110, 220)).toBeNull();
  expect(svgPointAt({ getScreenCTM: () => null }, 110, 220)).toBeNull();
});

test('a collapsed chart is refused rather than answered with an infinity', () => {
  const collapsed = surface(matrix(0, 0, 0, 0, 0, 0));

  expect(svgPointAt(collapsed, 110, 220)).toBeNull();
});

/**
 * An SVG that lies over the screen the way a matrix says.
 * @param screen - How its user units are laid over the screen.
 * @returns The little of an element a pointer position is asked of.
 */
function surface(screen: ScreenMatrix) {
  return { getScreenCTM: () => screen };
}

/**
 * A matrix that knows how to undo itself, as `getScreenCTM` hands one over.
 * @param a - Horizontal scaling.
 * @param b - Vertical shear.
 * @param c - Horizontal shear.
 * @param d - Vertical scaling.
 * @param e - Horizontal translation.
 * @param f - Vertical translation.
 * @returns The matrix.
 */
function matrix(
  a: number,
  b: number,
  c: number,
  d: number,
  e: number,
  f: number,
): ScreenMatrix {
  return {
    a,
    b,
    c,
    d,
    e,
    f,
    inverse: () => {
      const determinant = a * d - b * c;
      return matrix(
        d / determinant,
        -b / determinant,
        -c / determinant,
        a / determinant,
        (c * f - d * e) / determinant,
        (b * e - a * f) / determinant,
      );
    },
  };
}
