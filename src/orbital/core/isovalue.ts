/**
 * Choosing the value a signed wavefunction's isosurface is drawn at.
 *
 * The surface is named by how much of the electron it holds, not by an
 * amplitude: `ENCLOSED_WEIGHT` of `∫|ψ|² dV` inside it and the tail
 * outside. On a uniform grid that is a weighted quantile of the samples, and
 * the isovalue is the `|ψ|` at which the quantile falls.
 *
 * molstar ships `computeOrbitalIsocontourValues` for the same job, and it
 * cannot be used here. It abandons any field whose mean `ψ²` is under an
 * absolute `1e-5` and returns no isovalue at all — a guard against degenerate
 * data that instead reads the amplitude *scale*. Amplitudes are Å^(-3/2), so a
 * diffuse orbital is normalised straight into that range and draws nothing:
 * caesium's 6s reaches 13 Å, and 2588 of the 7460 orbitals lcao.cheminfo.org
 * offers came back blank. A quantile has no scale of its own and cannot.
 *
 * Every pass below touches each of the million-odd samples, so all of them are
 * indexed loops: `for…of` over a `Float32Array` measures 6.7× slower.
 */

import { ENCLOSED_WEIGHT } from './constants.ts';
import type { OrbitalGrid } from './grid.ts';

/**
 * The `|ψ|` whose surface encloses a given share of the sampled electron.
 * @param data - The sampled amplitudes.
 * @param enclosedWeight - Share of `∑ψ²` to hold inside, between 0 and 1.
 * @returns The isovalue, or 0 when the field is empty — a nodeless orbital
 * sampled where it has no amplitude at all.
 * @throws {Error} When `enclosedWeight` is outside `(0, 1)`.
 */
export function isocontourCutoff(
  data: Float32Array,
  enclosedWeight: number = ENCLOSED_WEIGHT,
): number {
  if (!(enclosedWeight > 0) || enclosedWeight >= 1) {
    throw new RangeError('the enclosed weight must be in (0, 1)');
  }
  let total = 0;
  let peak = 0;
  for (let index = data.length - 1; index >= 0; index--) {
    const value = data[index] as number;
    const weight = value * value;
    total += weight;
    if (weight > peak) peak = weight;
  }
  if (!(total > 0)) return 0;

  // Bins are logarithmic because a wavefunction spans decades between its peak
  // and its tail while the isovalue sits far below the peak: linear bins would
  // drop every sample that decides the answer into the first one.
  const bins = new Float64Array(BIN_COUNT);
  const peakLogarithm = Math.log2(peak);
  for (let index = data.length - 1; index >= 0; index--) {
    const value = data[index] as number;
    const weight = value * value;
    if (weight === 0) continue;
    const bin = Math.floor(
      (peakLogarithm - Math.log2(weight)) * BINS_PER_OCTAVE,
    );
    const clamped = bin < 0 ? 0 : Math.min(bin, BIN_COUNT - 1);
    bins[clamped] = (bins[clamped] as number) + weight;
  }

  const target = total * enclosedWeight;
  let running = 0;
  for (let bin = 0; bin < BIN_COUNT; bin++) {
    running += bins[bin] as number;
    // Everything above this bin's lower edge is what has just been counted.
    if (running >= target) {
      return Math.sqrt(peak * 2 ** (-(bin + 1) / BINS_PER_OCTAVE));
    }
  }
  return 0;
}

/**
 * How far from the centre of the box the drawn surface actually reaches.
 *
 * Molstar sizes a volume representation's bounding sphere from the whole
 * sampled box, which is deliberately larger than the isosurface inside it, so a
 * camera framing that sphere leaves the orbital a quarter of the frame wide.
 * Measuring the samples that are really enclosed gives the camera the extent it
 * has to fill.
 * @param field - The sampled field.
 * @param cutoff - The isovalue the surfaces are drawn at.
 * @returns The reach in ångström, or 0 when nothing is enclosed.
 */
export function enclosedReach(field: OrbitalGrid, cutoff: number): number {
  if (!(cutoff > 0)) return 0;
  const { data, dimensions, origin, spacing } = field;
  const [countX, countY, countZ] = dimensions;
  const centreX = origin.x + ((countX - 1) * spacing) / 2;
  const centreY = origin.y + ((countY - 1) * spacing) / 2;
  const centreZ = origin.z + ((countZ - 1) * spacing) / 2;
  let furthest = 0;
  let index = 0;
  for (let indexX = 0; indexX < countX; indexX++) {
    const dx = origin.x + indexX * spacing - centreX;
    for (let indexY = 0; indexY < countY; indexY++) {
      const dy = origin.y + indexY * spacing - centreY;
      for (let indexZ = 0; indexZ < countZ; indexZ++) {
        const value = data[index++] as number;
        if (value < cutoff && value > -cutoff) continue;
        const dz = origin.z + indexZ * spacing - centreZ;
        const squared = dx * dx + dy * dy + dz * dz;
        if (squared > furthest) furthest = squared;
      }
    }
  }
  return Math.sqrt(furthest);
}

/** Which isovalue each phase is drawn at, and how far the pair reaches. */
export interface OrbitalContour {
  /** `|ψ|` on the surface; 0 when there is nothing to draw. */
  cutoff: number;
  /** Distance from the centre of the box to the outermost enclosed sample. */
  reach: number;
}

/**
 * The isovalue and the extent of one sampled orbital's surface pair.
 *
 * Both phases come from one cutoff, so they can never disagree about where the
 * node between them is.
 * @param field - The sampled field.
 * @param enclosedWeight - Share of `∑ψ²` to hold inside.
 * @returns See {@link OrbitalContour}.
 */
export function orbitalContour(
  field: OrbitalGrid,
  enclosedWeight: number = ENCLOSED_WEIGHT,
): OrbitalContour {
  const cutoff = isocontourCutoff(field.data, enclosedWeight);
  return { cutoff, reach: enclosedReach(field, cutoff) };
}

/**
 * Bins per doubling of `ψ²`, so the isovalue lands within 2.2% in `|ψ|`.
 * Finer than the grid spacing can resolve on the surface it produces.
 */
const BINS_PER_OCTAVE = 16;

/** 128 octaves of `ψ²`, far past the dynamic range of a sampled orbital. */
const BIN_COUNT = 2048;
