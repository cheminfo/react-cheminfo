/**
 * Hydrogen-like atomic orbitals: the exact one-electron solutions, scaled to an
 * element by an effective nuclear charge.
 *
 * `R(r) = N (2Zr/na₀)^ℓ e^(−Zr/na₀) L^(2ℓ+1)_(n−ℓ−1)(2Zr/na₀)`
 *
 * The associated Laguerre polynomial is the whole point. The Slater orbital a
 * hybridisation model uses is `r^(n−1) e^(−ζr)`, which is **nodeless**: it draws
 * a 2s exactly like a 1s, only fatter. That is fine for a hybrid lobe, where
 * only the outer contour is ever seen, and wrong for a picture whose subject is
 * what an orbital looks like — `n − ℓ − 1` radial nodes and ℓ angular ones is
 * the first thing a student is asked to count.
 *
 * Amplitudes are in Å^(-3/2) and distances in ångström, like everything else
 * here, so `∫|ψ|² dV` over a grid measured in ångström is 1.
 */

import { BOHR_IN_ANGSTROM, RYDBERG_ELECTRONVOLTS } from './constants.ts';
import {
  assertQuantumNumbers,
  bisectRoot,
  factorial,
  laguerre,
} from './numerics.ts';

/** Which hydrogen-like orbital, and how strongly it is bound. */
export interface HydrogenicParameters {
  /** Principal quantum number, 1 and up. */
  n: number;
  /** Angular momentum quantum number, 0 to n − 1. */
  l: number;
  /** Effective nuclear charge, in units of the elementary charge. */
  charge: number;
}

/**
 * Radial nodes: spheres on which the wavefunction vanishes and changes sign.
 * @param parameters - Which orbital.
 * @returns `n − ℓ − 1`.
 */
export function radialNodeCount(parameters: HydrogenicParameters): number {
  return parameters.n - parameters.l - 1;
}

/**
 * Mean distance of the electron from the nucleus,
 * `⟨r⟩ = a₀(3n² − ℓ(ℓ+1)) / 2Z`.
 * @param parameters - Which orbital.
 * @returns The expectation value in ångström.
 */
export function meanRadius(parameters: HydrogenicParameters): number {
  const { n, l, charge } = parameters;
  return (
    (BOHR_IN_ANGSTROM * (3 * n * n - l * (l + 1))) /
    (2 * Math.max(charge, 1e-6))
  );
}

/**
 * Orbital energy in the hydrogen-like model, `E = −13.6 Z²/n²` eV.
 * @param parameters - Which orbital.
 * @returns The energy in electronvolts, always negative.
 */
export function orbitalEnergy(parameters: HydrogenicParameters): number {
  const { n, charge } = parameters;
  return (-RYDBERG_ELECTRONVOLTS * charge * charge) / (n * n);
}

/**
 * Build the radial function `R(r)`, with every constant hoisted out so a grid
 * sweep pays for the exponential and the polynomial only.
 * @param parameters - Which orbital.
 * @returns A function taking a distance in ångström and returning Å^(-3/2).
 * @throws {Error} When the quantum numbers are not a real orbital, i.e. `n < 1` or
 * `ℓ` outside `0 … n − 1`, or when the charge is not positive.
 */
export function createRadialFunction(
  parameters: HydrogenicParameters,
): (distance: number) => number {
  const { n, l, charge } = parameters;
  assertQuantumNumbers(n, l);
  if (!(charge > 0)) {
    throw new RangeError(
      `the effective charge must be positive, got ${charge}`,
    );
  }
  const degree = n - l - 1;
  const alpha = 2 * l + 1;
  // ρ = 2Zr/(n a₀), with r in ångström, so a₀ appears once here and never again.
  const rho = (2 * charge) / (n * BOHR_IN_ANGSTROM);
  const normalisation = Math.sqrt(
    rho * rho * rho * (factorial(degree) / (2 * n * factorial(n + l))),
  );
  return (distance) => {
    const scaled = rho * distance;
    return (
      normalisation *
      scaled ** l *
      Math.exp(-scaled / 2) *
      laguerre(degree, alpha, scaled)
    );
  };
}

/**
 * Evaluate the radial function once.
 * @param parameters - Which orbital.
 * @param distance - Distance from the nucleus, ångström.
 * @returns The radial amplitude, Å^(-3/2).
 */
export function radialAmplitude(
  parameters: HydrogenicParameters,
  distance: number,
): number {
  return createRadialFunction(parameters)(distance);
}

/**
 * Where the radial nodes actually are.
 *
 * The `n − ℓ − 1` roots are bracketed by scanning outwards and then bisected,
 * rather than solved for, because the Laguerre roots have no closed form past
 * the quadratic and a bisection on a function we already evaluate cannot drift
 * out of step with what is drawn.
 * @param parameters - Which orbital.
 * @param limit - Distance to search out to, ångström. Defaults to a box that
 * comfortably holds the outermost node.
 * @returns The node radii in ångström, ascending; empty for a nodeless orbital.
 */
export function radialNodeRadii(
  parameters: HydrogenicParameters,
  limit = meanRadius(parameters) * 3,
): number[] {
  const expected = radialNodeCount(parameters);
  if (expected === 0) return [];
  const radial = createRadialFunction(parameters);
  const radii: number[] = [];
  const steps = 4000;
  let previousDistance = 1e-6;
  let previous = radial(previousDistance);
  for (let step = 1; step <= steps; step++) {
    const distance = (limit * step) / steps;
    const value = radial(distance);
    if (previous === 0 || previous < 0 !== value < 0) {
      radii.push(bisectRoot(radial, previousDistance, distance));
      if (radii.length === expected) break;
    }
    previousDistance = distance;
    previous = value;
  }
  return radii;
}

/**
 * Smallest sphere holding a given share of the electron.
 *
 * Used to size the sampling box: too small clips the orbital at a face, too
 * large wastes the grid on empty space, and both are visible on screen.
 * @param parameters - Which orbital.
 * @param fraction - Share of `∫ r²R² dr` to enclose, between 0 and 1.
 * @returns The radius in ångström.
 * @throws {Error} When `fraction` is outside `(0, 1)`.
 */
export function enclosingRadius(
  parameters: HydrogenicParameters,
  fraction: number,
): number {
  if (!(fraction > 0) || fraction >= 1) {
    throw new RangeError(`the enclosed fraction must be in (0, 1)`);
  }
  const radial = createRadialFunction(parameters);
  // The tail decays as e^(−2Zr/n a₀); ten mean radii is far past every node.
  const limit = meanRadius(parameters) * 10;
  const steps = 4000;
  const step = limit / steps;
  const weights = new Float64Array(steps + 1);
  let total = 0;
  for (let index = 0; index <= steps; index++) {
    const distance = index * step;
    const value = radial(distance);
    const weight = value * value * distance * distance;
    weights[index] = weight;
    total += weight;
  }
  if (total === 0) return limit;
  let running = 0;
  const target = total * fraction;
  for (let index = 0; index <= steps; index++) {
    running += weights[index] as number;
    if (running >= target) return index * step;
  }
  return limit;
}

/**
 * Sample the radial distribution `P(r) = r²R(r)²` — the curve whose zeroes are
 * the radial nodes and whose area is the electron.
 * @param parameters - Which orbital.
 * @param limit - Distance to sample out to, ångström.
 * @param count - Number of samples, at least 2.
 * @returns Distances and the amplitude `R`, plus `P`, at each of them.
 * @throws {Error} When `count` is below 2.
 */
export function radialProfile(
  parameters: HydrogenicParameters,
  limit: number,
  count: number,
): { distances: Float64Array; amplitude: Float64Array; density: Float64Array } {
  if (count < 2) throw new RangeError('a radial profile needs 2 samples');
  const radial = createRadialFunction(parameters);
  const distances = new Float64Array(count);
  const amplitude = new Float64Array(count);
  const density = new Float64Array(count);
  for (let index = 0; index < count; index++) {
    const distance = (limit * index) / (count - 1);
    const value = radial(distance);
    distances[index] = distance;
    amplitude[index] = value;
    density[index] = value * value * distance * distance;
  }
  return { distances, amplitude, density };
}
