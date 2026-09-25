/**
 * A geometry a relaxer is handed: element symbols plus flat Cartesian
 * coordinates in ångström, `x,y,z` per atom.
 */
export interface RelaxableGeometry {
  /** Element symbol per atom, explicit hydrogens included. */
  elements: string[];
  /** Flat `x,y,z` per atom in ångström, length `3 · elements.length`. */
  coordinates: Float64Array;
}

/** What a relaxer reports for one structure. */
export interface RelaxedGeometry {
  /**
   * The relaxed coordinates, in the input's atom order. Translated freely;
   * never rotated, which is what lets {@link RelaxedGeometry} be compared with
   * the geometry it came from by removing both centroids.
   */
  coordinates: Float64Array;
  /**
   * Total energy at `coordinates`, **in kcal/mol**, so it can be read against a
   * force-field energy without a second unit in the UI.
   */
  energy: number;
  /**
   * The dispersion term of `energy`, kcal/mol, or `null` from a method that has
   * none. It is the part a force field of the MMFF94 era does not model at all,
   * and a large part of why conformers re-rank.
   * @default null
   */
  dispersionEnergy: number | null;
  /** Optimizer cycles spent. `0` when there was nothing to relax. */
  cycles: number;
  /** Whether the optimizer met its convergence criteria. */
  converged: boolean;
  /** Plain sentences about anything the caller should know. */
  warnings: string[];
}

/** How a relaxation run is watched and cancelled. */
export interface RelaxerOptions {
  /**
   * Called as each structure finishes, so a caller can show progress over a
   * batch that runs for seconds.
   * @default undefined
   */
  onSettled?: (done: number, total: number) => void;
  /**
   * Gives the run up. A relaxer is not obliged to be able to interrupt a
   * structure already in flight.
   * @default undefined
   */
  signal?: AbortSignal;
}

/**
 * Something that relaxes geometries with a real electronic structure behind it,
 * and reports the energy **at the geometry it returns**.
 *
 * This is the seam between a site and the semi-empirical engine: nothing in
 * `react-cheminfo/core` imports one, so a site that never refines a geometry
 * downloads no WebAssembly. `xtbRelaxer` from `react-cheminfo/xtb` is the
 * implementation, GFN2-xTB through `xtb-wasm`.
 *
 * An implementation must return one result per request, in request order, and
 * must keep each structure's atom order.
 */
export type GeometryRelaxer = (
  geometries: readonly RelaxableGeometry[],
  options?: RelaxerOptions,
) => Promise<RelaxedGeometry[]>;
