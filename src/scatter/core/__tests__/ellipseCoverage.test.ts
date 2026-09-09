import { expect, test } from 'vitest';

import {
  coverageForStandardDeviations,
  standardDeviationsForCoverage,
} from '../ellipseCoverage.ts';

test('an ellipse holds far less of a cloud than the one-dimensional figures suggest', () => {
  expect(coverageForStandardDeviations(1)).toBe(0.3934693402873666);
  expect(coverageForStandardDeviations(2)).toBe(0.8646647167633873);
  expect(coverageForStandardDeviations(3)).toBe(0.9888910034617577);
});

test('an ellipse of no size holds nothing', () => {
  expect(coverageForStandardDeviations(0)).toBe(0);
  expect(coverageForStandardDeviations(-1)).toBe(0);
  expect(coverageForStandardDeviations(Number.NaN)).toBe(0);
  expect(coverageForStandardDeviations(Number.NEGATIVE_INFINITY)).toBe(0);
});

test('an ellipse of unbounded size holds everything', () => {
  expect(coverageForStandardDeviations(Number.POSITIVE_INFINITY)).toBe(1);
});

test('a share is turned back into the radius that produces it', () => {
  expect(standardDeviationsForCoverage(0.95)).toBe(2.447746830680816);
  expect(standardDeviationsForCoverage(0.5)).toBe(1.1774100225154747);
  expect(standardDeviationsForCoverage(0.9)).toBe(2.145966026289347);
  expect(standardDeviationsForCoverage(0.99)).toBe(3.0348542587702925);
});

test('no finite ellipse holds a cloud whose tails never end', () => {
  expect(standardDeviationsForCoverage(1)).toBe(Number.POSITIVE_INFINITY);
  expect(standardDeviationsForCoverage(2)).toBe(Number.POSITIVE_INFINITY);
});

test('a share at or below nothing asks for no ellipse at all', () => {
  expect(standardDeviationsForCoverage(0)).toBe(0);
  expect(standardDeviationsForCoverage(-0.5)).toBe(0);
  expect(standardDeviationsForCoverage(Number.NaN)).toBe(0);
});

test('the two directions are inverses of one another', () => {
  for (const share of [0.1, 0.25, 0.5, 0.75, 0.9, 0.95, 0.99]) {
    expect(
      coverageForStandardDeviations(standardDeviationsForCoverage(share)),
    ).toBeCloseTo(share, 12);
  }
  for (const spread of [0.5, 1, 1.5, 2, 2.5, 3]) {
    expect(
      standardDeviationsForCoverage(coverageForStandardDeviations(spread)),
    ).toBeCloseTo(spread, 12);
  }
});
