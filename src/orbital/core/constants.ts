/**
 * The two physical constants the orbital maths is written in, and the units
 * everything else here follows.
 *
 * Distances are **ångström** and amplitudes **Å^(-3/2)** throughout, so
 * `∫|ψ|² dV` over a grid measured in ångström is one and nothing has to be
 * converted on the way to a renderer. The Bohr radius therefore appears exactly
 * once, in `hydrogenic.ts`.
 */

/** The Bohr radius in ångström (CODATA 2018). */
export const BOHR_IN_ANGSTROM = 0.529_177_210_903;

/** One rydberg in electronvolts (CODATA 2018). */
export const RYDBERG_ELECTRONVOLTS = 13.605_693_122_994;

/**
 * Share of an orbital's weight the default isosurface encloses.
 *
 * 0.85 is the contour a textbook draws: tight enough that the lobes are
 * separate shapes, loose enough that the outer one of a 3s is still there.
 */
export const ENCLOSED_WEIGHT = 0.85;

/**
 * A point in space, ångström.
 *
 * Declared here rather than taken from a geometry package: three numbers are
 * not worth a dependency, and this one crosses a worker boundary as a plain
 * object.
 */
export interface Vec3 {
  x: number;
  y: number;
  z: number;
}
