/**
 * The outline that summarises where a group of samples sits on a scatter plot.
 *
 * Everything here is in data units. Turning one of these into something an SVG
 * can draw is `projectEllipse`, which has to be a separate step because the two
 * axes rarely carry the same number of pixels per unit.
 */

import type { MatrixLike } from '../../chart/core/matrix.ts';

import type { EllipseCovariance } from './ellipseAxes.ts';
import { ellipseAxes } from './ellipseAxes.ts';
import { standardDeviationsForCoverage } from './ellipseCoverage.ts';
import type { ScatterGroupMoments } from './scatterGroupMoments.ts';
import { scatterGroupMoments } from './scatterGroupMoments.ts';

/** A point of a cloud, or of an outline drawn around one, in data units. */
export interface EllipsePoint {
  /** Position along the horizontal axis. */
  x: number;
  /** Position along the vertical axis. */
  y: number;
}

/** An outline drawn to hold a share of its group. */
export interface EllipseCoverageSize {
  /** Marks which of the two ways of asking for a size this is. */
  kind: 'coverage';
  /** The share of the group to enclose, from 0 to 1. */
  probability: number;
}

/** An outline drawn at a multiple of its group's spread. */
export interface EllipseStandardDeviationSize {
  /** Marks which of the two ways of asking for a size this is. */
  kind: 'standardDeviations';
  /** How far out to draw, in standard deviations. */
  standardDeviations: number;
}

/**
 * How large a group outline is drawn.
 *
 * A share is what a reader understands without being taught, and it is the
 * only mode the shipped control offers; the multiple is kept because a site
 * whose audience already reads standard deviations should not have to convert
 * one into the other by hand.
 */
export type EllipseSize = EllipseCoverageSize | EllipseStandardDeviationSize;

/** What a group is outlined at when the caller says nothing: the share holding 95 % of it. */
export const DEFAULT_ELLIPSE_SIZE: EllipseSize = {
  kind: 'coverage',
  probability: 0.95,
};

/** A group outline, in data units. */
export interface ConfidenceEllipse {
  /** Centre of the outline, which is the group's average. */
  cx: number;
  /** Centre of the outline, which is the group's average. */
  cy: number;
  /** Semi-major axis length. */
  rx: number;
  /** Semi-minor axis length; exactly `0` when the group is collinear. */
  ry: number;
  /** Rotation of the major axis, in radians counter-clockwise, in `(-π/2, π/2]`. */
  angle: number;
  /** How many points went into it, the ones that were not finite left out. */
  count: number;
  /** The spread the outline was built from, before any size was applied. */
  covariance: EllipseCovariance;
}

/** How {@link confidenceEllipse} measures a group. */
export interface ConfidenceEllipseOptions {
  /**
   * How large to draw the outline.
   * @default { kind: 'coverage', probability: 0.95 }
   */
  size?: EllipseSize;
  /**
   * How many finite points a group needs before it is outlined at all. Below
   * it the shape says more about the sample than about the group. Fewer than
   * two is read as two, because one point has no spread to measure.
   * @default 3
   */
  minimumPoints?: number;
}

/**
 * The outline that summarises a group of samples.
 *
 * Points that are not finite are skipped rather than poisoning the average, so
 * a column with a few gaps still describes its group; `count` reports how many
 * were actually used. The spread is measured with the `n - 1` divisor, which
 * is what makes the outline an estimate of the group rather than a statement
 * about the handful of samples that happen to have been measured.
 * @param points - The group's samples, in data units.
 * @param options - See {@link ConfidenceEllipseOptions}.
 * @returns The outline, or `null` when the group is too small to have a shape, or when its coordinates are so large that squaring them overflows, or when the requested size is unbounded.
 */
export function confidenceEllipse(
  points: readonly EllipsePoint[],
  options: ConfidenceEllipseOptions = {},
): ConfidenceEllipse | null {
  const { size = DEFAULT_ELLIPSE_SIZE, minimumPoints = 3 } = options;
  const moments = scatterGroupMoments(pointMatrix(points), null, 1, 2);
  return momentsEllipse(moments, {
    group: 0,
    xAxis: 0,
    yAxis: 1,
    standardDeviations: ellipseStandardDeviations(size),
    minimumPoints,
  });
}

/** Which outline {@link momentsEllipse} cuts out of a block of moments. */
interface MomentsEllipseOptions {
  /** Which group. */
  group: number;
  /** The axis the outline's `x` is read along. */
  xAxis: number;
  /** The axis its `y` is read along. */
  yAxis: number;
  /** How far out to draw, in standard deviations. */
  standardDeviations: number;
  /** How many rows the group needs before it has a shape; below two is read as two. */
  minimumPoints: number;
}

/**
 * One group's outline for one pair of axes, cut out of measured moments.
 *
 * The two-by-two block of a covariance is a covariance in its own right, so a
 * pair grid measuring every axis at once and a map measuring one pair give
 * the same outline for the same samples.
 * @param moments - The block, from `scatterGroupMoments`.
 * @param options - See {@link MomentsEllipseOptions}.
 * @returns The outline, or `null` when the group is too small to have a shape, when either axis or the group is outside the block, or when the size or the coordinates are not finite.
 */
export function momentsEllipse(
  moments: ScatterGroupMoments,
  options: MomentsEllipseOptions,
): ConfidenceEllipse | null {
  const { axes, groups, counts, means, covariances } = moments;
  const { group, xAxis, yAxis, standardDeviations, minimumPoints } = options;
  if (group < 0 || group >= groups) return null;
  if (xAxis < 0 || yAxis < 0 || xAxis >= axes || yAxis >= axes) return null;
  const count = counts[group] ?? 0;
  if (count < Math.max(2, minimumPoints)) return null;

  const base = group * axes;
  const block = group * axes * axes;
  const covariance: EllipseCovariance = {
    xx: covariances[block + xAxis * axes + xAxis] ?? 0,
    xy: covariances[block + xAxis * axes + yAxis] ?? 0,
    yy: covariances[block + yAxis * axes + yAxis] ?? 0,
  };
  const { rx, ry, angle } = ellipseAxes(covariance, standardDeviations);
  const cx = means[base + xAxis] ?? 0;
  const cy = means[base + yAxis] ?? 0;
  if (!Number.isFinite(rx) || !Number.isFinite(ry)) return null;
  if (!Number.isFinite(cx) || !Number.isFinite(cy)) return null;
  return { cx, cy, rx, ry, angle, count, covariance };
}

/**
 * How far out an outline of a given size is drawn.
 *
 * Public because a figure that measures its groups itself — a pair grid
 * decomposing one shared block of covariances rather than calling
 * {@link confidenceEllipse} per cell — still has to honour the same size the
 * map was asked for, and a second reading of `EllipseSize` would be a second
 * place for the two to drift apart.
 * @param size - How large the outline was asked to be.
 * @returns The number of standard deviations, never below zero.
 */
export function ellipseStandardDeviations(size: EllipseSize): number {
  if (size.kind === 'standardDeviations') {
    return Math.max(size.standardDeviations, 0);
  }
  return standardDeviationsForCoverage(size.probability);
}

/*
 * A run of points read as a two-column matrix, so a group handed as objects
 * is measured by the same scan as one handed as a score matrix.
 */
function pointMatrix(points: readonly EllipsePoint[]): MatrixLike {
  return {
    rows: points.length,
    columns: 2,
    get(rowIndex: number, columnIndex: number): number {
      const point = points[rowIndex];
      if (point === undefined) return Number.NaN;
      if (columnIndex === 0) return point.x;
      return columnIndex === 1 ? point.y : Number.NaN;
    },
  };
}
