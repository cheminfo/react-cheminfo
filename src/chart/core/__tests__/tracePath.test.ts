import { expect, test } from 'vitest';

import { chartScale } from '../chartScale.ts';
import { areaPath, profilePath, stickPath } from '../tracePath.ts';

const xScale = chartScale(0, 100, 0, 200);
const yScale = chartScale(0, 100, 100, 0);

test('a continuous trace is one path, the L written once', () => {
  const path = profilePath([0, 25, 50], [0, 100, 50], xScale, yScale);

  expect(path).toBe('M0 100L50 0 100 50');
});

test('coordinates are written to a hundredth of a pixel', () => {
  const path = profilePath([1 / 3], [2 / 3], xScale, yScale);

  expect(path).toBe('M0.67 99.33');
});

test('a sample that maps nowhere breaks the line rather than being skipped', () => {
  const path = profilePath(
    [0, 25, 50, 75],
    [10, Number.NaN, 30, 40],
    xScale,
    yScale,
  );

  expect(path).toBe('M0 90M100 70L150 60');
});

test('an empty trace draws nothing and a single sample draws no line', () => {
  expect(profilePath([], [], xScale, yScale)).toBe('');
  expect(profilePath([50], [50], xScale, yScale)).toBe('M100 50');
});

test('a trace whose columns disagree is drawn as far as both go', () => {
  expect(profilePath([0, 25, 50], [10, 20], xScale, yScale)).toBe(
    'M0 90L50 80',
  );
});

test('every stick stands on the intensity axis zero', () => {
  const path = stickPath([10, 20], [100, 25], xScale, yScale);

  expect(path).toBe('M20 100V0M40 100V75');
});

test('a mirrored half hangs its sticks from the rule it is reflected in', () => {
  const mirrored = chartScale(-100, 100, 200, 0);

  expect(stickPath([10, 20], [-100, -25], xScale, mirrored)).toBe(
    'M20 100V200M40 100V125',
  );
});

test('a peak taller than the window keeps its whole stick', () => {
  expect(stickPath([50], [300], xScale, yScale)).toBe('M100 100V-200');
});

test('a peak that maps nowhere is left out, the rest still drawn', () => {
  expect(stickPath([10, 20], [Number.NaN, 25], xScale, yScale)).toBe(
    'M40 100V75',
  );
});

test('nothing is drawn for no peaks, and for an axis that maps nowhere', () => {
  expect(stickPath([], [], xScale, yScale)).toBe('');
  expect(stickPath([10], [50], xScale, chartScale(0, 100, Number.NaN, 0))).toBe(
    '',
  );
});

test('an area is the top edge of the trace, shut back along the baseline', () => {
  const path = areaPath([0, 25, 50], [0, 100, 50], xScale, yScale);

  expect(path).toBe('M0 100L50 0 100 50V100H0Z');
});

test('the closing edge sits at the baseline given, not at zero', () => {
  // A chromatographic baseline is never at zero, and shading down to the axis
  // would shade the column of baseline under the peak as part of the peak.
  const path = areaPath([0, 25, 50], [40, 100, 60], xScale, yScale, {
    baseline: 20,
  });

  expect(path).toBe('M0 60L50 0 100 40V80H0Z');
});

test('a break in the trace closes one shape and opens another', () => {
  const path = areaPath(
    [0, 25, 50, 75],
    [10, Number.NaN, 30, 40],
    xScale,
    yScale,
  );

  // The lone sample before the break has no width and encloses nothing.
  expect(path).toBe('M100 70L150 60V100H100Z');
});

test('nothing wide enough to enclose an area draws no path at all', () => {
  expect(areaPath([], [], xScale, yScale)).toBe('');
  expect(areaPath([50], [50], xScale, yScale)).toBe('');
});

test('an area whose baseline maps nowhere is not drawn', () => {
  expect(
    areaPath([10, 20], [50, 60], xScale, chartScale(0, 100, Number.NaN, 0)),
  ).toBe('');
});
