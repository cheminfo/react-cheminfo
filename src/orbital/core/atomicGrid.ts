/**
 * Sampling one atomic orbital onto the scalar field the isosurface renderer
 * consumes.
 *
 * The box is sized from the orbital itself rather than fixed: a 1s on fluorine
 * and a 4f on caesium differ by more than an order of magnitude in extent, and a
 * box that suits one either buries the other in empty space or slices its lobes
 * off at a face. {@link enclosingRadius} gives the sphere holding almost all of
 * the electron, and the cube is drawn around that.
 *
 * Pure: no React, no molstar. `src/viewer` turns the returned field into a
 * surface, and the worker calls this off the main thread.
 */

import type { AtomicOrbital } from './atomicOrbitals.ts';
import { hydrogenicParametersOf } from './atomicOrbitals.ts';
import type { GridBox, OrbitalEvaluator, OrbitalGrid } from './grid.ts';
import { evaluateGrid } from './grid.ts';
import { createRadialFunction, enclosingRadius } from './hydrogenic.ts';

/** How finely, and how far out, an orbital is sampled. */
export interface AtomicGridOptions {
  /**
   * Samples along each edge of the cube. The cost is the cube of this, and 56
   * resolves the radial node of a 3s while staying near 30 ms.
   * @default 56
   */
  resolution?: number;
  /**
   * Share of `∫ r²R² dr` the box must contain before padding.
   * @default 0.985
   */
  enclosedFraction?: number;
  /**
   * Multiplier applied to the enclosing radius, so the surface closes inside
   * the box instead of touching a face.
   * @default 1.15
   */
  padding?: number;
}

/**
 * Sample an atomic orbital onto a cubic grid centred on its nucleus.
 * @param orbital - The orbital to draw.
 * @param options - See {@link AtomicGridOptions}.
 * @returns The signed field, its layout and its statistics.
 * @throws {Error} When the resolution is below 2.
 */
export function sampleAtomicOrbital(
  orbital: AtomicOrbital,
  options: AtomicGridOptions = {},
): OrbitalGrid {
  const {
    resolution = DEFAULT_RESOLUTION,
    enclosedFraction = DEFAULT_ENCLOSED_FRACTION,
    padding = DEFAULT_PADDING,
  } = options;
  return evaluateGrid(
    createAtomicOrbitalEvaluator(orbital),
    atomicGridBox(orbital, enclosedFraction, padding),
    resolution,
  );
}

/**
 * Build `ψ(x, y, z) = R(r) Y(x, y, z)` for one orbital, centred on the origin.
 * @param orbital - The orbital to evaluate.
 * @returns An allocation-free evaluator in ångström, returning Å^(-3/2).
 */
export function createAtomicOrbitalEvaluator(
  orbital: AtomicOrbital,
): OrbitalEvaluator {
  const radial = createRadialFunction(hydrogenicParametersOf(orbital));
  const angular = orbital.harmonic.evaluate;
  // Every ℓ > 0 harmonic divides by the radius, and the nucleus is a grid point
  // whenever the resolution is odd, so the singularity is real and is answered
  // here: only an s orbital has amplitude at r = 0.
  const atNucleus = orbital.l === 0 ? radial(0) * angular(0, 0, 0, 1) : 0;
  return (x, y, z) => {
    const squared = x * x + y * y + z * z;
    if (squared === 0) return atNucleus;
    const radius = Math.sqrt(squared);
    return radial(radius) * angular(x, y, z, radius);
  };
}

/**
 * The cube one orbital is sampled over.
 * @param orbital - The orbital to fit.
 * @param enclosedFraction - Share of the electron to contain.
 * @param padding - Multiplier applied to the enclosing radius.
 * @returns A cube centred on the nucleus.
 */
export function atomicGridBox(
  orbital: AtomicOrbital,
  enclosedFraction = DEFAULT_ENCLOSED_FRACTION,
  padding = DEFAULT_PADDING,
): GridBox {
  const half =
    enclosingRadius(hydrogenicParametersOf(orbital), enclosedFraction) *
    padding;
  return {
    origin: { x: -half, y: -half, z: -half },
    size: { x: 2 * half, y: 2 * half, z: 2 * half },
  };
}

/** Samples per edge; the cost is the cube of it. */
const DEFAULT_RESOLUTION = 56;

/** A tail past this holds too little density to change the surface. */
const DEFAULT_ENCLOSED_FRACTION = 0.985;

/** Room for the surface to close before the box ends. */
const DEFAULT_PADDING = 1.15;
