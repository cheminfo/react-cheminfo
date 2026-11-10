import { expect, test } from 'vitest';

import {
  TOUGAARD_B,
  TOUGAARD_C,
  tougaardBackground,
} from '../tougaardBackground.ts';

import { flatTrace, syntheticTrace } from './syntheticSpectrum.ts';

/**
 * A window holding a single point of signal on an empty baseline.
 *
 * The loss tail of one point has a closed form — the trapezoid over its two
 * neighbouring segments is exactly the cross-section at that separation times
 * the intensity — so every value the convolution produces can be checked
 * against arithmetic done by hand.
 * @returns The trace, x ascending in binding energy, one eV a point.
 */
function spikeTrace(): { x: Float64Array; y: Float64Array } {
  return {
    x: Float64Array.from([
      280, 281, 282, 283, 284, 285, 286, 287, 288, 289, 290,
    ]),
    y: Float64Array.from([0, 1000, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
  };
}

test('the universal cross-section is the one it is published with', () => {
  expect(TOUGAARD_B).toBe(2866);
  expect(TOUGAARD_C).toBe(1643);
});

test('a flat window loses nothing and corrects to nothing', () => {
  const { background, corrected } = tougaardBackground(
    flatTrace(400, { from: 280, to: 284, points: 5 }),
  );

  expect(Array.from(background)).toStrictEqual([400, 400, 400, 400, 400]);
  expect(Array.from(corrected)).toStrictEqual([0, 0, 0, 0, 0]);
});

test('one point of signal spreads its tail to higher binding energy', () => {
  const { background } = tougaardBackground(spikeTrace());

  // Nothing has been lost yet at or below the signal itself.
  expect(background[0]).toBe(0);
  expect(background[1]).toBe(0);
  // B·T/(C + T²)² times 1000 counts, at T = 1, 2 and 4 eV.
  expect(background[2]).toBeCloseTo(1.0604, 3);
  expect(background[3]).toBeCloseTo(2.1131, 3);
  expect(background[5]).toBeCloseTo(4.1653, 3);
});

test('the tail grows with the distance from the line, over this window', () => {
  const { background } = tougaardBackground(spikeTrace());

  for (let index = 3; index < background.length; index++) {
    expect(background[index]).toBeGreaterThan(background[index - 1] as number);
  }
});

test('a peak leaves the low-binding-energy side of the window alone', () => {
  const trace = syntheticTrace([{ center: 283, height: 1000, fwhm: 1 }], {
    from: 280,
    to: 290,
    points: 101,
  });

  const { background, corrected } = tougaardBackground(trace);

  expect(background[0]).toBe(trace.y[0]);
  expect(corrected[0]).toBe(0);
  // Two eV below the line there is nothing yet to have been scattered.
  expect(background[10]).toBeLessThan(0.001);
  // Seven eV above it the whole line has contributed.
  expect(background[100]).toBeGreaterThan(5);
});

test('a wider cross-section constant flattens the tail', () => {
  const narrow = tougaardBackground(spikeTrace());
  const wide = tougaardBackground(spikeTrace(), { crossSectionC: 10000 });

  expect(narrow.background[10]).toBeGreaterThan(wide.background[10] as number);
});

test('a window of one point is its own background', () => {
  const { background, corrected } = tougaardBackground({
    x: Float64Array.from([284.6]),
    y: Float64Array.from([777]),
  });

  expect(Array.from(background)).toStrictEqual([777]);
  expect(Array.from(corrected)).toStrictEqual([0]);
});
