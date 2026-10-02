/**
 * What a range filter keeps, and how its two handles map to it.
 *
 * A filter is two bounds, either of which may be left open. A handle parked at
 * the end of the track is an open side rather than a bound at the track's end,
 * because the track only covers the values the page knows about: a molecule
 * heavier than the heaviest one in the statistics must not be cut by a filter
 * nobody touched.
 */

import { clamp } from '../../format/core/clamp.ts';
import { snapToStep } from '../../number/core/numberText.ts';

/** A lowest and a highest value kept, either of which may be left open. */
export interface RangeBounds {
  /** The lowest value kept, or `null` when nothing is cut from below. */
  readonly min: number | null;
  /** The highest value kept, or `null` when nothing is cut from above. */
  readonly max: number | null;
}

/** The two ends of a slider's track, low first. */
export type RangeDomain = readonly [number, number];

/** Where the two handles of a slider stand, low first. */
export type RangeHandles = readonly [number, number];

/** A range that keeps everything. */
export const OPEN_RANGE: RangeBounds = Object.freeze({ min: null, max: null });

/**
 * Whether a range cuts anything at all.
 * @param range - The range.
 * @returns Whether either side carries a bound.
 */
export function isRangeBounded(range: RangeBounds): boolean {
  return range.min !== null || range.max !== null;
}

/**
 * Whether two ranges keep the same values.
 * @param left - One range.
 * @param right - The other.
 * @returns Whether both sides agree, an open side matching only an open side.
 */
export function sameRange(left: RangeBounds, right: RangeBounds): boolean {
  return Object.is(left.min, right.min) && Object.is(left.max, right.max);
}

/**
 * Whether a track can be drawn: two finite ends, the high one above the low.
 * Statistics that have not arrived yet are usually a track of `[0, 0]`.
 * @param domain - The two ends.
 * @returns Whether a slider can be laid along it.
 */
export function isRangeDomain(domain: RangeDomain): boolean {
  const [low, high] = domain;
  return Number.isFinite(low) && Number.isFinite(high) && high > low;
}

/**
 * Where the handles stand for a range: an open side at the end of the track,
 * and a bound past the track held at its end.
 * @param range - The range.
 * @param domain - The track, already checked with {@link isRangeDomain}.
 * @returns The two handle positions, low first.
 */
export function rangeHandles(
  range: RangeBounds,
  domain: RangeDomain,
): RangeHandles {
  const [low, high] = domain;
  const start = range.min === null ? low : clamp(range.min, low, high);
  const end = range.max === null ? high : clamp(range.max, low, high);
  return start <= end ? [start, end] : [end, start];
}

/**
 * The range two handles stand for once they have moved.
 *
 * Only a handle that moved changes its side. A bound past the end of the track
 * sits at that end, and dragging the other handle must not turn it into an
 * open side; a handle the reader took to the end of the track, on the other
 * hand, opens its side.
 * @param from - The range before the handles moved.
 * @param handles - Where the handles are now.
 * @param domain - The track.
 * @returns The range the reader asked for.
 */
export function movedRange(
  from: RangeBounds,
  handles: RangeHandles,
  domain: RangeDomain,
): RangeBounds {
  const [low, high] = domain;
  const [start, end] = rangeHandles(from, domain);
  return {
    min:
      handles[0] === start ? from.min : handles[0] <= low ? null : handles[0],
    max: handles[1] === end ? from.max : handles[1] >= high ? null : handles[1],
  };
}

/**
 * Where handles settle while they are dragged: a moved handle onto the step
 * grid laid from the low end of the track, an untouched one where it stood.
 *
 * Snapping the untouched handle too would move a bound the reader typed, say
 * `1.23` on a track stepped by `0.5`, the moment the other handle is dragged.
 * The ends of the track are kept even when they are off the grid, since an end
 * is what opens a side.
 * @param next - Where the slider reports the handles.
 * @param from - The range before the drag started.
 * @param step - The grid spacing.
 * @param domain - The track.
 * @returns The handle positions to draw and to report.
 */
export function settleHandles(
  next: RangeHandles,
  from: RangeBounds,
  step: number,
  domain: RangeDomain,
): RangeHandles {
  const [start, end] = rangeHandles(from, domain);
  return [
    next[0] === start ? start : snapHandle(next[0], step, domain),
    next[1] === end ? end : snapHandle(next[1], step, domain),
  ];
}

/**
 * One handle moved onto the step grid, the ends of the track kept as they are.
 * @param value - Where the handle was dropped.
 * @param step - The grid spacing.
 * @param domain - The track.
 * @returns The position the handle settles on.
 */
function snapHandle(value: number, step: number, domain: RangeDomain): number {
  const [low, high] = domain;
  if (value <= low) return low;
  if (value >= high) return high;
  return clamp(snapToStep(value, step, low), low, high);
}
