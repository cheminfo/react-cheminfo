import { expect, test } from 'vitest';

import type { RealHarmonic } from '../realHarmonics.ts';
import {
  REAL_HARMONICS,
  harmonicsOf,
  subshellLetter,
} from '../realHarmonics.ts';

const POLAR_STEPS = 900;
const AZIMUTH_STEPS = 900;

/**
 * Every harmonic of every shell, flattened.
 * @returns All twenty-five of them, s through f.
 */
function allHarmonics(): RealHarmonic[] {
  return REAL_HARMONICS.flat();
}

/**
 * `∫ f g dΩ` over the unit sphere by the midpoint rule in `cos θ` and `φ`,
 * which is spectrally accurate in `φ` and second order in `cos θ`.
 * @param first - One harmonic.
 * @param second - The other.
 * @returns The integral of `Y₁Y₂` over the unit sphere.
 */
function sphereIntegral(first: RealHarmonic, second: RealHarmonic): number {
  let total = 0;
  for (let polar = 0; polar < POLAR_STEPS; polar++) {
    const cosine = -1 + (2 * (polar + 0.5)) / POLAR_STEPS;
    const sine = Math.sqrt(Math.max(0, 1 - cosine * cosine));
    for (let azimuth = 0; azimuth < AZIMUTH_STEPS; azimuth++) {
      const angle = (2 * Math.PI * (azimuth + 0.5)) / AZIMUTH_STEPS;
      const x = sine * Math.cos(angle);
      const y = sine * Math.sin(angle);
      total +=
        first.evaluate(x, y, cosine, 1) * second.evaluate(x, y, cosine, 1);
    }
  }
  return (total * 2 * (2 * Math.PI)) / (POLAR_STEPS * AZIMUTH_STEPS);
}

test('the four shells carry 1, 3, 5 and 7 harmonics', () => {
  expect(REAL_HARMONICS.map((shell) => shell.length)).toStrictEqual([
    1, 3, 5, 7,
  ]);
  expect(allHarmonics()).toHaveLength(16);
});

test('every harmonic is normalised over the sphere', () => {
  for (const harmonic of allHarmonics()) {
    expect(sphereIntegral(harmonic, harmonic)).toBeCloseTo(1, 4);
  }
});

test('harmonics of the same shell are mutually orthogonal', () => {
  for (const shell of REAL_HARMONICS) {
    for (let first = 0; first < shell.length; first++) {
      for (let second = first + 1; second < shell.length; second++) {
        const overlap = sphereIntegral(
          shell[first] as RealHarmonic,
          shell[second] as RealHarmonic,
        );

        expect(Math.abs(overlap)).toBeLessThan(1e-4);
      }
    }
  }
});

test('harmonics of different shells are orthogonal too', () => {
  const s = harmonicsOf(0)[0] as RealHarmonic;
  const pz = harmonicsOf(1)[2] as RealHarmonic;
  const dz2 = harmonicsOf(2)[0] as RealHarmonic;
  const fz3 = harmonicsOf(3)[0] as RealHarmonic;

  expect(Math.abs(sphereIntegral(s, dz2))).toBeLessThan(1e-4);
  expect(Math.abs(sphereIntegral(pz, fz3))).toBeLessThan(1e-4);
  expect(Math.abs(sphereIntegral(s, pz))).toBeLessThan(1e-4);
});

test('p and d harmonics point where their names say', () => {
  const [px, py, pz] = harmonicsOf(1) as [
    RealHarmonic,
    RealHarmonic,
    RealHarmonic,
  ];

  expect(px.evaluate(1, 0, 0, 1)).toBeGreaterThan(0);
  expect(px.evaluate(-1, 0, 0, 1)).toBeLessThan(0);
  expect(px.evaluate(0, 1, 0, 1)).toBeCloseTo(0, 12);
  expect(py.evaluate(0, 1, 0, 1)).toBeGreaterThan(0);
  expect(pz.evaluate(0, 0, 1, 1)).toBeGreaterThan(0);

  const dz2 = harmonicsOf(2)[0] as RealHarmonic;

  // Positive along z, negative in the xy plane: the doughnut has the other sign.
  expect(dz2.evaluate(0, 0, 1, 1)).toBeGreaterThan(0);
  expect(dz2.evaluate(1, 0, 0, 1)).toBeLessThan(0);

  const dxy = harmonicsOf(2)[3] as RealHarmonic;
  const diagonal = Math.SQRT1_2;

  expect(dxy.evaluate(diagonal, diagonal, 0, 1)).toBeGreaterThan(0);
  expect(dxy.evaluate(-diagonal, diagonal, 0, 1)).toBeLessThan(0);
  // The lobes lie between the axes, so dxy vanishes on both of them.
  expect(dxy.evaluate(1, 0, 0, 1)).toBeCloseTo(0, 12);
  expect(dxy.evaluate(0, 1, 0, 1)).toBeCloseTo(0, 12);
});

test('the x²−y² lobes sit on the axes, opposite in sign', () => {
  const dx2y2 = harmonicsOf(2)[4] as RealHarmonic;

  expect(dx2y2.evaluate(1, 0, 0, 1)).toBeGreaterThan(0);
  expect(dx2y2.evaluate(0, 1, 0, 1)).toBeLessThan(0);
  expect(dx2y2.evaluate(1, 0, 0, 1)).toBeCloseTo(
    -dx2y2.evaluate(0, 1, 0, 1),
    12,
  );
});

test('the f_xyz harmonic has eight alternating lobes', () => {
  const fxyz = harmonicsOf(3)[3] as RealHarmonic;
  const corner = 1 / Math.sqrt(3);
  const signs: number[] = [];
  for (const x of [corner, -corner]) {
    for (const y of [corner, -corner]) {
      for (const z of [corner, -corner]) {
        signs.push(Math.sign(fxyz.evaluate(x, y, z, 1)));
      }
    }
  }

  expect(signs.filter((sign) => sign > 0)).toHaveLength(4);
  expect(signs.filter((sign) => sign < 0)).toHaveLength(4);
});

test('orbital ids are unique and url-safe', () => {
  const ids = new Set<string>();
  for (let l = 0; l < REAL_HARMONICS.length; l++) {
    for (const harmonic of harmonicsOf(l)) {
      const id = `2${subshellLetter(l)}${harmonic.key}`;

      expect(ids.has(id)).toBe(false);

      ids.add(id);

      expect(id).toMatch(/^[\w-]+$/);
      expect(harmonic.l).toBe(l);
    }
  }

  expect(ids.size).toBe(16);
});

test('the subshell letters are s, p, d and f', () => {
  expect([0, 1, 2, 3].map(subshellLetter)).toStrictEqual(['s', 'p', 'd', 'f']);
  expect(() => subshellLetter(4)).toThrow(/no subshell letter/);
  expect(() => harmonicsOf(4)).toThrow(/no real harmonics/);
});
