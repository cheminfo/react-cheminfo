import { expect, test } from 'vitest';

import { BOHR_IN_ANGSTROM } from '../constants.ts';
import {
  createRadialFunction,
  enclosingRadius,
  meanRadius,
  orbitalEnergy,
  radialAmplitude,
  radialNodeCount,
  radialNodeRadii,
  radialProfile,
} from '../hydrogenic.ts';

/**
 * Textbook node positions are quoted in bohr, so the tests compare in bohr.
 * @param angstrom - A distance in ångström.
 * @returns The same distance in Bohr radii.
 */
function inBohr(angstrom: number): number {
  return angstrom / BOHR_IN_ANGSTROM;
}

/**
 * `∫₀^limit R(r)² r² dr` by Simpson's rule; 1 for a normalised orbital.
 * @param n - Principal quantum number.
 * @param l - Angular momentum quantum number.
 * @param charge - Effective nuclear charge.
 * @param limit - Distance to integrate out to.
 * @returns The integral of `r²R²` out to the limit.
 */
function radialNorm(
  n: number,
  l: number,
  charge: number,
  limit: number,
): number {
  const radial = createRadialFunction({ n, l, charge });
  const steps = 20000;
  const step = limit / steps;
  let total = 0;
  for (let index = 0; index <= steps; index++) {
    const r = index * step;
    const value = radial(r);
    const weight = index === 0 || index === steps ? 1 : index % 2 === 1 ? 4 : 2;
    total += weight * value * value * r * r;
  }
  return (total * step) / 3;
}

test('the 1s, 2s and 2p radial functions match their closed forms', () => {
  const a = BOHR_IN_ANGSTROM;
  const toAngstrom = a ** -1.5;

  // R_1s = 2 e^(−r), R_2s = (2−r) e^(−r/2) / (2√2), R_2p = r e^(−r/2) / (2√6),
  // all in bohr, so each is scaled by a₀^(−3/2) to reach Å^(−3/2).
  expect(radialAmplitude({ n: 1, l: 0, charge: 1 }, 0)).toBeCloseTo(
    2 * toAngstrom,
    6,
  );
  expect(radialAmplitude({ n: 1, l: 0, charge: 1 }, a)).toBeCloseTo(
    2 * Math.exp(-1) * toAngstrom,
    6,
  );
  expect(radialAmplitude({ n: 2, l: 0, charge: 1 }, a)).toBeCloseTo(
    ((2 - 1) * Math.exp(-0.5) * toAngstrom) / (2 * Math.SQRT2),
    6,
  );
  expect(radialAmplitude({ n: 2, l: 1, charge: 1 }, a)).toBeCloseTo(
    (1 * Math.exp(-0.5) * toAngstrom) / (2 * Math.sqrt(6)),
    6,
  );
});

test('every orbital through 4f is normalised', () => {
  const cases: Array<[number, number, number, number]> = [
    [1, 0, 1, 20],
    [2, 0, 1, 40],
    [2, 1, 1, 40],
    [3, 0, 1, 60],
    [3, 1, 1, 60],
    [3, 2, 1, 60],
    [4, 0, 1, 90],
    [4, 3, 1, 90],
    [2, 1, 3.25, 20],
    [3, 2, 6.25, 20],
  ];
  for (const [n, l, charge, limit] of cases) {
    expect(radialNorm(n, l, charge, limit)).toBeCloseTo(1, 5);
  }
});

test('the radial node count is n − ℓ − 1', () => {
  expect(radialNodeCount({ n: 1, l: 0, charge: 1 })).toBe(0);
  expect(radialNodeCount({ n: 2, l: 0, charge: 1 })).toBe(1);
  expect(radialNodeCount({ n: 2, l: 1, charge: 1 })).toBe(0);
  expect(radialNodeCount({ n: 3, l: 0, charge: 1 })).toBe(2);
  expect(radialNodeCount({ n: 3, l: 1, charge: 1 })).toBe(1);
  expect(radialNodeCount({ n: 3, l: 2, charge: 1 })).toBe(0);
  expect(radialNodeCount({ n: 4, l: 3, charge: 1 })).toBe(0);
});

test('the 2s node sits at 2a₀ and the 3p node at 6a₀', () => {
  const twoS = radialNodeRadii({ n: 2, l: 0, charge: 1 });

  expect(twoS).toHaveLength(1);
  expect(inBohr(twoS[0] as number)).toBeCloseTo(2, 5);

  const threeP = radialNodeRadii({ n: 3, l: 1, charge: 1 });

  expect(threeP).toHaveLength(1);
  expect(inBohr(threeP[0] as number)).toBeCloseTo(6, 5);
});

test('the two 3s nodes sit at 3 ± √3 in units of 3a₀/2', () => {
  const nodes = radialNodeRadii({ n: 3, l: 0, charge: 1 });

  expect(nodes).toHaveLength(2);
  expect(inBohr(nodes[0] as number)).toBeCloseTo(1.5 * (3 - Math.sqrt(3)), 5);
  expect(inBohr(nodes[1] as number)).toBeCloseTo(1.5 * (3 + Math.sqrt(3)), 5);
});

test('a nodeless orbital reports no node radii', () => {
  expect(radialNodeRadii({ n: 1, l: 0, charge: 1 })).toStrictEqual([]);
  expect(radialNodeRadii({ n: 2, l: 1, charge: 1 })).toStrictEqual([]);
  expect(radialNodeRadii({ n: 3, l: 2, charge: 1 })).toStrictEqual([]);
});

test('a node contracts with the effective charge, as 1/Z', () => {
  const hydrogen = radialNodeRadii({ n: 2, l: 0, charge: 1 })[0] as number;
  const carbon = radialNodeRadii({ n: 2, l: 0, charge: 3.25 })[0] as number;

  expect(carbon).toBeCloseTo(hydrogen / 3.25, 6);
});

test('the mean radius is a₀(3n² − ℓ(ℓ+1))/2Z', () => {
  expect(inBohr(meanRadius({ n: 1, l: 0, charge: 1 }))).toBeCloseTo(1.5, 10);
  expect(inBohr(meanRadius({ n: 2, l: 1, charge: 1 }))).toBeCloseTo(5, 10);
  expect(inBohr(meanRadius({ n: 3, l: 2, charge: 1 }))).toBeCloseTo(10.5, 10);
  // Carbon's 2p is far tighter than hydrogen's, which is the point of Z_eff.
  expect(meanRadius({ n: 2, l: 1, charge: 3.25 })).toBeLessThan(
    meanRadius({ n: 2, l: 1, charge: 1 }),
  );
});

test('the energy is the Bohr formula', () => {
  expect(orbitalEnergy({ n: 1, l: 0, charge: 1 })).toBeCloseTo(-13.6057, 3);
  expect(orbitalEnergy({ n: 2, l: 0, charge: 1 })).toBeCloseTo(-3.4014, 3);
  expect(orbitalEnergy({ n: 2, l: 1, charge: 2 })).toBeCloseTo(-13.6057, 3);
});

test('the enclosing radius grows with the shell and holds most of the electron', () => {
  const oneS = enclosingRadius({ n: 1, l: 0, charge: 1 }, 0.99);
  const twoS = enclosingRadius({ n: 2, l: 0, charge: 1 }, 0.99);
  const threeD = enclosingRadius({ n: 3, l: 2, charge: 1 }, 0.99);

  expect(oneS).toBeLessThan(twoS);
  expect(twoS).toBeLessThan(threeD);
  // The 1s of hydrogen holds 99% of its density inside about 4.2 bohr.
  expect(inBohr(oneS)).toBeCloseTo(4.2, 0);
});

test('the radial profile puts a zero of the density at every node', () => {
  const nodes = radialNodeRadii({ n: 3, l: 0, charge: 1 });
  const limit = (nodes[1] as number) * 2;
  const profile = radialProfile({ n: 3, l: 0, charge: 1 }, limit, 4001);

  expect(profile.distances).toHaveLength(4001);

  for (const node of nodes) {
    const index = Math.round((node / limit) * 4000);

    expect(Math.abs(profile.density[index] as number)).toBeLessThan(1e-4);
  }
  // The density is r²R², so it can never be negative anywhere.
  for (const value of profile.density) {
    expect(value).toBeGreaterThanOrEqual(0);
  }
});

test('impossible quantum numbers are rejected', () => {
  expect(() => createRadialFunction({ n: 0, l: 0, charge: 1 })).toThrow(
    /principal quantum number/,
  );
  expect(() => createRadialFunction({ n: 2, l: 2, charge: 1 })).toThrow(
    /ℓ must be between 0 and 1/,
  );
  expect(() => createRadialFunction({ n: 2, l: 1, charge: 0 })).toThrow(
    /effective charge must be positive/,
  );
  expect(() => enclosingRadius({ n: 1, l: 0, charge: 1 }, 1)).toThrow(
    /enclosed fraction/,
  );
  expect(() => radialProfile({ n: 1, l: 0, charge: 1 }, 5, 1)).toThrow(
    /2 samples/,
  );
});
