import { expect, test } from 'vitest';

import { applyBackground, sliceWindow } from '../applyBackground.ts';
import { linearBackground } from '../linearBackground.ts';
import { shirleyBackground } from '../shirleyBackground.ts';
import { tougaardBackground } from '../tougaardBackground.ts';

import { flatTrace, syntheticTrace } from './syntheticSpectrum.ts';

/**
 * A window of eleven points, one eV apart, with a line on a sloping baseline.
 * @returns The trace, x ascending in binding energy.
 */
function linedWindow(): { x: Float64Array; y: Float64Array } {
  return syntheticTrace([{ center: 285, height: 1000, fwhm: 1 }], {
    from: 280,
    to: 290,
    points: 11,
    baseline: 100,
    slope: 10,
  });
}

/**
 * A flat window of eleven points, one eV apart.
 * @returns The trace, x ascending in binding energy.
 */
function flatWindow(): { x: Float64Array; y: Float64Array } {
  return flatTrace(100, { from: 280, to: 290, points: 11 });
}

test('no background leaves the window as it was measured', () => {
  const trace = linedWindow();

  const { background, corrected } = applyBackground(trace);

  expect(Array.from(background)).toStrictEqual([
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ]);
  expect(corrected).toBe(trace.y);
});

test('each name gives what that background gives on its own', () => {
  const trace = linedWindow();

  const linear = applyBackground(trace, { kind: 'linear' });
  const shirley = applyBackground(trace, { kind: 'shirley' });
  const tougaard = applyBackground(trace, { kind: 'tougaard' });

  expect(linear.background).toStrictEqual(linearBackground(trace).background);
  expect(shirley.background).toStrictEqual(shirleyBackground(trace).background);
  expect(tougaard.background).toStrictEqual(
    tougaardBackground(trace).background,
  );
});

test('the options reach the background that was named', () => {
  const trace = {
    x: Float64Array.from([280, 281, 282, 283, 284, 285]),
    y: Float64Array.from([90, 110, 100, 100, 190, 210]),
  };

  const single = applyBackground(trace, { kind: 'linear' });
  const averaged = applyBackground(trace, { kind: 'linear', averageWidth: 2 });

  expect(single.background[0]).toBe(90);
  expect(averaged.background[0]).toBe(100);
});

test('a window keeps the points inside the bounds, not beside them', () => {
  const cut = sliceWindow(flatWindow(), 283, 286);

  expect(Array.from(cut.x)).toStrictEqual([283, 284, 285, 286]);
  expect(Array.from(cut.y)).toStrictEqual([100, 100, 100, 100]);
});

test('a bound falling between two points keeps only what is inside it', () => {
  const cut = sliceWindow(flatWindow(), 282.5, 285.5);

  expect(Array.from(cut.x)).toStrictEqual([283, 284, 285]);
});

test('bounds given the wrong way round describe the same window', () => {
  expect(Array.from(sliceWindow(flatWindow(), 286, 283).x)).toStrictEqual([
    283, 284, 285, 286,
  ]);
});

test('the cut columns are views of the trace rather than copies of it', () => {
  const trace = flatWindow();

  const cut = sliceWindow(trace, 283, 286);

  expect(cut.x.buffer).toBe(trace.x.buffer);
  expect(cut.y.buffer).toBe(trace.y.buffer);
});

test('a window covering everything is the trace itself', () => {
  const trace = flatWindow();

  expect(sliceWindow(trace)).toBe(trace);
  expect(sliceWindow(trace, 200, 400)).toBe(trace);
});

test('a window past the end of the trace holds nothing', () => {
  const cut = sliceWindow(flatWindow(), 400, 500);

  expect(Array.from(cut.x)).toStrictEqual([]);
  expect(Array.from(cut.y)).toStrictEqual([]);
});

test('an empty trace cuts to itself rather than raising', () => {
  const trace = { x: new Float64Array(0), y: new Float64Array(0) };

  expect(sliceWindow(trace, 280, 290)).toBe(trace);
});
