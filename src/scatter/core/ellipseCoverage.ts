/**
 * How far out a group outline is drawn, and how much of the group it then
 * holds.
 *
 * The two directions are exact inverses of one another, so a legend can quote
 * a share and a control can offer standard deviations without either of them
 * keeping a table of numbers that would drift apart.
 */

/**
 * The share of a two-dimensional normal cloud that falls inside the ellipse
 * drawn at a number of standard deviations.
 *
 * Not the 68, 95 and 99.7 percent that a single measurement is quoted with:
 * those describe an interval on one axis, while an ellipse has to hold a point
 * in both directions at once. One, two and three standard deviations therefore
 * keep about 39, 86 and 99 percent of the cloud, and writing the
 * one-dimensional figures beside a map is the usual way a scatter legend comes
 * to promise more than its outlines contain.
 * @param standardDeviations - How far out the ellipse is drawn.
 * @returns The share, from 0 to 1. Zero for anything at or below zero, since an ellipse of no size holds nothing.
 */
export function coverageForStandardDeviations(
  standardDeviations: number,
): number {
  if (!Number.isFinite(standardDeviations)) {
    return standardDeviations > 0 ? 1 : 0;
  }
  if (standardDeviations <= 0) return 0;
  return 1 - Math.exp(-(standardDeviations * standardDeviations) / 2);
}

/**
 * How far out to draw the ellipse that holds a share of a two-dimensional
 * normal cloud.
 *
 * The inverse of {@link coverageForStandardDeviations}, which is what lets a
 * control offer `95% of samples` and still hand the geometry a radius.
 * @param coverage - The share of the cloud to enclose, from 0 to 1.
 * @returns The number of standard deviations. Zero at or below zero, and infinite at or above one, because no finite ellipse holds every point of a cloud with unbounded tails.
 */
export function standardDeviationsForCoverage(coverage: number): number {
  if (!Number.isFinite(coverage) || coverage <= 0) return 0;
  if (coverage >= 1) return Number.POSITIVE_INFINITY;
  return Math.sqrt(-2 * Math.log(1 - coverage));
}
