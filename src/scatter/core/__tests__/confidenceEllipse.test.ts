import { expect, test } from 'vitest';

import type { EllipsePoint } from '../confidenceEllipse.ts';
import { confidenceEllipse, ellipseAxes } from '../confidenceEllipse.ts';

const TRIANGLE = pointsAt(0, 0, 1, 2, 2, 1);

test('a group too small to have a shape is not outlined', () => {
  expect(confidenceEllipse([])).toBeNull();
  expect(confidenceEllipse(pointsAt(1, 1))).toBeNull();
  expect(confidenceEllipse(pointsAt(1, 1, 2, 2))).toBeNull();
});

test('two points are outlined once the caller lowers the floor', () => {
  const ellipse = confidenceEllipse(pointsAt(1, 1, 2, 2), {
    minimumPoints: 2,
  });

  expect(ellipse?.count).toBe(2);
  expect(ellipse?.ry).toBe(0);
  expect(ellipse?.angle).toBe(Math.PI / 4);
});

test('a single point is never outlined, whatever floor is asked for', () => {
  expect(confidenceEllipse(pointsAt(1, 1), { minimumPoints: 1 })).toBeNull();
});

test('a group with no spread collapses to a point with no direction', () => {
  const ellipse = confidenceEllipse(pointsAt(5, 5, 5, 5, 5, 5));

  expect(ellipse?.cx).toBe(5);
  expect(ellipse?.cy).toBe(5);
  expect(ellipse?.rx).toBe(0);
  expect(ellipse?.ry).toBe(0);
  expect(ellipse?.angle).toBe(0);
  expect(ellipse?.covariance).toStrictEqual({ xx: 0, xy: 0, yy: 0 });
});

test('a collinear group is a segment, not a hairline ellipse', () => {
  const points: EllipsePoint[] = [];

  for (let index = 0; index < 9; index++) {
    const x = (70 + index) / 10;

    points.push({ x, y: 3 * x - 2 });
  }

  const ellipse = confidenceEllipse(points);

  expect(ellipse?.count).toBe(9);
  expect(ellipse?.cx).toBeCloseTo(7.4, 12);
  expect(ellipse?.cy).toBeCloseTo(20.2, 12);
  expect(ellipse?.rx).toBeCloseTo(2.1198109, 6);
  expect(ellipse?.ry).toBe(0);
  expect(ellipse?.angle).toBeCloseTo(1.2490458, 6);
  expect(ellipse?.angle).toBe(Math.atan(3));
  expect(ellipse?.covariance.xx).toBe(0.075);
});

test('a vertical group points straight up rather than nowhere', () => {
  const ellipse = confidenceEllipse(pointsAt(2, 1, 2, 4, 2, 7));

  expect(ellipse?.angle).toBeCloseTo(Math.PI / 2, 10);
  expect(ellipse?.ry).toBe(0);
  expect(ellipse?.covariance).toStrictEqual({ xx: 0, xy: 0, yy: 9 });
});

test('an axis-aligned group reports no rotation, a backward one turns the other way', () => {
  expect(confidenceEllipse(pointsAt(1, 6, 4, 6, 7, 6))?.angle).toBe(0);
  expect(confidenceEllipse(pointsAt(0, 2, 1, 1, 2, 0))?.angle).toBe(
    -Math.PI / 4,
  );
});

test('points that are not finite are skipped rather than poisoning the average', () => {
  const ellipse = confidenceEllipse([
    { x: 0, y: 0 },
    { x: Number.NaN, y: 5 },
    { x: 1, y: 3 },
    { x: 2, y: 0 },
    { x: 9, y: Number.POSITIVE_INFINITY },
  ]);

  expect(ellipse?.count).toBe(3);
  expect(ellipse?.cx).toBe(1);
  expect(ellipse?.cy).toBe(1);
});

test('coordinates so large that squaring them overflows give no outline', () => {
  expect(
    confidenceEllipse(pointsAt(1e200, 1e200, 2e200, 2e200, 3e200, 1e200)),
  ).toBeNull();
});

test('an outline asked to hold every point cannot be drawn', () => {
  const size = { kind: 'coverage', probability: 1 } as const;

  expect(confidenceEllipse(TRIANGLE, { size })).toBeNull();
});

test('an outline asked to hold nothing has no size', () => {
  const size = { kind: 'coverage', probability: 0 } as const;
  const ellipse = confidenceEllipse(TRIANGLE, { size });

  expect(ellipse?.rx).toBe(0);
  expect(ellipse?.ry).toBe(0);
  expect(ellipse?.count).toBe(3);
});

test('the two ways of asking for a size agree where they meet', () => {
  const byShare = confidenceEllipse(TRIANGLE, {
    size: { kind: 'coverage', probability: 0.8646647167633873 },
  });
  const bySpread = confidenceEllipse(TRIANGLE, {
    size: { kind: 'standardDeviations', standardDeviations: 2 },
  });

  expect(byShare?.rx).toBeCloseTo(bySpread?.rx ?? 0, 12);
  expect(byShare?.ry).toBeCloseTo(bySpread?.ry ?? 0, 12);
});

test('a negative number of standard deviations is read as none', () => {
  const size = { kind: 'standardDeviations', standardDeviations: -2 } as const;

  expect(confidenceEllipse(TRIANGLE, { size })?.rx).toBe(0);
});

test('a covariance is turned into semi-axes and a rotation on its own', () => {
  const flat = { rx: 4, ry: 2, angle: 0 };

  expect(ellipseAxes({ xx: 4, xy: 0, yy: 1 }, 2)).toStrictEqual(flat);
  expect(ellipseAxes({ xx: 0, xy: 0, yy: 0 })).toStrictEqual({
    rx: 0,
    ry: 0,
    angle: 0,
  });
  expect(ellipseAxes({ xx: 1, xy: -1, yy: 1 })).toStrictEqual({
    rx: Math.SQRT2,
    ry: 0,
    angle: -Math.PI / 4,
  });
});

test('a normal cloud fills its outline to the share that was asked for', () => {
  const cloud = gaussianCloud(20000, 20260907);

  expect(cloud).toHaveLength(20000);

  for (const probability of [0.5, 0.9, 0.95, 0.99]) {
    const size = { kind: 'coverage', probability } as const;

    expect(shareInside(cloud, confidenceEllipse(cloud, { size }))).toBeCloseTo(
      probability,
      2,
    );
  }
});

test('a normal cloud fills a standard-deviation outline to 39, 86 and 99 percent', () => {
  const cloud = gaussianCloud(20000, 20260907);

  for (const standardDeviations of [1, 2, 3]) {
    const size = { kind: 'standardDeviations', standardDeviations } as const;

    expect(shareInside(cloud, confidenceEllipse(cloud, { size }))).toBeCloseTo(
      1 - Math.exp(-(standardDeviations * standardDeviations) / 2),
      2,
    );
  }
});

/**
 * Points written as a flat run of coordinates, which keeps a fixture on one
 * line where an array of objects would be spread over three.
 * @param coordinates - The points, as `x`, `y`, `x`, `y` and so on.
 * @returns The points they describe.
 */
function pointsAt(...coordinates: number[]): EllipsePoint[] {
  const points: EllipsePoint[] = [];

  for (let index = 0; index + 1 < coordinates.length; index += 2) {
    points.push({ x: coordinates[index] ?? 0, y: coordinates[index + 1] ?? 0 });
  }

  return points;
}

/**
 * A correlated normal cloud, from a generator that repeats run to run.
 * @param count - How many points to draw.
 * @param seed - What to start the generator from.
 * @returns The cloud, spread 3 across and 1.5 up with a correlation of 0.7.
 */
function gaussianCloud(count: number, seed: number): EllipsePoint[] {
  let state = seed >>> 0;
  const points: EllipsePoint[] = [];
  const across = Math.sqrt(2.25 - 1.05 * 1.05);

  while (points.length < count) {
    state = (state * 1664525 + 1013904223) % 4294967296;
    const first = 1 - state / 4294967296;

    state = (state * 1664525 + 1013904223) % 4294967296;
    const radius = Math.sqrt(-2 * Math.log(first));
    const turn = (2 * Math.PI * state) / 4294967296;
    const one = radius * Math.cos(turn);
    const two = radius * Math.sin(turn);

    points.push({ x: 12 + 3 * one, y: -4 + 1.05 * one + across * two });
    if (points.length < count) {
      points.push({ x: 12 + 3 * two, y: -4 + 1.05 * two + across * one });
    }
  }

  return points;
}

/**
 * What share of a cloud falls inside an outline.
 * @param points - The cloud.
 * @param ellipse - The outline, or `null` when there is none.
 * @returns The share, from 0 to 1, or `NaN` when there is no outline.
 */
function shareInside(
  points: readonly EllipsePoint[],
  ellipse: ReturnType<typeof confidenceEllipse>,
): number {
  if (ellipse === null) return Number.NaN;
  const cosine = Math.cos(ellipse.angle);
  const sine = Math.sin(ellipse.angle);
  let hits = 0;

  for (const point of points) {
    const dx = point.x - ellipse.cx;
    const dy = point.y - ellipse.cy;
    const along = (dx * cosine + dy * sine) / ellipse.rx;
    const across = (dy * cosine - dx * sine) / ellipse.ry;

    if (along * along + across * across <= 1) hits++;
  }

  return hits / points.length;
}
