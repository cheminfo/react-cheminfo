import { xMaxValue } from 'ml-spectra-processing';
import { expect, test } from 'vitest';

import { analyseSpectrum } from '../analyseSpectrum.ts';
import { centroidPeakObjects, selectCentroidPeaks } from '../centroidPeaks.ts';
import type { MassTrace } from '../massSpectrum.ts';

test('a three-peak centroid keeps its three peaks, normalised to 100', () => {
  const { profile, centroid } = analyseSpectrum({
    x: new Float64Array([100.1, 200.2, 300.3]),
    y: new Float64Array([10, 40, 20]),
  });

  expect(profile).toBeNull();
  expect(centroid.x).toStrictEqual(new Float64Array([100.1, 200.2, 300.3]));
  expect(centroid.y).toStrictEqual(new Float64Array([25, 100, 50]));
  expect(centroid.charge).toStrictEqual(new Int16Array([0, 0, 0]));
});

test('a trace with more masses than intensities is refused by name', () => {
  expect(() =>
    analyseSpectrum({
      x: new Float64Array([100, 200, 300]),
      y: new Float64Array([10, 40]),
    }),
  ).toThrow(
    'The trace carries 3 masses but 2 intensities; every mass needs its own intensity',
  );
  expect(() =>
    analyseSpectrum({
      x: new Float64Array([100, 200]),
      y: new Float64Array([10, 40, 20]),
    }),
  ).toThrow(
    'The trace carries 2 masses but 3 intensities; every mass needs its own intensity',
  );
});

test('an isotopologue cluster half a dalton apart is doubly charged', () => {
  const { centroid } = analyseSpectrum({
    x: new Float64Array([1000, 1000.5, 1001, 1001.5]),
    y: new Float64Array([100, 60, 25, 8]),
  });

  expect(centroid.charge).toStrictEqual(new Int16Array([2, 2, 2, 2]));
});

test('a cluster a third of a dalton apart is triply charged', () => {
  const { centroid } = analyseSpectrum({
    x: new Float64Array([600, 600 + 1 / 3, 600 + 2 / 3, 601]),
    y: new Float64Array([100, 60, 25, 8]),
  });

  expect(centroid.charge).toStrictEqual(new Int16Array([3, 3, 3, 3]));
});

test('a charge above maxCharge is left unclaimed rather than guessed at', () => {
  const { centroid } = analyseSpectrum(
    {
      x: new Float64Array([1000, 1000.5, 1001, 1001.5]),
      y: new Float64Array([100, 60, 25, 8]),
    },
    { maxCharge: 1 },
  );

  expect(centroid.charge).toStrictEqual(new Int16Array([0, 0, 0, 0]));
});

test('a sampled profile stays a profile and is reduced to its apex', () => {
  const trace = gaussianTrace(500, 990, 0.04, 1000, 0.05);
  const { profile, centroid } = analyseSpectrum(trace);

  expect(profile).not.toBeNull();
  expect(profile?.y).toHaveLength(500);
  expect(xMaxValue(profile?.y as Float64Array)).toBeCloseTo(100, 10);
  expect(centroid.x).toHaveLength(1);
  expect(centroid.x[0]).toBeCloseTo(1000, 6);
  expect(centroid.y[0]).toBeCloseTo(100, 6);
  expect(centroid.charge[0]).toBe(0);
});

test('the profile shares the x it was handed rather than copying it', () => {
  const trace = gaussianTrace(500, 990, 0.04, 1000, 0.05);
  const before = trace.x.slice();
  const { profile } = analyseSpectrum(trace);

  expect(profile?.x).toBe(trace.x);
  expect(trace.x).toStrictEqual(before);
});

test('the analysis leaves the intensities it was handed untouched', () => {
  const trace = gaussianTrace(500, 990, 0.04, 1000, 0.05);
  const before = trace.y.slice();

  analyseSpectrum(trace);

  expect(trace.y).toStrictEqual(before);
  expect(Object.getOwnPropertyNames(trace)).toStrictEqual(['x', 'y']);
});

test('a flat profile is still a profile, and carries no peak', () => {
  const x = new Float64Array(300);
  const y = new Float64Array(300);
  for (let index = 0; index < 300; index++) {
    x[index] = 500 + index * 0.05;
    y[index] = 10;
  }
  const { profile, centroid } = analyseSpectrum({ x, y });

  expect(profile).not.toBeNull();
  expect(profile?.x).toHaveLength(300);
  expect(profile?.y[0]).toBe(100);
  expect(centroid.x).toHaveLength(0);
});

test('a long profile carrying no signal at all normalises to zeros', () => {
  const x = new Float64Array(300);
  const y = new Float64Array(300);
  for (let index = 0; index < 300; index++) x[index] = 500 + index * 0.05;
  const { profile, centroid } = analyseSpectrum({ x, y });

  expect(profile?.y).toStrictEqual(new Float64Array(300));
  expect(centroid.x).toHaveLength(0);
  expect(centroid.y).toHaveLength(0);
});

test('a short profile is read as a centroid unless the file said otherwise', () => {
  const trace = gaussianTrace(60, 999.4, 0.02, 1000, 0.05);

  const guessed = analyseSpectrum(trace);

  expect(guessed.profile).toBeNull();
  expect(guessed.centroid.x).toHaveLength(60);

  const declared = analyseSpectrum(trace, { continuous: true });

  expect(declared.profile).not.toBeNull();
  expect(declared.centroid.x).toHaveLength(1);
  expect(declared.centroid.x[0]).toBeCloseTo(1000, 6);
});

test('a profile declared centroided keeps every point as a peak', () => {
  const trace = gaussianTrace(500, 990, 0.04, 1000, 0.05);
  const { profile, centroid } = analyseSpectrum(trace, { continuous: false });

  expect(profile).toBeNull();
  expect(centroid.x).toHaveLength(500);
});

test('an empty trace analyses to nothing at all', () => {
  const { profile, centroid } = analyseSpectrum({
    x: new Float64Array(0),
    y: new Float64Array(0),
  });

  expect(profile).toBeNull();
  expect(centroid.x).toStrictEqual(new Float64Array(0));
  expect(centroid.charge).toStrictEqual(new Int16Array(0));
  expect(selectCentroidPeaks(centroid)).toStrictEqual([]);
});

test('a trace carrying no signal normalises to zeros, never to NaN', () => {
  const { profile, centroid } = analyseSpectrum({
    x: new Float64Array([10, 20, 30]),
    y: new Float64Array([0, 0, 0]),
  });

  expect(profile).toBeNull();
  expect(centroid.y).toStrictEqual(new Float64Array([0, 0, 0]));
});

test('the peak-object view reaches every caller through this module too', () => {
  const { centroid } = analyseSpectrum({
    x: new Float64Array([100.1, 200.2, 300.3]),
    y: new Float64Array([10, 40, 20]),
  });

  expect(selectCentroidPeaks(centroid, { from: 150, to: 400 })).toStrictEqual([
    { x: 200.2, y: 100, charge: 0 },
    { x: 300.3, y: 50, charge: 0 },
  ]);
  expect(centroidPeakObjects(centroid)).toHaveLength(3);
});

/**
 * A single gaussian band sampled evenly, on a baseline of one count.
 * @param count - How many points to sample.
 * @param start - Where the first point sits, in m/z.
 * @param step - The spacing between two points, in m/z.
 * @param centre - Where the band sits, in m/z.
 * @param width - Its standard deviation, in m/z.
 * @returns The trace.
 */
function gaussianTrace(
  count: number,
  start: number,
  step: number,
  centre: number,
  width: number,
): MassTrace {
  const x = new Float64Array(count);
  const y = new Float64Array(count);
  for (let index = 0; index < count; index++) {
    const mz = start + index * step;
    const delta = mz - centre;
    x[index] = mz;
    y[index] = 5000 * Math.exp((-delta * delta) / (2 * width * width)) + 1;
  }
  return { x, y };
}
