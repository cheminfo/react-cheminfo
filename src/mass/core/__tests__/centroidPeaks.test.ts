import { expect, test } from 'vitest';

import { centroidPeakObjects, selectCentroidPeaks } from '../centroidPeaks.ts';
import type { MassPeaks } from '../massSpectrum.ts';

test('the peak objects carry the charge column and are built once', () => {
  const centroid = peaks([100.1, 200.2, 300.3], [25, 100, 50], [0, 2, 2]);

  const objects = centroidPeakObjects(centroid);

  expect(objects).toStrictEqual([
    { x: 100.1, y: 25, charge: 0 },
    { x: 200.2, y: 100, charge: 2 },
    { x: 300.3, y: 50, charge: 2 },
  ]);
  expect(centroidPeakObjects(centroid)).toBe(objects);
});

test('a window keeps the peaks inside it, in increasing m/z', () => {
  const centroid = peaks([100.1, 200.2, 300.3], [25, 100, 50], [0, 0, 0]);

  expect(selectCentroidPeaks(centroid, { from: 150, to: 400 })).toStrictEqual([
    { x: 200.2, y: 100, charge: 0 },
    { x: 300.3, y: 50, charge: 0 },
  ]);
  expect(
    selectCentroidPeaks(centroid, { from: 200.2, to: 200.2 }),
  ).toStrictEqual([{ x: 200.2, y: 100, charge: 0 }]);
  expect(selectCentroidPeaks(centroid, { from: 400, to: 500 })).toStrictEqual(
    [],
  );
});

test('a limit keeps the most intense peaks and sorts them back by m/z', () => {
  const centroid = peaks([100.1, 200.2, 300.3], [25, 100, 50], [0, 0, 0]);

  expect(selectCentroidPeaks(centroid, { limit: 2 })).toStrictEqual([
    { x: 200.2, y: 100, charge: 0 },
    { x: 300.3, y: 50, charge: 0 },
  ]);
  expect(selectCentroidPeaks(centroid, { limit: 1 })).toStrictEqual([
    { x: 200.2, y: 100, charge: 0 },
  ]);
});

test('the threshold is read off the base peak of the whole spectrum', () => {
  const centroid = peaks([100.1, 200.2, 300.3], [25, 100, 50], [0, 0, 0]);

  expect(selectCentroidPeaks(centroid, { threshold: 0.4 })).toStrictEqual([
    { x: 200.2, y: 100, charge: 0 },
    { x: 300.3, y: 50, charge: 0 },
  ]);
  // 25 is 25 % of the base peak of the spectrum and 50 % of the window's own,
  // and it is the spectrum that decides.
  expect(
    selectCentroidPeaks(centroid, { from: 0, to: 250, threshold: 0.4 }),
  ).toStrictEqual([{ x: 200.2, y: 100, charge: 0 }]);
});

test('a selection hands out the cached objects rather than copies of them', () => {
  const centroid = peaks([100.1, 200.2], [50, 100], [0, 0]);
  const objects = centroidPeakObjects(centroid);

  expect(selectCentroidPeaks(centroid)[1]).toBe(objects[1]);
});

test('an empty centroid selects nothing without reaching for a first peak', () => {
  const centroid = peaks([], [], []);

  expect(centroidPeakObjects(centroid)).toStrictEqual([]);
  expect(selectCentroidPeaks(centroid)).toStrictEqual([]);
  expect(selectCentroidPeaks(centroid)).not.toBe(centroidPeakObjects(centroid));
});

test('a centroid whose columns disagree is refused by name', () => {
  const centroid: MassPeaks = {
    x: new Float64Array([100, 200, 300]),
    y: new Float64Array([1, 2, 3]),
    charge: new Int16Array([0, 0]),
  };

  expect(() => centroidPeakObjects(centroid)).toThrow(
    'The centroid carries 3 masses, 3 intensities and 2 charges; every peak needs one of each',
  );
});

/**
 * A centroid holding exactly the given columns.
 * @param mz - The masses.
 * @param intensity - The intensities, on the 0–100 scale.
 * @param charge - The charges, `0` for none.
 * @returns The picked peaks.
 */
function peaks(mz: number[], intensity: number[], charge: number[]): MassPeaks {
  return {
    x: new Float64Array(mz),
    y: new Float64Array(intensity),
    charge: new Int16Array(charge),
  };
}
