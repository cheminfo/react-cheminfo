/**
 * How far out a group's shell is drawn, and how much of the group it then
 * holds.
 *
 * The two-dimensional pair in `scatter/core` cannot answer this, and the
 * difference is not a rounding: a shell has to hold a sample in three
 * directions at once, so the same two standard deviations that keep 86 per
 * cent of a flat cloud keep only 74 per cent of a solid one. Quoting the flat
 * figure beside a cloud is the usual way a legend comes to promise more than
 * its shells contain, which is why the map and the cloud each ask their own
 * dimension.
 */

/**
 * The share of a three-dimensional normal cloud inside the shell drawn at a
 * number of standard deviations.
 * @param standardDeviations - How far out the shell is drawn.
 * @returns The share, from 0 to 1. Zero at or below zero, since a shell of no size holds nothing.
 */
export function coverageForStandardDeviations3(
  standardDeviations: number,
): number {
  if (!Number.isFinite(standardDeviations)) {
    return standardDeviations > 0 ? 1 : 0;
  }
  if (standardDeviations <= 0) return 0;
  const radius = standardDeviations;
  const inside = erf(radius / Math.SQRT2);
  const shell =
    radius * Math.sqrt(2 / Math.PI) * Math.exp(-(radius * radius) / 2);
  return Math.min(1, Math.max(0, inside - shell));
}

/**
 * How far out to draw the shell that holds a share of a three-dimensional
 * normal cloud.
 *
 * The inverse of {@link coverageForStandardDeviations3}. There is no closed
 * form for it, so it is bisected — the share grows strictly with the radius,
 * so fifty halvings settle it far below the width of the line the shell is
 * drawn with, and the search runs once per group rather than once per face.
 * @param coverage - The share to enclose, from 0 to 1.
 * @returns The number of standard deviations. Zero at or below zero, and infinite at or above one, because no finite shell holds every point of a cloud with unbounded tails.
 */
export function standardDeviationsForCoverage3(coverage: number): number {
  if (!Number.isFinite(coverage) || coverage <= 0) return 0;
  if (coverage >= 1) return Number.POSITIVE_INFINITY;

  let low = 0;
  // Nine standard deviations hold every share a control can ask for: the
  // remainder there is under 1e-17, which no `number` can tell from zero.
  let high = 9;
  for (let step = 0; step < 50; step++) {
    const middle = (low + high) / 2;
    if (coverageForStandardDeviations3(middle) < coverage) {
      low = middle;
    } else {
      high = middle;
    }
  }
  return (low + high) / 2;
}

/**
 * The error function, to about a part in ten million.
 *
 * Abramowitz and Stegun 7.1.26. That is coarser than the library's usual
 * standard and is deliberately so: it decides the radius of a shell drawn a
 * few hundred pixels across, where a part in ten million is a part in ten
 * thousand of one pixel, and the alternative is a series that costs more to
 * read than the whole module around it.
 * @param x - The argument.
 * @returns The error function at `x`.
 */
function erf(x: number): number {
  const sign = x < 0 ? -1 : 1;
  const absolute = Math.abs(x);
  const t = 1 / (1 + 0.327_591_1 * absolute);
  const series =
    t *
    (0.254_829_592 +
      t *
        (-0.284_496_736 +
          t * (1.421_413_741 + t * (-1.453_152_027 + t * 1.061_405_429))));
  return sign * (1 - series * Math.exp(-absolute * absolute));
}
