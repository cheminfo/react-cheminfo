import { expect, test } from 'vitest';

import { pathData } from '../markup.ts';
import { mapContour, polygonContour, roundedRect } from '../outlines.ts';

test('a rounded rectangle is written with two decimals at most', () => {
  expect(pathData(roundedRect(0, 0, 10, 4, 1))).toBe(
    'M1 0L9 0C9.55 0 10 0.45 10 1L10 3C10 3.55 9.55 4 9 4L1 4C0.45 4 0 3.55 0 3L0 1C0 0.45 0.45 0 1 0Z',
  );
});

test('a polygon is closed on its first corner, and moved point by point', () => {
  const triangle = polygonContour([
    { x: 0, y: 0 },
    { x: 10, y: 0 },
    { x: 5, y: 8 },
  ]);

  expect(pathData(triangle)).toBe('M0 0L10 0L5 8Z');

  const moved = mapContour(triangle, (point) => ({
    x: point.x + 1,
    y: point.y * 2,
  }));

  expect(pathData(moved)).toBe('M1 0L11 0L6 16Z');
  expect(moved.closed).toBe(true);
});

test('a moved curve takes its control points with it', () => {
  const rounded = mapContour(roundedRect(0, 0, 10, 4, 1), (point) => ({
    x: point.x + 10,
    y: point.y,
  }));

  expect(pathData(rounded)).toBe(
    'M11 0L19 0C19.55 0 20 0.45 20 1L20 3C20 3.55 19.55 4 19 4L11 4C10.45 4 10 3.55 10 3L10 1C10 0.45 10.45 0 11 0Z',
  );
});
