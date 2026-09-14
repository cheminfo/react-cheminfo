/**
 * The shell that summarises where a group of samples sits in the cloud.
 *
 * It is the outline of `scatter/core` with one dimension more, and it is
 * described the same way — a centre and the axes of the group's own spread,
 * in the data's units, measured by the same scan the map's outlines are — so
 * that turning it into something an SVG can draw stays a separate step: the
 * silhouette a camera sees of it.
 */

import { rowMatrix } from '../../chart/core/matrix.ts';
import type { EllipseSize } from '../../scatter/core/confidenceEllipse.ts';
import { DEFAULT_ELLIPSE_SIZE } from '../../scatter/core/confidenceEllipse.ts';
import { scatterGroupMoments } from '../../scatter/core/scatterGroupMoments.ts';

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
  const { size = DEFAULT_ELLIPSE_SIZE, minimumPoints = 4 } = options;
  const moments = scatterGroupMoments(rowMatrix(points), null, 1, 3);
  const count = moments.counts[0] ?? 0;
  if (moments.axes < 3 || count < Math.max(4, minimumPoints)) return null;

  const { means, covariances: spread } = moments;
  const center: Vector3 = [means[0] ?? 0, means[1] ?? 0, means[2] ?? 0];
  const covariance: SymmetricMatrix3 = {
    xx: spread[0] ?? 0,
    xy: spread[1] ?? 0,
    xz: spread[2] ?? 0,
    yy: spread[4] ?? 0,
    yz: spread[5] ?? 0,
    zz: spread[8] ?? 0,
  };
  if (!isFinitePoint(center) || !isFiniteMatrix(covariance)) return null;

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
 * @returns The number of standard deviations, never below zero — the same floor the map's outline keeps.
 */
export function ellipsoidStandardDeviations(size: EllipseSize): number {
  if (size.kind === 'standardDeviations') {
    return Math.max(size.standardDeviations, 0);
  }
  return standardDeviationsForCoverage3(size.probability);
}

function isFinitePoint(point: Vector3): boolean {
  return (
    Number.isFinite(point[0]) &&
    Number.isFinite(point[1]) &&
    Number.isFinite(point[2])
  );
}

function isFiniteMatrix(matrix: SymmetricMatrix3): boolean {
  return (
    Number.isFinite(matrix.xx) &&
    Number.isFinite(matrix.xy) &&
    Number.isFinite(matrix.xz) &&
    Number.isFinite(matrix.yy) &&
    Number.isFinite(matrix.yz) &&
    Number.isFinite(matrix.zz)
  );
}
