import { expect, test } from 'vitest';

import type { NearestPeak } from '../../core/nearestPeak.ts';
import { sameNearestPeak } from '../../core/nearestPeak.ts';
import type { MassReadout } from '../useMassPointer.ts';
import { sameMassReadout } from '../useMassPointer.ts';

const peak: NearestPeak = {
  spectrumId: 'ms2',
  index: 12,
  mz: 366.1395,
  intensity: 100,
};

test('the same peak read twice is the same peak', () => {
  expect(sameNearestPeak(peak, { ...peak })).toBe(true);
  expect(sameNearestPeak(null, null)).toBe(true);
});

test('a peak and no peak are never the same answer', () => {
  expect(sameNearestPeak(peak, null)).toBe(false);
  expect(sameNearestPeak(null, peak)).toBe(false);
});

test('a peak of another spectrum, or another peak, is a new answer', () => {
  expect(sameNearestPeak(peak, { ...peak, spectrumId: 'ms1' })).toBe(false);
  expect(sameNearestPeak(peak, { ...peak, index: 13 })).toBe(false);
  expect(sameNearestPeak(peak, { ...peak, mz: 366.1396 })).toBe(false);
});

test('two readings of one peak are the same reading, wherever the crosshair is', () => {
  expect(
    sameMassReadout(readingOf(366.13, 99.2), readingOf(366.14, 98.1)),
  ).toBe(true);
});

test('a reading over no peak differs from one over a peak', () => {
  const overNothing: MassReadout = { mz: 400, intensity: 2, peak: null };

  expect(sameMassReadout(readingOf(366.13, 99.2), overNothing)).toBe(false);
  expect(sameMassReadout(overNothing, { ...overNothing, mz: 401 })).toBe(true);
});

/**
 * A reading taken somewhere over the one peak above.
 * @param mz - What the m/z axis reads under the crosshair.
 * @param intensity - What the intensity axis reads there.
 * @returns The reading.
 */
function readingOf(mz: number, intensity: number): MassReadout {
  return { mz, intensity, peak };
}
