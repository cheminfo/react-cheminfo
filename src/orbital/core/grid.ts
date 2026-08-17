/**
 * Sampling a wavefunction onto a dense scalar field for the isosurface renderer.
 *
 * The memory order is a hard contract with molstar: `Tensor.Space([nx, ny, nz],
 * [0, 1, 2])` reads `dataOffset = x·ny·nz + y·nz + z`, so **z varies fastest**.
 * The loops below are written in exactly that order and
 * {@link gridIndex} is the single place the arithmetic is spelled out.
 */

import type { Vec3 } from './constants.ts';

/** An axis-aligned sampling box, ångström. */
export interface GridBox {
  /** Lowest corner. */
  origin: Vec3;
  /** Edge lengths along x, y and z. */
  size: Vec3;
}

/**
 * A wavefunction, sampled at one point.
 * @param x - Offset from the origin along x, ångström.
 * @param y - Offset along y.
 * @param z - Offset along z.
 * @returns The amplitude, Å^(-3/2).
 */
export type OrbitalEvaluator = (x: number, y: number, z: number) => number;

/** A sampled scalar field plus the statistics an isovalue is chosen from. */
export interface OrbitalGrid {
  /** `nx·ny·nz` samples, z varying fastest. */
  data: Float32Array;
  /** `[nx, ny, nz]`. */
  dimensions: [number, number, number];
  /** Position of sample `(0, 0, 0)`, ångström. */
  origin: Vec3;
  /** Distance between neighbouring samples on every axis, ångström. */
  spacing: number;
  min: number;
  max: number;
  mean: number;
  /** Population standard deviation of the samples. */
  sigma: number;
}

/**
 * Sample a wavefunction over a box.
 * @param evaluate - the wavefunction, cartesian ångström in, amplitude out.
 * @param box - the region to cover.
 * @param resolution - samples along the longest edge; the spacing it implies is
 * used on all three axes, so the voxels stay cubic.
 * @returns the field, its layout and its single-pass statistics.
 * @throws {Error} when `resolution` is below 2 or the box has no volume.
 */
export function evaluateGrid(
  evaluate: OrbitalEvaluator,
  box: GridBox,
  resolution: number,
): OrbitalGrid {
  if (resolution < 2) {
    throw new Error('a grid needs at least 2 samples per axis');
  }
  const { origin, size } = box;
  const longestEdge = Math.max(size.x, size.y, size.z);
  if (!(longestEdge > 0)) {
    throw new Error('the sampling box must have a non-zero edge');
  }
  const spacing = longestEdge / (resolution - 1);
  const countX = axisCount(size.x, spacing);
  const countY = axisCount(size.y, spacing);
  const countZ = axisCount(size.z, spacing);
  const data = new Float32Array(countX * countY * countZ);
  let min = Infinity;
  let max = -Infinity;
  let sum = 0;
  let sumSquares = 0;
  let index = 0;
  for (let indexX = 0; indexX < countX; indexX++) {
    const x = origin.x + indexX * spacing;
    for (let indexY = 0; indexY < countY; indexY++) {
      const y = origin.y + indexY * spacing;
      for (let indexZ = 0; indexZ < countZ; indexZ++) {
        const value = Math.fround(evaluate(x, y, origin.z + indexZ * spacing));
        data[index++] = value;
        if (value < min) min = value;
        if (value > max) max = value;
        sum += value;
        sumSquares += value * value;
      }
    }
  }
  const count = data.length;
  const mean = sum / count;
  const variance = sumSquares / count - mean * mean;
  return {
    data,
    dimensions: [countX, countY, countZ],
    origin: { x: origin.x, y: origin.y, z: origin.z },
    spacing,
    min,
    max,
    mean,
    sigma: Math.sqrt(Math.max(variance, 0)),
  };
}

/**
 * Flat offset of a sample, the layout molstar expects.
 * @param dimensions - `[nx, ny, nz]` of the grid.
 * @param indexX - sample index along x.
 * @param indexY - sample index along y.
 * @param indexZ - sample index along z, the fastest-varying axis.
 * @returns the index into {@link OrbitalGrid.data}.
 */
export function gridIndex(
  dimensions: [number, number, number],
  indexX: number,
  indexY: number,
  indexZ: number,
): number {
  return (indexX * dimensions[1] + indexY) * dimensions[2] + indexZ;
}

function axisCount(edge: number, spacing: number): number {
  return Math.max(2, Math.round(edge / spacing) + 1);
}
