import { expect, test } from 'vitest';

import { atomicOrbitalsOf, defaultOrbitalId } from '../atomicOrbitals.ts';
import { runAtomicSample, sampleInProcess } from '../sample.ts';

test('a request names an element and an orbital, and gets back a field', () => {
  const result = runAtomicSample({
    atomicNumber: 6,
    orbitalId: '2pz',
    resolution: 24,
  });

  expect(result.grid.dimensions).toStrictEqual([24, 24, 24]);
  expect(result.grid.data).toHaveLength(24 ** 3);
  // A 2p has no radial node, and both phases are present.
  expect(result.nodeRadii).toStrictEqual([]);
  expect(result.grid.min).toBeLessThan(0);
  expect(result.grid.max).toBeGreaterThan(0);
});

test('the field comes back with the isovalue its surfaces are drawn at', () => {
  const result = runAtomicSample({
    atomicNumber: 55,
    orbitalId: '6s',
    resolution: 32,
  });

  // Caesium's 6s is the diffuse case molstar's own helper abandons.
  expect(result.contour.cutoff).toBeGreaterThan(0);
  expect(result.contour.cutoff).toBeLessThan(result.grid.max);
  expect(result.contour.reach).toBeGreaterThan(0);
});

test('a pair of limits lets the orbital pick its own resolution', () => {
  const limits = { floor: 24, cap: 64 };
  // A 2p has no radial node, so nothing asks for more than the floor.
  const nodeless = runAtomicSample({
    atomicNumber: 6,
    orbitalId: '2pz',
    resolution: limits,
  });

  expect(nodeless.grid.dimensions).toStrictEqual([24, 24, 24]);

  // Xenon's 4p hides two inner shells against the nucleus and is refined.
  const nested = runAtomicSample({
    atomicNumber: 54,
    orbitalId: '4py',
    resolution: limits,
  });

  expect(nested.grid.dimensions).toStrictEqual([64, 64, 64]);
});

test('a 3s reports its two radial nodes, ascending', () => {
  const result = runAtomicSample({
    atomicNumber: 11,
    orbitalId: '3s',
    resolution: 16,
  });

  expect(result.nodeRadii).toHaveLength(2);
  expect(result.nodeRadii[0]).toBeLessThan(result.nodeRadii[1] ?? 0);
});

test('an unknown orbital says which ones the element has', () => {
  expect(() =>
    runAtomicSample({ atomicNumber: 2, orbitalId: '9z', resolution: 8 }),
  ).toThrow(/Element 2 has no orbital 9z\. Known: /);
});

test('an atomic number outside the table is refused', () => {
  expect(() => runAtomicSample({ atomicNumber: 200, orbitalId: '1s' })).toThrow(
    'no element with atomic number 200',
  );
});

test('the default orbital of an element can always be sampled', async () => {
  const sampled = await Promise.all(
    [1, 6, 26, 92].map((atomicNumber) => {
      const orbitalId = defaultOrbitalId(atomicOrbitalsOf(atomicNumber));

      expect(orbitalId).not.toBeNull();

      return sampleInProcess({
        atomicNumber,
        orbitalId: orbitalId as string,
        resolution: 12,
      });
    }),
  );

  for (const result of sampled) {
    expect(result.grid.data.length).toBeGreaterThan(0);
  }
});
