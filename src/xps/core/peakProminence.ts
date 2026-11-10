/**
 * How far a maximum rises above the ground it stands on.
 *
 * This is the measure that decides what is a line and what is a ripple in an
 * XPS spectrum, and it is the only one that can: a survey scan carries a large
 * inelastic background that climbs from a few counts at low binding energy to
 * thousands at high, so a single threshold on the counts themselves is above
 * the small lines at one end of the scan and below the noise at the other. A
 * peak's prominence is measured against its own surroundings and so means the
 * same thing at both ends.
 *
 * It is the topographic definition: descend from the summit in each direction
 * until the trace turns back up past the summit's own height, and take the
 * higher of the two valleys reached. What is left is how far the peak would
 * still stand out if the landscape around it were flooded to that level.
 */

/**
 * The prominence of the maximum a detection reported, in counts.
 *
 * The index is treated as a hint rather than as the summit, because it is one:
 * `ml-gsd` reports the index its derivative crossed zero at, which on a line
 * only three or four points wide can be the neighbour of the tallest sample
 * rather than the tallest sample itself. Anchoring on it directly makes the
 * walk terminate against the true summit one step away and report a prominence
 * of zero — which reads exactly like a feature that is not there, and silently
 * drops the strongest lines of a coarsely-sampled survey.
 * @param intensities - The counts as they were measured.
 * @param from - Index the detection reported, anywhere on the peak.
 * @returns How far the peak rises above the higher of its two valleys.
 */
export function peakProminence(
  intensities: Float64Array,
  from: number,
): number {
  if (intensities.length === 0) return 0;
  const centre = summitIndex(intensities, from);
  const height = intensities[centre] as number;

  let left = height;
  for (let index = centre - 1; index >= 0; index--) {
    const value = intensities[index] as number;
    if (value > height) break;
    if (value < left) left = value;
  }

  let right = height;
  for (let index = centre + 1; index < intensities.length; index++) {
    const value = intensities[index] as number;
    if (value > height) break;
    if (value < right) right = value;
  }

  return height - Math.max(left, right);
}

/**
 * The nearest local maximum, climbing uphill from where the detection pointed.
 *
 * Always uphill and never across a valley, so the answer is the summit of the
 * peak the index was already on rather than the tallest one nearby: two lines a
 * few points apart are two peaks, and a climb that could cross between them
 * would report one of them twice.
 * @param intensities - The counts as they were measured.
 * @param from - Index to start from, clamped into the array.
 * @returns Index of the summit reached.
 */
export function summitIndex(intensities: Float64Array, from: number): number {
  const last = intensities.length - 1;
  if (last < 0) return 0;
  let at = Math.min(Math.max(Math.round(from), 0), last);

  for (;;) {
    const height = intensities[at] as number;
    const uphillLeft = at > 0 && (intensities[at - 1] as number) > height;
    const uphillRight = at < last && (intensities[at + 1] as number) > height;
    if (!uphillLeft && !uphillRight) return at;
    if (!uphillRight) {
      at -= 1;
    } else if (!uphillLeft) {
      at += 1;
    } else {
      // Both neighbours are higher, which happens on a flat step between two
      // rises: take the steeper side so the walk cannot oscillate.
      at +=
        (intensities[at - 1] as number) >= (intensities[at + 1] as number)
          ? -1
          : 1;
    }
  }
}

/**
 * The full height of the trace, which prominence is judged as a fraction of.
 *
 * The span rather than the maximum: a spectrum acquired with an offset has a
 * floor well above zero, and a fraction of the maximum would then be a
 * different fraction of what is actually visible on the chart.
 * @param intensities - The counts as they were measured.
 * @returns The distance from the lowest count to the highest, `0` when empty.
 */
export function intensitySpan(intensities: Float64Array): number {
  if (intensities.length === 0) return 0;
  let minimum = Infinity;
  let maximum = -Infinity;
  for (const value of intensities) {
    if (value < minimum) minimum = value;
    if (value > maximum) maximum = value;
  }
  return maximum - minimum;
}
