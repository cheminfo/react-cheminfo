/**
 * The shell that summarises where a group of samples sits in the cloud.
 *
 * It is the outline of `scatter/core` with one dimension more, and it is
 * described the same way — a centre and the axes of the group's own spread,
 * in the data's units — so that turning it into something an SVG can draw
 * stays a separate step. Here that step matters more than it does on a map:
 * a shell has no `<ellipse>` to fall back on and has to be tessellated,
 * projected and painted back to front.
 */

import type { EllipseSize } from '../../scatter/core/confidenceEllipse.ts';

import { standardDeviationsForCoverage3 } from './ellipsoidCoverage.ts';
import type { Vector3 } from './orbitCamera.ts';
import type { SymmetricMatrix3 } from './symmetricEigen.ts';
import { symmetricEigen3 } from './symmetricEigen.ts';

/** A group's shell, in the cloud's own units. */
export interface ConfidenceEllipsoid {
  /** Centre of the shell, which is the group's average. */
  center: Vector3;
  /**
   * Three orthogonal semi-axes, longest first, each vector as long as its own
   * radius. A direction the group has no spread in is the zero vector, which
   * is what flattens the shell rather than giving it a false thickness.
   */
  axes: readonly [Vector3, Vector3, Vector3];
  /** How many finite points went into it. */
  count: number;
}

/** How {@link confidenceEllipsoid} measures a group. */
export interface ConfidenceEllipsoidOptions {
  /**
   * How large to draw the shell. A share is read in three dimensions, so the
   * same share gives a wider shell here than the same call gives on the map.
   * @default { kind: 'coverage', probability: 0.95 }
   */
  size?: EllipseSize;
  /**
   * How many finite points a group needs before it is given a shell at all.
   * Below four a group has no volume to measure — three points lie on a plane
   * however they are arranged — so fewer than four is read as four.
   * @default 4
   */
  minimumPoints?: number;
}

/**
 * The shell that summarises a group of samples.
 *
 * Points that are not finite are skipped rather than poisoning the average,
 * and the spread is measured with the `n - 1` divisor, so the shell estimates
 * the group rather than describing the handful of samples that happen to have
 * been measured — both exactly as the two-dimensional outline does.
 * @param points - The group's samples, in the cloud's own units.
 * @param options - See {@link ConfidenceEllipsoidOptions}.
 * @returns The shell, or `null` when the group is too small to have a shape, when its coordinates are so large that squaring them overflows, or when the requested size is unbounded.
 */
export function confidenceEllipsoid(
  points: readonly Vector3[],
  options: ConfidenceEllipsoidOptions = {},
): ConfidenceEllipsoid | null {
  const { size = DEFAULT_SIZE, minimumPoints = 4 } = options;
  const floor = Math.max(4, minimumPoints);

  let count = 0;
  let sumX = 0;
  let sumY = 0;
  let sumZ = 0;
  for (const point of points) {
    if (!isFinitePoint(point)) continue;
    count++;
    sumX += point[0];
    sumY += point[1];
    sumZ += point[2];
  }
  if (count < floor) return null;

  const center: Vector3 = [sumX / count, sumY / count, sumZ / count];
  const covariance = spreadAbout(points, center, count);
  if (covariance === null) return null;

  const radius = ellipsoidStandardDeviations(size);
  if (!Number.isFinite(radius)) return null;

  const { values, vectors } = symmetricEigen3(covariance);
  const axes: Vector3[] = [];
  for (let i = 0; i < 3; i++) {
    const length = radius * Math.sqrt(Math.max(0, values[i] as number));
    if (!Number.isFinite(length)) return null;
    const direction = vectors[i] as Vector3;
    axes.push([
      direction[0] * length,
      direction[1] * length,
      direction[2] * length,
    ]);
  }

  return {
    center,
    axes: [axes[0] as Vector3, axes[1] as Vector3, axes[2] as Vector3],
    count,
  };
}

/**
 * How far out a size asks the shell to be drawn.
 *
 * Public because a legend has to be able to say what a share came to without
 * building a shell to ask it.
 * @param size - How large the shell was asked to be.
 * @returns The number of standard deviations.
 */
export function ellipsoidStandardDeviations(size: EllipseSize): number {
  if (size.kind === 'standardDeviations') return size.standardDeviations;
  return standardDeviationsForCoverage3(size.probability);
}

function spreadAbout(
  points: readonly Vector3[],
  center: Vector3,
  count: number,
): SymmetricMatrix3 | null {
  let xx = 0;
  let xy = 0;
  let xz = 0;
  let yy = 0;
  let yz = 0;
  let zz = 0;
  for (const point of points) {
    if (!isFinitePoint(point)) continue;
    const dx = point[0] - center[0];
    const dy = point[1] - center[1];
    const dz = point[2] - center[2];
    xx += dx * dx;
    xy += dx * dy;
    xz += dx * dz;
    yy += dy * dy;
    yz += dy * dz;
    zz += dz * dz;
  }
  const divisor = count - 1;
  const covariance: SymmetricMatrix3 = {
    xx: xx / divisor,
    xy: xy / divisor,
    xz: xz / divisor,
    yy: yy / divisor,
    yz: yz / divisor,
    zz: zz / divisor,
  };
  if (
    !Number.isFinite(center[0]) ||
    !Number.isFinite(center[1]) ||
    !Number.isFinite(center[2]) ||
    !Number.isFinite(covariance.xx) ||
    !Number.isFinite(covariance.yy) ||
    !Number.isFinite(covariance.zz) ||
    !Number.isFinite(covariance.xy) ||
    !Number.isFinite(covariance.xz) ||
    !Number.isFinite(covariance.yz)
  ) {
    return null;
  }
  return covariance;
}

function isFinitePoint(point: Vector3): boolean {
  return (
    Number.isFinite(point[0]) &&
    Number.isFinite(point[1]) &&
    Number.isFinite(point[2])
  );
}

const DEFAULT_SIZE: EllipseSize = { kind: 'coverage', probability: 0.95 };
