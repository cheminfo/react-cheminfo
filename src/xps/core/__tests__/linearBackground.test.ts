import { expect, test } from 'vitest';

import { linearBackground } from '../linearBackground.ts';

import { flatTrace, syntheticTrace } from './syntheticSpectrum.ts';

test('a flat window gets its own level back and corrects to nothing', () => {
  const { background, corrected } = linearBackground(
    flatTrace(500, { from: 280, to: 284, points: 5 }),
  );

  expect(Array.from(background)).toStrictEqual([500, 500, 500, 500, 500]);
  expect(Array.from(corrected)).toStrictEqual([0, 0, 0, 0, 0]);
});

test('a sloping window gets the line through its two ends', () => {
  const trace = syntheticTrace([], {
    from: 100,
    to: 110,
    points: 11,
    baseline: 200,
    slope: 10,
  });

  const { background, corrected } = linearBackground(trace);

  expect(background[0]).toBe(200);
  expect(background[5]).toBe(250);
  expect(background[10]).toBe(300);
  expect(Array.from(corrected)).toStrictEqual([
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ]);
});

test('the line ignores the peak between its ends', () => {
  const trace = syntheticTrace([{ center: 285, height: 1000, fwhm: 1 }], {
    from: 280,
    to: 290,
    points: 11,
    baseline: 100,
  });

  const { background, corrected } = linearBackground(trace);

  expect(background[0]).toBe(100);
  expect(background[5]).toBe(100);
  expect(background[10]).toBe(100);
  expect(corrected[5]).toBe(1000);
});

test('averaging several points at each end levels the noise on them', () => {
  const trace = {
    x: Float64Array.from([280, 281, 282, 283, 284, 285]),
    y: Float64Array.from([90, 110, 100, 100, 190, 210]),
  };

  const single = linearBackground(trace);
  const averaged = linearBackground(trace, { averageWidth: 2 });

  expect(single.background[0]).toBe(90);
  expect(single.background[5]).toBe(210);
  expect(averaged.background[0]).toBe(100);
  expect(averaged.background[5]).toBe(200);
});

test('a single point is its own background', () => {
  const trace = {
    x: Float64Array.from([284.6]),
    y: Float64Array.from([1234]),
  };

  const { background, corrected } = linearBackground(trace);

  expect(Array.from(background)).toStrictEqual([1234]);
  expect(Array.from(corrected)).toStrictEqual([0]);
});

test('an empty window gives empty columns rather than raising', () => {
  const { background, corrected } = linearBackground({
    x: new Float64Array(0),
    y: new Float64Array(0),
  });

  expect(Array.from(background)).toStrictEqual([]);
  expect(Array.from(corrected)).toStrictEqual([]);
});
