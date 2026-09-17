/**
 * What an axis keeps, when it keeps more than one interval.
 *
 * The figure reports a list and accepts either a list or a bare interval, so a
 * caller that only ever keeps one is not made to write `[[0, 1]]`. Everything
 * downstream — the filter, the bands, the gesture — reads the list, which is
 * what {@link parallelRangeList} is for: one normalisation, at the edge, and
 * no `Array.isArray` scattered through the painter.
 *
 * Intervals on one axis are held sorted and disjoint. Two that touch are one
 * interval drawn twice, and a reader dragging a band across its neighbour means
 * to widen it rather than to stack two bands nobody can then take hold of.
 */

import type { ParallelRange, ParallelSelection } from './parallelTypes.ts';

/** Nothing kept, shared so a normalisation never allocates for the common case. */
const NONE: readonly ParallelRange[] = [];

/**
 * The intervals one axis keeps, however the caller wrote them.
 * @param selection - One interval, several, or nothing at all.
 * @returns The intervals, in the order given. Read in place — the caller's own
 * array comes back when it gave one.
 */
export function parallelRangeList(
  selection: ParallelSelection | undefined,
): readonly ParallelRange[] {
  if (selection === null || selection === undefined) return NONE;
  if (selection.length === 0) return NONE;
  // A bare interval is two numbers; a list of them holds arrays.
  return typeof selection[0] === 'number'
    ? [selection as ParallelRange]
    : (selection as readonly ParallelRange[]);
}

/**
 * Whether an axis keeps anything at all.
 * @param selection - What that axis keeps.
 * @returns Whether any interval is in force.
 */
export function parallelHasRange(
  selection: ParallelSelection | undefined,
): boolean {
  return parallelRangeList(selection).length > 0;
}

/**
 * The same intervals, sorted low to high and with the overlapping ones joined.
 * @param ranges - The intervals, in any order, each low value first.
 * @returns One list, sorted and disjoint. Intervals that touch at a point are
 * joined too: a reader who dragged one band onto another meant one band.
 */
export function parallelMergeRanges(
  ranges: readonly ParallelRange[],
): ParallelRange[] {
  if (ranges.length === 0) return [];
  const sorted = ranges
    .map((range) =>
      range[0] <= range[1] ? range : ([range[1], range[0]] as ParallelRange),
    )
    .toSorted((left, right) => left[0] - right[0]);
  const merged: ParallelRange[] = [];
  let low = (sorted[0] as ParallelRange)[0];
  let high = (sorted[0] as ParallelRange)[1];
  for (let index = 1; index < sorted.length; index++) {
    const range = sorted[index] as ParallelRange;
    if (range[0] > high) {
      merged.push([low, high]);
      low = range[0];
      high = range[1];
      continue;
    }
    if (range[1] > high) high = range[1];
  }
  merged.push([low, high]);
  return merged;
}

/**
 * The intervals an axis keeps once one of them is replaced, removed or added.
 * @param ranges - The intervals in force.
 * @param index - Which one is being written, or `-1` to add one.
 * @param range - The interval it becomes, or `null` to take it away.
 * @returns The new list, sorted and disjoint. Never the same array.
 */
export function parallelWriteRange(
  ranges: readonly ParallelRange[],
  index: number,
  range: ParallelRange | null,
): ParallelRange[] {
  const kept: ParallelRange[] = [];
  for (let at = 0; at < ranges.length; at++) {
    if (at === index) continue;
    kept.push(ranges[at] as ParallelRange);
  }
  if (range !== null) kept.push(range);
  return parallelMergeRanges(kept);
}
