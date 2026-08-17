/**
 * The one job the viewer asks for, shaped so it can cross a worker boundary.
 *
 * The request carries an atomic number and an orbital id, never an
 * `AtomicOrbital`: that object holds its spherical harmonic as a
 * function*, which the structured clone algorithm cannot copy. Rebuilding the
 * list from two plain values costs microseconds and keeps the boundary honest.
 *
 * A site that would rather not spend ~25 ms of its main thread per orbital
 * implements this contract in a worker and hands `AtomicOrbitalViewer` the
 * `sample` prop; one that does not gets the in-process version for free.
 */

import type { AtomicGridOptions, ResolutionLimits } from './atomicGrid.ts';
import { atomicGridResolution, sampleAtomicOrbital } from './atomicGrid.ts';
import {
  atomicOrbitalsOf,
  findAtomicOrbital,
  hydrogenicParametersOf,
} from './atomicOrbitals.ts';
import type { OrbitalGrid } from './grid.ts';
import { radialNodeRadii } from './hydrogenic.ts';
import type { OrbitalContour } from './isovalue.ts';
import { orbitalContour } from './isovalue.ts';

/** Which orbital to sample, and how finely. */
export interface AtomicSampleRequest {
  /** Proton count, 1 to 118. */
  atomicNumber: number;
  /** Which orbital of that element, e.g. `3dz2`. */
  orbitalId: string;
  /**
   * Samples along each edge of the cube. The cost is the cube of this.
   *
   * A number fixes the resolution. {@link ResolutionLimits} lets the orbital's
   * own shape pick one between the two, which is what a nested orbital needs —
   * see {@link atomicGridResolution}.
   * @default 56
   */
  resolution?: number | ResolutionLimits;
}

/** What one sampling job produces. */
export interface AtomicSampleResult {
  /** The signed field, ready for an isosurface. */
  grid: OrbitalGrid;
  /**
   * The isovalue both phases are drawn at, and how far the pair reaches.
   *
   * Measured here rather than beside the renderer: both passes are O(samples),
   * and at the resolutions a nested orbital asks for that is over a million of
   * them on whichever thread runs this.
   */
  contour: OrbitalContour;
  /** Radii of the orbital's radial nodes, ångström, ascending. */
  nodeRadii: number[];
}

/**
 * Sample one atomic orbital onto a grid.
 *
 * Synchronous and free of React, molstar and the DOM, so it runs unchanged on
 * the main thread, in a worker, and under vitest.
 * @param request - See {@link AtomicSampleRequest}.
 * @returns The field, and where its radial nodes are.
 * @throws {Error} When the element or the orbital id names nothing.
 */
export function runAtomicSample(
  request: AtomicSampleRequest,
): AtomicSampleResult {
  const { atomicNumber, orbitalId, resolution } = request;
  const orbitals = atomicOrbitalsOf(atomicNumber);
  const orbital = findAtomicOrbital(orbitals, orbitalId);
  if (orbital === null) {
    throw new Error(
      `Element ${atomicNumber} has no orbital ${orbitalId}. Known: ${orbitals
        .map((entry) => entry.id)
        .join(', ')}.`,
    );
  }
  const options: AtomicGridOptions = {};
  if (typeof resolution === 'number') {
    options.resolution = resolution;
  } else if (resolution !== undefined) {
    options.resolution = atomicGridResolution(orbital, resolution);
  }
  const grid = sampleAtomicOrbital(orbital, options);
  return {
    grid,
    contour: orbitalContour(grid),
    nodeRadii: radialNodeRadii(hydrogenicParametersOf(orbital)),
  };
}

/** How a caller supplies the sampling — in process, or through a worker. */
export type AtomicSampler = (
  request: AtomicSampleRequest,
) => Promise<AtomicSampleResult>;

/**
 * The default sampler: {@link runAtomicSample}, yielded to the event loop so
 * the spinner has painted before the main thread is taken.
 * @param request - See {@link AtomicSampleRequest}.
 * @returns The field, and where its radial nodes are.
 */
export const sampleInProcess: AtomicSampler = async (request) => {
  await new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
  return runAtomicSample(request);
};
