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
import {
  createRadialFunction,
  enclosingRadius,
  radialNodeRadii,
} from './hydrogenic.ts';

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

/** How finely one orbital may be sampled, whatever its shape asks for. */
export interface ResolutionLimits {
  /** Samples per edge no orbital drops below. */
  floor: number;
  /** Samples per edge no orbital exceeds. */
  cap: number;
}

/**
 * How finely this particular orbital has to be sampled.
 *
 * One resolution for a whole periodic table draws the nested orbitals badly.
 * The box is sized by the outermost lobe, but a `4p` also has to separate two
 * inner shells packed against the nucleus, and at 56 samples per edge xenon's
 * innermost 4p lobe spans **6.6 voxels** while the outer one spans 41 — the
 * inner shells come out as lumps and the outer surface visibly faceted. What
 * sets the requirement is therefore the ratio between the box and the smallest
 * feature in it, not the orbital's size, which is why a nodeless orbital
 * (every `1s`, `2p`, `3d`, `4f`) stays on the floor and costs nothing extra.
 *
 * The cap is not a budget cheat: the innermost lobe of caesium's `7s` would
 * need 858 samples per edge, and no uniform grid the browser can afford
 * resolves it. Those orbitals are drawn as well as the cap allows.
 * @param orbital - The orbital to draw.
 * @param limits - See {@link ResolutionLimits}.
 * @returns Samples along each edge of the cube.
 */
export function atomicGridResolution(
  orbital: AtomicOrbital,
  limits: ResolutionLimits,
): number {
  const { floor, cap } = limits;
  const parameters = hydrogenicParametersOf(orbital);
  const innermost = radialNodeRadii(parameters)[0];
  if (innermost === undefined || !(innermost > 0)) return Math.min(floor, cap);
  const half = atomicGridBox(orbital).size.x / 2;
  // The samples span the box edge to edge, so `resolution - 1` of them cover
  // it: a lobe of radius r gets `r (resolution - 1) / half` across its diameter.
  const needed = Math.ceil((INNER_LOBE_SAMPLES * half) / innermost) + 1;
  return Math.min(cap, Math.max(floor, needed));
}

/** Samples per edge; the cost is the cube of it. */
const DEFAULT_RESOLUTION = 56;

/**
 * Samples the innermost radial lobe is asked to span, edge to edge. Below
 * about eight, marching cubes turns a sphere into a faceted blob.
 */
const INNER_LOBE_SAMPLES = 12;

/** A tail past this holds too little density to change the surface. */
const DEFAULT_ENCLOSED_FRACTION = 0.985;

/** Room for the surface to close before the box ends. */
const DEFAULT_PADDING = 1.15;
