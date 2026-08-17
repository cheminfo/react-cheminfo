import { expect, test } from 'vitest';

import { sampleAtomicOrbital } from '../atomicGrid.ts';
import type { AtomicOrbital } from '../atomicOrbitals.ts';
import { atomicOrbitalsOf, findAtomicOrbital } from '../atomicOrbitals.ts';
import { ENCLOSED_WEIGHT } from '../constants.ts';
import type { OrbitalGrid } from '../grid.ts';
import {
  enclosedReach,
  isocontourCutoff,
  orbitalContour,
} from '../isovalue.ts';

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
 * Share of `∑ψ²` held by the samples at or beyond a cutoff.
 * @param data - The sampled amplitudes.
 * @param cutoff - The isovalue to measure against.
 * @returns The enclosed share, between 0 and 1.
 */
function weightAbove(data: Float32Array, cutoff: number): number {
  let total = 0;
  let inside = 0;
  for (let index = data.length - 1; index >= 0; index--) {
    const weight = (data[index] as number) ** 2;
    total += weight;
    if (weight >= cutoff * cutoff) inside += weight;
  }
  return inside / total;
}

test('the cutoff encloses the share of the weight it was asked for', () => {
  for (const target of [
    orbital('H', '1s'),
    orbital('C', '2pz'),
    orbital('Fe', '3dz2'),
    orbital('Xe', '4py'),
  ]) {
    const { data } = sampleAtomicOrbital(target, { resolution: 48 });
    const enclosed = weightAbove(data, isocontourCutoff(data));

    // The cutoff lands on a bin edge, so it encloses a little over the target.
    expect(enclosed).toBeGreaterThanOrEqual(ENCLOSED_WEIGHT);
    expect(enclosed).toBeLessThan(ENCLOSED_WEIGHT + 0.02);
  }
});

test('a diffuse orbital gets a real surface, not a blank canvas', () => {
  // Every one of these is normalised over a box tens of ångström wide, so its
  // amplitudes sit in the range molstar's own helper abandons as degenerate —
  // and each drew nothing at all before the quantile replaced it.
  for (const target of [
    orbital('Cs', '6s'),
    orbital('Cs', '7s'),
    orbital('H', '4py'),
    orbital('H', '4dz2'),
    orbital('K', '5s'),
  ]) {
    const field = sampleAtomicOrbital(target, { resolution: 48 });
    const { cutoff, reach } = orbitalContour(field);

    expect(cutoff, `${target.id} must have an isovalue`).toBeGreaterThan(0);
    expect(cutoff).toBeLessThan(Math.max(field.max, -field.min));
    expect(reach, `${target.id} must reach past the nucleus`).toBeGreaterThan(
      0,
    );
  }
});

test('the cutoff is a quantile, so it follows the amplitude scale exactly', () => {
  const { data } = sampleAtomicOrbital(orbital('C', '2pz'), {
    resolution: 32,
  });
  const cutoff = isocontourCutoff(data);
  const scaled = new Float32Array(data.length);
  for (let index = data.length - 1; index >= 0; index--) {
    scaled[index] = (data[index] as number) * 1e-6;
  }

  expect(isocontourCutoff(scaled) / cutoff).toBeCloseTo(1e-6, 12);
});

test('a field with no amplitude has no surface', () => {
  expect(isocontourCutoff(new Float32Array(64))).toBe(0);
  expect(isocontourCutoff(new Float32Array(0))).toBe(0);
});

test('the enclosed weight has to be a fraction', () => {
  const data = new Float32Array([1, 2, 3]);

  expect(() => isocontourCutoff(data, 0)).toThrow(/enclosed weight/);
  expect(() => isocontourCutoff(data, 1)).toThrow(/enclosed weight/);
});

test('the reach measures the outermost enclosed sample from the centre', () => {
  // A 3×3×3 box of side 2 Å: only the centre of the +x face is above cutoff,
  // so the reach is exactly one spacing.
  const data = new Float32Array(27);
  const field: OrbitalGrid = {
    data,
    dimensions: [3, 3, 3],
    origin: { x: -1, y: -1, z: -1 },
    spacing: 1,
    min: 0,
    max: 0,
    mean: 0,
    sigma: 0,
  };

  expect(enclosedReach(field, 0.5)).toBe(0);

  // (x, y, z) = (2, 1, 1), z fastest: 2·9 + 1·3 + 1.
  data[22] = 1;

  expect(enclosedReach(field, 0.5)).toBeCloseTo(1, 12);

  // The far corner (2, 2, 2) sits at √3 spacings.
  data[26] = -1;

  expect(enclosedReach(field, 0.5)).toBeCloseTo(Math.sqrt(3), 12);

  // Nothing is enclosed once the cutoff is above every sample.
  expect(enclosedReach(field, 2)).toBe(0);
  expect(enclosedReach(field, 0)).toBe(0);
});
