import { expect, test } from 'vitest';

import { integrateWindow } from '../integrate.ts';

import { flatTrace, syntheticTrace } from './syntheticSpectrum.ts';

/**
 * A Gaussian of known area on a flat baseline of a hundred counts.
 *
 * A Gaussian integrates to `height·σ·√(2π)`, which for a full width at half
 * maximum of one eV and a thousand counts is 1064.467 counts·eV — a number the
 * test can assert rather than one it has to take from the code it is testing.
 * @returns The trace, x ascending in binding energy.
 */
function gaussianOnBaseline(): { x: Float64Array; y: Float64Array } {
  return syntheticTrace([{ center: 285, height: 1000, fwhm: 1 }], {
    from: 280,
    to: 290,
    points: 1001,
    baseline: 100,
  });
}

test('a flat window integrates to its level times its width', () => {
  const trace = flatTrace(100, { from: 280, to: 290, points: 11 });

  expect(integrateWindow(trace)).toBe(1000);
});

test('the bounds cut the window before the area is taken', () => {
  const trace = flatTrace(100, { from: 280, to: 290, points: 11 });

  expect(integrateWindow(trace, { from: 282, to: 285 })).toBe(300);
  expect(integrateWindow(trace, { from: 285, to: 282 })).toBe(300);
});

test('a linear background leaves the peak and nothing else', () => {
  const trace = gaussianOnBaseline();

  expect(integrateWindow(trace, { kind: 'linear' })).toBeCloseTo(1064.467, 2);
});

test('no background counts the baseline along with the peak', () => {
  const trace = gaussianOnBaseline();

  expect(integrateWindow(trace)).toBeCloseTo(2064.467, 2);
});

test('a flat window over a background of its own integrates to nothing', () => {
  const trace = flatTrace(100, { from: 280, to: 290, points: 11 });

  expect(integrateWindow(trace, { kind: 'linear' })).toBe(0);
  expect(integrateWindow(trace, { kind: 'shirley' })).toBe(0);
  expect(integrateWindow(trace, { kind: 'tougaard' })).toBe(0);
});

test('a window holding one point or none has no area', () => {
  const trace = flatTrace(100, { from: 280, to: 290, points: 11 });

  expect(integrateWindow(trace, { from: 285, to: 285 })).toBe(0);
  expect(integrateWindow(trace, { from: 400, to: 500 })).toBe(0);
  expect(
    integrateWindow({ x: new Float64Array(0), y: new Float64Array(0) }),
  ).toBe(0);
});
