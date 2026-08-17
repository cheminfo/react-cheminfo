import { expect, test } from 'vitest';

import {
  atomicGridBox,
  createAtomicOrbitalEvaluator,
  sampleAtomicOrbital,
} from '../atomicGrid.ts';
import type { AtomicOrbital } from '../atomicOrbitals.ts';
import { atomicOrbitalsOf, findAtomicOrbital } from '../atomicOrbitals.ts';
import { gridIndex } from '../grid.ts';

import { atomicNumberOf } from './symbols.ts';

/**
 * One orbital of one element, by symbol and id.
 * @param symbol - Chemical symbol of the element.
 * @param id - Orbital id, e.g. `2pz`.
 * @returns The orbital.
 */
function orbital(symbol: string, id: string): AtomicOrbital {
  const found = findAtomicOrbital(atomicOrbitalsOf(atomicNumberOf(symbol)), id);
  if (found === null) throw new Error(`no orbital ${id} on ${symbol}`);
  return found;
}

/**
 * Half the edge of the box one orbital is sampled over, ångström.
 * @param target - The orbital being measured.
 * @returns Half the edge of its sampling box, ångström.
 */
function half(target: AtomicOrbital): number {
  return atomicGridBox(target).size.x / 2;
}

/**
 * `∫|ψ|² dV` over the sampled box, which is 1 for a normalised orbital.
 * @param target - The orbital being measured.
 * @param resolution - Samples along each edge.
 * @returns The sampled field.
 */
function sampledNorm(target: AtomicOrbital, resolution: number): number {
  const grid = sampleAtomicOrbital(target, { resolution });
  const voxel = grid.spacing ** 3;
  let total = 0;
  for (const value of grid.data) total += value * value;
  return total * voxel;
}

test('a sampled orbital integrates to one electron', () => {
  // The box holds 98.5% of the density by construction, and the midpoint sum
  // over a coarse grid loses a little more, so 0.95 is the honest bar here.
  for (const target of [
    orbital('H', '1s'),
    orbital('C', '2pz'),
    orbital('C', '2s'),
    orbital('Fe', '3dz2'),
    orbital('Fe', '4s'),
  ]) {
    const norm = sampledNorm(target, 96);

    expect(norm).toBeGreaterThan(0.95);
    expect(norm).toBeLessThan(1.02);
  }
});

test('the grid is cubic and centred on the nucleus', () => {
  const grid = sampleAtomicOrbital(orbital('C', '2px'), { resolution: 33 });

  expect(grid.dimensions).toStrictEqual([33, 33, 33]);
  expect(grid.origin.x).toBeCloseTo(grid.origin.y, 12);
  expect(grid.origin.y).toBeCloseTo(grid.origin.z, 12);
  expect(grid.origin.x).toBeLessThan(0);

  // The far corner mirrors the near one, so the nucleus is the centre sample.
  const far = grid.origin.x + grid.spacing * 32;

  expect(far).toBeCloseTo(-grid.origin.x, 10);
});

test('a p orbital is antisymmetric about its own nodal plane', () => {
  const grid = sampleAtomicOrbital(orbital('C', '2pz'), { resolution: 33 });
  const middle = 16;
  for (const [x, y] of [
    [16, 16],
    [10, 20],
    [22, 12],
  ]) {
    for (let offset = 1; offset <= 8; offset++) {
      const above =
        grid.data[
          gridIndex(grid.dimensions, x as number, y as number, middle + offset)
        ] ?? 0;
      const below =
        grid.data[
          gridIndex(grid.dimensions, x as number, y as number, middle - offset)
        ] ?? 0;

      expect(above).toBeCloseTo(-below, 6);
    }
  }

  // The nodal plane itself is zero everywhere.
  expect(grid.data[gridIndex(grid.dimensions, 8, 20, middle)]).toBeCloseTo(
    0,
    6,
  );
  expect(grid.min).toBeLessThan(0);
  expect(grid.max).toBeGreaterThan(0);
});

test('a 1s orbital never changes sign, and a 2s does', () => {
  const oneS = sampleAtomicOrbital(orbital('H', '1s'), { resolution: 33 });

  expect(oneS.min).toBeGreaterThanOrEqual(0);

  const twoS = sampleAtomicOrbital(orbital('C', '2s'), { resolution: 49 });

  expect(twoS.min).toBeLessThan(0);
  expect(twoS.max).toBeGreaterThan(0);
});

test('the nucleus is finite for every orbital, s or not', () => {
  for (const target of [
    orbital('H', '1s'),
    orbital('C', '2px'),
    orbital('Fe', '3dxy'),
    orbital('U', '4fxyz'),
  ]) {
    const value = createAtomicOrbitalEvaluator(target)(0, 0, 0);

    expect(Number.isFinite(value)).toBe(true);
    expect(target.l === 0 ? value > 0 : value === 0).toBe(true);
  }
});

test('the box grows with the shell and shrinks with the nuclear charge', () => {
  expect(half(orbital('H', '2s'))).toBeGreaterThan(half(orbital('H', '1s')));
  expect(half(orbital('H', '3s'))).toBeGreaterThan(half(orbital('H', '2s')));
  // Fluorine pulls its 2p far tighter than lithium does.
  expect(half(orbital('F', '2pz'))).toBeLessThan(half(orbital('Li', '2s')));
});

test('every sampled field carries usable statistics', () => {
  const grid = sampleAtomicOrbital(orbital('N', '2py'), { resolution: 41 });

  expect(grid.data).toHaveLength(41 * 41 * 41);
  expect(grid.sigma).toBeGreaterThan(0);
  expect(Number.isFinite(grid.mean)).toBe(true);

  for (const value of grid.data) expect(Number.isFinite(value)).toBe(true);
});
