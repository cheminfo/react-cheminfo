import { expect, test } from 'vitest';

import { coverageForStandardDeviations } from '../../../scatter/core/ellipseCoverage.ts';
import {
  coverageForStandardDeviations3,
  standardDeviationsForCoverage3,
} from '../ellipsoidCoverage.ts';

test('the shell holds the shares a chi distribution with three degrees says', () => {
  expect(coverageForStandardDeviations3(1)).toBeCloseTo(0.198_748, 5);
  expect(coverageForStandardDeviations3(2)).toBeCloseTo(0.738_536, 5);
  expect(coverageForStandardDeviations3(3)).toBeCloseTo(0.970_709, 5);
});

test('a shell holds less than the flat outline drawn at the same distance', () => {
  // The whole reason this pair exists: quoting the two-dimensional 86% beside
  // a cloud would promise a tenth of the samples that are not inside it.
  for (const distance of [0.5, 1, 1.5, 2, 2.5, 3]) {
    expect(coverageForStandardDeviations3(distance)).toBeLessThan(
      coverageForStandardDeviations(distance),
    );
  }
});

test('a shell of no size holds nothing', () => {
  expect(coverageForStandardDeviations3(0)).toBe(0);
  expect(coverageForStandardDeviations3(-2)).toBe(0);
});

test('an unbounded shell holds everything', () => {
  expect(coverageForStandardDeviations3(Number.POSITIVE_INFINITY)).toBe(1);
  expect(coverageForStandardDeviations3(Number.NEGATIVE_INFINITY)).toBe(0);
});

test('the two directions invert one another', () => {
  for (const coverage of [0.1, 0.5, 0.68, 0.9, 0.95, 0.99]) {
    const distance = standardDeviationsForCoverage3(coverage);

    expect(coverageForStandardDeviations3(distance)).toBeCloseTo(coverage, 6);
  }
});

test('the usual shares come out at the distances they should', () => {
  expect(standardDeviationsForCoverage3(0.95)).toBeCloseTo(2.795_483, 4);
  expect(standardDeviationsForCoverage3(0.5)).toBeCloseTo(1.538_172, 4);
});

test('no share and every share are answered without a search', () => {
  expect(standardDeviationsForCoverage3(0)).toBe(0);
  expect(standardDeviationsForCoverage3(-1)).toBe(0);
  expect(standardDeviationsForCoverage3(1)).toBe(Number.POSITIVE_INFINITY);
  expect(standardDeviationsForCoverage3(2)).toBe(Number.POSITIVE_INFINITY);
  expect(standardDeviationsForCoverage3(Number.NaN)).toBe(0);
});

test('the share grows with the distance at every step', () => {
  let previous = 0;
  for (let distance = 0.1; distance <= 5; distance += 0.1) {
    const coverage = coverageForStandardDeviations3(distance);

    expect(coverage).toBeGreaterThan(previous);

    previous = coverage;
  }
});
