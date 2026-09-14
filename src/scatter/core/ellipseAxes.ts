/**
 * The shape a covariance describes: two semi-axes and the turn of the longer
 * one, from the closed form of a symmetric two by two eigen-decomposition.
 *
 * It is its own module because a map outline, a pair-grid cell and the
 * silhouette of a shell in a cloud all end in this same decomposition, and a
 * second copy of it is a second collinear floor to forget.
 */

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

/** How a cloud is spread, as the three distinct entries of its covariance. */
export interface EllipseCovariance {
  /** The spread along the horizontal axis. */
  xx: number;
  /** How the two axes move together; zero when they are unrelated. */
  xy: number;
  /** The spread along the vertical axis. */
  yy: number;
}

/** The drawable shape of a covariance. */
export interface EllipseAxes {
  /** Semi-major axis length. */
  rx: number;
  /** Semi-minor axis length; exactly `0` when the spread is collinear. */
  ry: number;
  /** Rotation of the major axis, in radians counter-clockwise, in `(-π/2, π/2]`. */
  angle: number;
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
): EllipseAxes {
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
