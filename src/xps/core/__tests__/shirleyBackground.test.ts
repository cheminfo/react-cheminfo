import { expect, test } from 'vitest';

import { shirleyBackground } from '../shirleyBackground.ts';

import { flatTrace } from './syntheticSpectrum.ts';

/**
 * A window whose baseline steps up across the middle, as a real one does under
 * a photoemission line.
 * @returns The trace, x ascending in binding energy.
 */
function steppedTrace(): { x: Float64Array; y: Float64Array } {
  return {
    x: Float64Array.from([
      280, 281, 282, 283, 284, 285, 286, 287, 288, 289, 290,
    ]),
    y: Float64Array.from([
      100, 100, 100, 100, 100, 200, 200, 200, 200, 200, 200,
    ]),
  };
}

test('a flat window sits at its own level and corrects to nothing', () => {
  const { background, corrected } = shirleyBackground(
    flatTrace(750, { from: 280, to: 284, points: 5 }),
  );

  expect(Array.from(background)).toStrictEqual([750, 750, 750, 750, 750]);
  expect(Array.from(corrected)).toStrictEqual([0, 0, 0, 0, 0]);
});

test('the step is climbed where the signal is, not before it', () => {
  const { background, corrected } = shirleyBackground(steppedTrace());

  // Nothing rises above the baseline below 285, so the background has nothing
  // to climb on there and stays exactly at the level measured at that end.
  expect(Array.from(background.subarray(0, 5))).toStrictEqual([
    100, 100, 100, 100, 100,
  ]);
  expect(background[10]).toBe(200);
  expect(corrected[0]).toBe(0);
  expect(corrected[10]).toBe(0);
});

test('the background never runs backwards across the window', () => {
  const { background } = shirleyBackground(steppedTrace());

  for (let index = 1; index < background.length; index++) {
    expect(background[index]).toBeGreaterThanOrEqual(
      background[index - 1] as number,
    );
  }

  expect(background[6]).toBeGreaterThan(background[5] as number);
});

test('a window enclosing no area falls back to the straight line', () => {
  const trace = {
    x: Float64Array.from([280, 281, 282, 283, 284]),
    y: Float64Array.from([100, 0, 0, 0, 200]),
  };

  const { background } = shirleyBackground(trace);

  expect(Array.from(background)).toStrictEqual([100, 125, 150, 175, 200]);
});

test('a window of one point is its own background', () => {
  const { background, corrected } = shirleyBackground({
    x: Float64Array.from([284.6]),
    y: Float64Array.from([4321]),
  });

  expect(Array.from(background)).toStrictEqual([4321]);
  expect(Array.from(corrected)).toStrictEqual([0]);
});

test('the ends are the measured levels however many passes it takes', () => {
  const loose = shirleyBackground(steppedTrace(), { maxIterations: 1 });
  const tight = shirleyBackground(steppedTrace(), { maxIterations: 50 });

  expect(loose.background[0]).toBe(100);
  expect(loose.background[10]).toBe(200);
  expect(tight.background[0]).toBe(100);
  expect(tight.background[10]).toBe(200);
  // One pass has not yet moved the curve as far as convergence takes it.
  expect(tight.background[6]).toBeGreaterThan(loose.background[6] as number);
});
