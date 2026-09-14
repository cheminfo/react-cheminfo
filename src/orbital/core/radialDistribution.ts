/**
 * The radial distribution of one orbital, sampled once for a plot: the curve,
 * the amplitude behind it, where it peaks, and where its nodes are.
 *
 * A plot, its caption and its accessible label all read the same record, so
 * the number a sentence quotes is the number the curve was drawn from.
 */

import type { HydrogenicParameters } from './hydrogenic.ts';
import {
  enclosingRadius,
  radialNodeRadii,
  radialProfile,
} from './hydrogenic.ts';

/** How finely, and how far out, the distribution is sampled. */
export interface RadialDistributionOptions {
  /**
   * Samples between the nucleus and the end of the range, at least 2.
   * @default 600
   */
  samples?: number;
  /**
   * Share of the electron the sampled range must hold, between 0 and 1. The
   * range is then widened by a tenth, so the tail is seen flattening out.
   * @default 0.995
   */
  enclosed?: number;
}

/** One orbital's radial distribution, as a plot reads it. */
export interface RadialDistribution {
  /** Distance of every sample from the nucleus, ångström, from 0 to `limit`. */
  distances: Float64Array;
  /** The radial function `R(r)` at each sample, Å^(-3/2), signed. */
  amplitude: Float64Array;
  /** The radial distribution `r²R(r)²` at each sample, Å⁻¹. */
  density: Float64Array;
  /** Where the sampled range ends, ångström. */
  limit: number;
  /** The largest value of `density`. */
  peakDensity: number;
  /** The largest magnitude of `amplitude`. */
  peakAmplitude: number;
  /** The sampled distance at which `density` peaks, ångström. */
  peakDistance: number;
  /** The radii of the radial nodes, ångström, ascending. */
  nodeRadii: number[];
}

/** How much the range is widened past the enclosing sphere. */
const RANGE_MARGIN = 1.1;

/**
 * Sample the radial distribution of an orbital over the range that holds it.
 * @param parameters - Which orbital, and how strongly it is bound.
 * @param options - See {@link RadialDistributionOptions}.
 * @returns The samples, their extremes and the node radii.
 * @throws {Error} When the quantum numbers are not a real orbital, the charge
 * is not positive, `enclosed` is outside `(0, 1)` or `samples` is below 2.
 */
export function radialDistribution(
  parameters: HydrogenicParameters,
  options: RadialDistributionOptions = {},
): RadialDistribution {
  const { samples = 600, enclosed = 0.995 } = options;
  const limit = enclosingRadius(parameters, enclosed) * RANGE_MARGIN;
  const { distances, amplitude, density } = radialProfile(
    parameters,
    limit,
    samples,
  );

  let peakDensity = 0;
  let peakDistance = 0;
  let peakAmplitude = 0;
  for (let index = 0; index < samples; index++) {
    const value = density[index] as number;
    if (value > peakDensity) {
      peakDensity = value;
      peakDistance = distances[index] as number;
    }
    const magnitude = Math.abs(amplitude[index] as number);
    if (magnitude > peakAmplitude) peakAmplitude = magnitude;
  }

  return {
    distances,
    amplitude,
    density,
    limit,
    peakDensity,
    peakAmplitude,
    peakDistance,
    nodeRadii: radialNodeRadii(parameters, limit),
  };
}
