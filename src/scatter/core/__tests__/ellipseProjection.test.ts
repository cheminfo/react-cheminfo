import { expect, test } from 'vitest';

import type { ChartScale } from '../../../chart/core/chartScale.ts';
import type { ConfidenceEllipse, EllipsePoint } from '../confidenceEllipse.ts';
import { confidenceEllipse } from '../confidenceEllipse.ts';
import type { PixelEllipse } from '../ellipseProjection.ts';
import { ellipsePolygon, projectEllipse } from '../ellipseProjection.ts';

/** A rotated cloud, so that an anisotropic map has something to get wrong. */
const CLOUD: ConfidenceEllipse = {
  cx: 10,
  cy: 5,
  rx: 4,
  ry: 1.5,
  angle: 0.6,
  count: 40,
  covariance: { xx: 0, xy: 0, yy: 0 },
};

// Three pixels across for one unit, forty up for one unit.
const WIDE_X: ChartScale = { offset: 25, factor: 3 };
const TALL_Y: ChartScale = { offset: 400, factor: -40 };

test('an anisotropic map moves the centre by the plain multiply-add', () => {
  const pixels = projectEllipse(CLOUD, WIDE_X, TALL_Y);

  expect(pixels?.cx).toBe(55);
  expect(pixels?.cy).toBe(200);
});

test('an anisotropic map turns the outline and rewrites both its radii', () => {
  const pixels = projectEllipse(CLOUD, WIDE_X, TALL_Y);

  expect(pixels?.rx).toBeCloseTo(103.29581737633876, 9);
  expect(pixels?.ry).toBeCloseTo(6.970272546242765, 9);
  expect(pixels?.angleDegrees).toBeCloseTo(-85.83747872877021, 9);
});

test('scaling the radii and keeping the data angle would be tens of pixels out', () => {
  const pixels = projectEllipse(CLOUD, WIDE_X, TALL_Y);
  const naiveRx = CLOUD.rx * Math.abs(WIDE_X.factor);
  const naiveRy = CLOUD.ry * Math.abs(TALL_Y.factor);
  const naiveDegrees = (-CLOUD.angle * 180) / Math.PI;

  expect(naiveRx).toBe(12);
  expect(naiveRy).toBe(60);
  expect((pixels?.rx ?? 0) - naiveRx).toBeCloseTo(91.29581737633876, 9);
  expect((pixels?.angleDegrees ?? 0) - naiveDegrees).toBeCloseTo(
    -51.46001102092083,
    9,
  );
});

test('every point of the data outline lands on the projected ellipse', () => {
  const outline = ellipsePolygon(CLOUD);
  const pixels = projectEllipse(CLOUD, WIDE_X, TALL_Y);

  expect(outline).toHaveLength(64);

  for (const point of outline) {
    expect(radiusOf(pixels, point, WIDE_X, TALL_Y)).toBeCloseTo(1, 12);
  }
});

test('a reversed horizontal axis mirrors the outline and still holds it', () => {
  const reversed: ChartScale = { offset: 640, factor: -3 };
  const pixels = projectEllipse(CLOUD, reversed, TALL_Y);

  expect(pixels?.cx).toBe(610);
  expect(pixels?.rx).toBeCloseTo(103.29581737633876, 9);
  expect(pixels?.angleDegrees).toBeCloseTo(85.83747872877021, 9);

  const outline = ellipsePolygon(CLOUD);

  for (const point of outline) {
    expect(radiusOf(pixels, point, reversed, TALL_Y)).toBeCloseTo(1, 12);
  }
});

test('an isotropic map keeps the shape and only turns the angle around', () => {
  const pixels = projectEllipse(
    CLOUD,
    { offset: 0, factor: 30 },
    { offset: 0, factor: -30 },
  );

  expect(pixels?.rx).toBeCloseTo(120, 12);
  expect(pixels?.ry).toBeCloseTo(45, 12);
  expect(pixels?.angleDegrees).toBeCloseTo((-CLOUD.angle * 180) / Math.PI, 12);
});

test('a collinear group stays a segment once it reaches the screen', () => {
  const points: EllipsePoint[] = [];
  for (let index = 0; index < 9; index++) {
    const x = (70 + index) / 10;
    points.push({ x, y: 3 * x - 2 });
  }
  const ellipse = confidenceEllipse(points);
  const pixels =
    ellipse === null ? null : projectEllipse(ellipse, WIDE_X, TALL_Y);

  expect(pixels?.ry).toBe(0);
  expect(pixels?.rx).toBeCloseTo(80.4663031923669, 9);
  expect(pixels?.angleDegrees).toBeCloseTo(-88.56790381583535, 9);
});

test('a mapping that overflows gives no ellipse rather than a broken one', () => {
  expect(
    projectEllipse(CLOUD, { offset: 0, factor: 1e300 }, TALL_Y),
  ).toBeNull();
  expect(
    projectEllipse(CLOUD, { offset: Number.NaN, factor: 3 }, TALL_Y),
  ).toBeNull();
});

test('the sampled outline starts on the major axis and never repeats itself', () => {
  const outline = ellipsePolygon(CLOUD, 4);

  expect(outline).toStrictEqual([
    { x: 13.301342459638713, y: 7.258569893580141 },
    { x: 9.153036289907448, y: 6.2380034223645175 },
    { x: 6.698657540361287, y: 2.7414301064198585 },
    { x: 10.846963710092552, y: 3.7619965776354825 },
  ]);
});

test('a sampled outline is given at least three points', () => {
  expect(ellipsePolygon(CLOUD, 1)).toHaveLength(3);
  expect(ellipsePolygon(CLOUD, 0)).toHaveLength(3);
  expect(ellipsePolygon(CLOUD, Number.NaN)).toHaveLength(64);
  expect(ellipsePolygon(CLOUD, 7)).toHaveLength(7);
});

test('a group with no spread samples to its own centre', () => {
  expect(ellipsePolygon({ ...CLOUD, rx: 0, ry: 0 }, 3)).toStrictEqual([
    { x: 10, y: 5 },
    { x: 10, y: 5 },
    { x: 10, y: 5 },
  ]);
});

/**
 * How far a data point sits from the pixel ellipse's centre, in units of its
 * radius in that direction; exactly 1 for a point on the outline.
 * @param pixels - The projected ellipse.
 * @param point - A point of the data-space outline.
 * @param x - The horizontal mapping the ellipse was projected through.
 * @param y - The vertical mapping.
 * @returns The squared normalised radius, or `NaN` when there is no ellipse.
 */
function radiusOf(
  pixels: PixelEllipse | null,
  point: EllipsePoint | undefined,
  x: ChartScale,
  y: ChartScale,
): number {
  if (pixels === null || point === undefined) return Number.NaN;
  const angle = (pixels.angleDegrees * Math.PI) / 180;
  const cosine = Math.cos(angle);
  const sine = Math.sin(angle);
  const dx = x.offset + point.x * x.factor - pixels.cx;
  const dy = y.offset + point.y * y.factor - pixels.cy;
  const along = (dx * cosine + dy * sine) / pixels.rx;
  const across = (dy * cosine - dx * sine) / pixels.ry;
  return along * along + across * across;
}
