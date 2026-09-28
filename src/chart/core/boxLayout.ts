/**
 * Keeping the labels above the peaks apart from one another.
 *
 * An annotated spectrum wants a box over every peak it explains, and an
 * isotopologue cluster puts four of them within a few pixels. Sliding them
 * apart is most of the job, and the leader line back to the stick is what says
 * which peak a box belongs to — so a box a little out of place is still
 * readable.
 *
 * A box slid *far* out of place is not. Spacing a crowd out marches the last of
 * them across the whole plot, where it comes to rest over peaks it says nothing
 * about, with a leader long enough to be read as pointing at one of them. Those
 * are dropped, and only those: a mark still sits on every annotated peak, so
 * the fragment is not one the chemist concludes the spectrum lacks — it is one
 * whose picture is a zoom away.
 */

import type { NumberArray } from 'cheminfo-types';

/**
 * Slide overlapping boxes apart, keeping every one of them inside the plot.
 *
 * Two sweeps, and the order of the clamps is the whole behaviour. The first
 * sweep runs left to right and pushes each box far enough past its neighbour to
 * clear it, which piles the crowding up against the right edge; the second runs
 * back the other way, pulling that pile inside the right bound and spacing it
 * out leftwards again.
 *
 * The left bound is then applied last, after the spacing, and so beats it. A
 * cluster too wide for the room it is in therefore ends with its leftmost boxes
 * overlapping rather than with one of them hanging off the plot — an overlap is
 * two labels a reader can still pick apart with the leader lines, while a box
 * outside the plot is clipped away and reads as an annotation that was never
 * made.
 * @param centres - Where each box would like to be centred, in pixels; any
 * order, and the result comes back in that same order.
 * @param bounds - `[from, to]` in pixels that no box may extend beyond.
 * @param width - How wide every box is.
 * @param gap - The clear space wanted between two neighbouring boxes.
 * @param maximumDrift - How far a box may be slid from where it wanted to be
 * before it is dropped instead, in pixels. Defaults to two whole box steps.
 * @returns The centre each box was actually given, `NaN` for one that was slid
 * too far and dropped.
 */
export function layoutAnnotationBoxes(
  centres: NumberArray,
  bounds: readonly [number, number],
  width: number,
  gap: number,
  maximumDrift = (width + gap) * MAXIMUM_DRIFT_STEPS,
): Float64Array {
  const count = centres.length;
  const placed = new Float64Array(count);
  if (count === 0) return placed;

  const half = width / 2;
  const minimumCentre = bounds[0] + half;
  const maximumCentre = bounds[1] - half;
  const step = width + gap;
  const order = ascendingOrder(centres);

  let previous = Number.NEGATIVE_INFINITY;
  for (let position = 0; position < count; position++) {
    const index = order[position] as number;
    let centre = Math.min(
      Math.max(centres[index] as number, minimumCentre),
      maximumCentre,
    );
    if (centre < previous + step) centre = previous + step;
    placed[index] = centre;
    previous = centre;
  }

  let next = Number.POSITIVE_INFINITY;
  for (let position = count - 1; position >= 0; position--) {
    const index = order[position] as number;
    let centre = placed[index] as number;
    if (centre > maximumCentre) centre = maximumCentre;
    if (centre > next - step) centre = next - step;
    if (centre < minimumCentre) centre = minimumCentre;
    placed[index] = centre;
    next = centre;
  }

  // A picture that has been slid too far from the peak it explains is worse
  // than no picture: it hangs over a peak it says nothing about, and the leader
  // back to its own is long enough to be read as pointing at something else.
  // Those are dropped rather than drawn, and the mark on the peak still says
  // the annotation is there.
  for (let index = 0; index < count; index++) {
    const wanted = centres[index] as number;
    if (Math.abs((placed[index] as number) - wanted) > maximumDrift) {
      placed[index] = Number.NaN;
    }
  }
  return placed;
}

/**
 * How far a picture may be slid from its peak, counted in whole box steps.
 *
 * Two: a box may be pushed past two neighbours and still be read as belonging
 * to the peak under it, which is what a cluster of three peaks needs. Past that
 * the leader is longer than the box is wide and reaches across other peaks, so
 * the picture reads as answering for one of them instead.
 */
export const MAXIMUM_DRIFT_STEPS = 2;

/**
 * The indices of the boxes, ordered by where they want to be.
 *
 * The sweeps only make sense left to right, and the caller's order is whatever
 * the annotations came in — usually by mass, but a second producer's marks are
 * appended rather than merged.
 * @param centres - Where each box would like to be centred.
 * @returns The indices, ascending by centre.
 */
function ascendingOrder(centres: NumberArray): Uint32Array {
  const order = new Uint32Array(centres.length);
  for (let index = 0; index < centres.length; index++) {
    order[index] = index;
  }
  return order.toSorted(
    (first, second) => (centres[first] as number) - (centres[second] as number),
  );
}
