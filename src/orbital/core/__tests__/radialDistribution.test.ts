import { expect, test } from 'vitest';

import { BOHR_IN_ANGSTROM } from '../constants.ts';
import { radialDistribution } from '../radialDistribution.ts';

test('hydrogen 1s peaks at one bohr and has no node', () => {
  const distribution = radialDistribution({ n: 1, l: 0, charge: 1 });

  expect(distribution.distances).toHaveLength(600);
  expect(distribution.density).toHaveLength(600);
  expect(distribution.amplitude).toHaveLength(600);
  expect(distribution.nodeRadii).toStrictEqual([]);

  const step = distribution.limit / 599;

  expect(
    Math.abs(distribution.peakDistance - BOHR_IN_ANGSTROM),
  ).toBeLessThanOrEqual(step);
});

test('hydrogen 2p peaks at four bohr, the n² of a nodeless orbital', () => {
  const distribution = radialDistribution(
    { n: 2, l: 1, charge: 1 },
    { samples: 4000 },
  );

  expect(distribution.peakDistance / BOHR_IN_ANGSTROM).toBeCloseTo(4, 2);
});

test('hydrogen 3s has its two nodes at (9 ± 3√3)/2 bohr', () => {
  const distribution = radialDistribution({ n: 3, l: 0, charge: 1 });

  expect(distribution.nodeRadii).toHaveLength(2);
  expect((distribution.nodeRadii[0] ?? 0) / BOHR_IN_ANGSTROM).toBeCloseTo(
    (9 - 3 * Math.sqrt(3)) / 2,
    5,
  );
  expect((distribution.nodeRadii[1] ?? 0) / BOHR_IN_ANGSTROM).toBeCloseTo(
    (9 + 3 * Math.sqrt(3)) / 2,
    5,
  );
  expect(distribution.limit).toBeGreaterThan(
    distribution.nodeRadii[1] ?? Infinity,
  );
});

test('the extremes are the extremes of the samples', () => {
  const distribution = radialDistribution(
    { n: 3, l: 1, charge: 2.5 },
    { samples: 50 },
  );

  let largestDensity = 0;
  let largestAmplitude = 0;
  for (let index = 0; index < 50; index++) {
    largestDensity = Math.max(
      largestDensity,
      distribution.density[index] as number,
    );
    largestAmplitude = Math.max(
      largestAmplitude,
      Math.abs(distribution.amplitude[index] as number),
    );
  }

  expect(distribution.peakDensity).toBe(largestDensity);
  expect(distribution.peakAmplitude).toBe(largestAmplitude);
  expect(distribution.distances[0]).toBe(0);
  expect(distribution.distances[49]).toBe(distribution.limit);
});

test('a stronger charge pulls the whole curve in', () => {
  const loose = radialDistribution({ n: 2, l: 0, charge: 1 });
  const tight = radialDistribution({ n: 2, l: 0, charge: 2 });

  expect(tight.limit).toBeCloseTo(loose.limit / 2, 2);
  expect(tight.nodeRadii[0]).toBeCloseTo((loose.nodeRadii[0] ?? 0) / 2, 6);
});
