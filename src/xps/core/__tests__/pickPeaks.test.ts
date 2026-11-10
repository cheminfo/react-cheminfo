import { expect, test } from 'vitest';

import { MINIMUM_PICKING_POINTS, pickPeaks } from '../pickPeaks.ts';

import type { SyntheticPeak } from './syntheticSpectrum.ts';
import { syntheticTrace } from './syntheticSpectrum.ts';

/**
 * A narrow scan sampled at 0.02 eV a point, as a real one is.
 * @param peaks - The Gaussians to lay on it.
 * @returns The trace, x ascending in binding energy.
 */
function narrowScan(peaks: readonly SyntheticPeak[]): {
  x: Float64Array;
  y: Float64Array;
} {
  return syntheticTrace(peaks, { from: 280, to: 290, points: 501 });
}

test('a single Gaussian is found once, at its centre and its height', () => {
  const trace = narrowScan([{ center: 284.6, height: 1000, fwhm: 1.2 }]);

  const picked = pickPeaks(trace, { smoothing: false });

  expect(picked).toHaveLength(1);
  expect(picked[0]?.bindingEnergy).toBeCloseTo(284.6, 3);
  expect(picked[0]?.intensity).toBeCloseTo(1000, 3);
  // The reported width is the distance between the inflection points, which for
  // a Gaussian of 1.2 eV at half maximum is a little over one eV.
  expect(picked[0]?.width).toBeCloseTo(1, 0);
});

test('two resolved lines come back in ascending binding energy', () => {
  const trace = narrowScan([
    { center: 282, height: 1000, fwhm: 1 },
    { center: 288, height: 400, fwhm: 1 },
  ]);

  const picked = pickPeaks(trace, { smoothing: false });

  expect(picked).toHaveLength(2);
  expect(picked[0]?.bindingEnergy).toBeCloseTo(282, 3);
  expect(picked[1]?.bindingEnergy).toBeCloseTo(288, 3);
  expect(picked[0]?.intensity).toBeCloseTo(1000, 3);
  expect(picked[1]?.intensity).toBeCloseTo(400, 3);
});

test('every peak carries its own identity', () => {
  const trace = narrowScan([
    { center: 282, height: 1000, fwhm: 1 },
    { center: 288, height: 400, fwhm: 1 },
  ]);

  const picked = pickPeaks(trace);
  const identities = new Set<string>();
  for (const peak of picked) identities.add(peak.id);

  expect(identities.size).toBe(2);
});

test('smoothing leaves a well-sampled line where it was', () => {
  const trace = narrowScan([{ center: 284.6, height: 1000, fwhm: 1.2 }]);

  const smoothed = pickPeaks(trace);

  expect(smoothed).toHaveLength(1);
  expect(smoothed[0]?.bindingEnergy).toBeCloseTo(284.6, 2);
  expect(smoothed[0]?.intensity).toBeCloseTo(1000, 0);
});

test('a line that barely rises above its surroundings is not a peak', () => {
  const trace = narrowScan([
    { center: 282, height: 1000, fwhm: 1 },
    { center: 288, height: 10, fwhm: 1 },
  ]);

  // One per cent of the full height, against a two per cent floor.
  expect(pickPeaks(trace, { smoothing: false })).toHaveLength(1);
  expect(
    pickPeaks(trace, { smoothing: false, minProminenceRatio: 0.005 }),
  ).toHaveLength(2);
});

test('a noise level given by hand buries what falls under it', () => {
  const trace = narrowScan([
    { center: 282, height: 1000, fwhm: 1 },
    { center: 288, height: 200, fwhm: 1 },
  ]);

  expect(pickPeaks(trace, { smoothing: false })).toHaveLength(2);

  const picked = pickPeaks(trace, { smoothing: false, noiseLevel: 300 });

  expect(picked).toHaveLength(1);
  expect(picked[0]?.bindingEnergy).toBeCloseTo(282, 3);
});

test('the limit keeps the most intense lines, still in energy order', () => {
  const trace = syntheticTrace(
    [
      { center: 281, height: 100, fwhm: 1 },
      { center: 283, height: 500, fwhm: 1 },
      { center: 285, height: 200, fwhm: 1 },
      { center: 287, height: 1000, fwhm: 1 },
      { center: 289, height: 300, fwhm: 1 },
    ],
    { from: 278, to: 292, points: 701 },
  );

  expect(pickPeaks(trace, { smoothing: false })).toHaveLength(5);

  const picked = pickPeaks(trace, { smoothing: false, maxPeaks: 2 });

  expect(picked).toHaveLength(2);
  expect(picked[0]?.bindingEnergy).toBeCloseTo(283, 3);
  expect(picked[1]?.bindingEnergy).toBeCloseTo(287, 3);
});

test('a trace too short for the detection window answers nothing', () => {
  const trace = syntheticTrace([{ center: 284, height: 1000, fwhm: 1 }], {
    from: 280,
    to: 290,
    points: MINIMUM_PICKING_POINTS - 1,
  });

  expect(pickPeaks(trace)).toStrictEqual([]);
});

test('a limit of no peaks at all answers nothing', () => {
  const trace = narrowScan([{ center: 284.6, height: 1000, fwhm: 1.2 }]);

  expect(pickPeaks(trace, { maxPeaks: 0 })).toStrictEqual([]);
});
