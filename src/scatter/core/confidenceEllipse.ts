/**
 * The outline that summarises where a group of samples sits on a scatter plot.
 *
 * Everything here is in data units. Turning one of these into something an SVG
 * can draw is `projectEllipse`, which has to be a separate step because the two
 * axes rarely carry the same number of pixels per unit.
 */

import { standardDeviationsForCoverage } from './ellipseCoverage.ts';

/**
 * A smaller eigenvalue below this share of the larger one is read as zero.
 *
 * A group whose spread across the major axis is under a millionth of its
 * spread along it is collinear for any purpose a plot has, and the rounding of
 * the covariance alone reaches that far: the nine points on a straight line
 * used in the tests leave a residue of about 5e-17 where the exact answer is
 * 0. Without the floor those points would draw a hairline ellipse on one
 * machine and a segment on the next.
 */
const COLLINEAR_FLOOR = 1e-12;

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

/** How a cloud is spread, as the three distinct entries of its covariance. */
export interface EllipseCovariance {
  /** The spread along the horizontal axis. */
  xx: number;
  /** How the two axes move together; zero when they are unrelated. */
  xy: number;
  /** The spread along the vertical axis. */
  yy: number;
}

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
  const { size = { kind: 'coverage', probability: 0.95 }, minimumPoints = 3 } =
    options;

  let count = 0;
  let sumX = 0;
  let sumY = 0;
  for (const point of points) {
    if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) continue;
    count++;
    sumX += point.x;
    sumY += point.y;
  }
  if (count < Math.max(2, minimumPoints)) return null;

  const cx = sumX / count;
  const cy = sumY / count;
  let spreadX = 0;
  let together = 0;
  let spreadY = 0;
  for (const point of points) {
    if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) continue;
    const dx = point.x - cx;
    const dy = point.y - cy;
    spreadX += dx * dx;
    together += dx * dy;
    spreadY += dy * dy;
  }

  const divisor = count - 1;
  const covariance: EllipseCovariance = {
    xx: spreadX / divisor,
    xy: together / divisor,
    yy: spreadY / divisor,
  };
  if (
    !Number.isFinite(cx) ||
    !Number.isFinite(cy) ||
    !Number.isFinite(covariance.xx) ||
    !Number.isFinite(covariance.xy) ||
    !Number.isFinite(covariance.yy)
  ) {
    return null;
  }

  const { rx, ry, angle } = ellipseAxes(
    covariance,
    ellipseStandardDeviations(size),
  );
  if (!Number.isFinite(rx) || !Number.isFinite(ry)) return null;
  return { cx, cy, rx, ry, angle, count, covariance };
}

/**
 * The semi-axes and the rotation that a covariance describes.
 *
 * The shape of an outline is the eigen-decomposition of a symmetric two by two
 * matrix, which has a closed form and so never needs an iterative solver. It
 * is public because the same three numbers are what turns any covariance into
 * something drawable — one measured elsewhere, or one already mapped into
 * pixels.
 * @param covariance - How the cloud is spread.
 * @param standardDeviations - How far out to measure. Defaults to `1`.
 * @returns The two semi-axis lengths and the rotation of the major one, in radians, in `(-π/2, π/2]`. A collinear cloud gives `ry` of exactly `0`, and one with no spread at all gives an angle of `0` because it has no direction to report.
 */
export function ellipseAxes(
  covariance: EllipseCovariance,
  standardDeviations = 1,
): Pick<ConfidenceEllipse, 'rx' | 'ry' | 'angle'> {
  const { xx, xy, yy } = covariance;
  const middle = (xx + yy) / 2;
  const half = (xx - yy) / 2;
  const radius = Math.hypot(half, xy);
  const major = middle + radius;
  let minor = middle - radius;
  if (!(minor > major * COLLINEAR_FLOOR)) minor = 0;
  return {
    rx: standardDeviations * Math.sqrt(major),
    ry: standardDeviations * Math.sqrt(minor),
    angle: majorAxisAngle(xx, xy, yy, major),
  };
}

function majorAxisAngle(
  xx: number,
  xy: number,
  yy: number,
  major: number,
): number {
  // With no cross term the axes already are the eigenvectors, and asking
  // `atan2` would only turn the exact answer into a rounded one.
  if (xy === 0) return xx >= yy ? 0 : Math.PI / 2;
  // `major - xx` is never negative, so this lands in [0, π] and a negative
  // cross term arrives half a turn away from the direction actually wanted.
  const angle = Math.atan2(major - xx, xy);
  return angle > Math.PI / 2 ? angle - Math.PI : angle;
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
