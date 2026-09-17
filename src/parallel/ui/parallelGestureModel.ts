/**
 * The questions the gesture asks that need neither React nor state: where a
 * press landed, which axis it reached, and which band each axis should be
 * drawn with once the one being dragged is taken into account.
 *
 * Kept out of the hook the way `lassoGesture.ts` is kept out of its own — each
 * of these has exactly one answer, and none of them needs a render to be read.
 */

import type { SurfaceEvent } from '../../scatter/ui/lassoGesture.ts';
import { surfacePosition } from '../../scatter/ui/lassoGesture.ts';
import type { ParallelAxisLayout } from '../core/parallelAxes.ts';
import { PARALLEL_MARGIN } from '../core/parallelAxes.ts';
import type { ParallelBand } from '../core/parallelBrush.ts';
import {
  PARALLEL_BRUSH_HALF_WIDTH,
  parallelBandOf,
  parallelIsBand,
  parallelRangeOf,
} from '../core/parallelBrush.ts';
import {
  parallelRangeList,
  parallelWriteRange,
} from '../core/parallelSelection.ts';
import type { ParallelRange, ParallelRanges } from '../core/parallelTypes.ts';

/** A band being dragged, before the interval it keeps is reported. */
export interface ParallelDraft {
  /** The axis it is on. */
  axis: string;
  /** Which of that axis's bands it is, or `-1` when it is a new one. */
  index: number;
  /** Where it stands this frame. */
  band: ParallelBand;
}

/**
 * Where an event landed, relative to the top left of the drawing area.
 * @param event - The event, for where on the surface it happened.
 * @returns The position, in pixels from the corner of the drawing area.
 */
export function parallelPointOf(event: SurfaceEvent): {
  x: number;
  y: number;
} {
  const position = surfacePosition(event, 0, 0);
  return {
    x: position.x - PARALLEL_MARGIN.left,
    y: position.y - PARALLEL_MARGIN.top,
  };
}

/**
 * Which axis a press at that horizontal position took hold of.
 * @param x - Pixels from the left of the drawing area.
 * @param axes - The axes, from left to right.
 * @returns The axis's index, or `-1` when the press landed between two of them.
 */
export function parallelAxisNear(
  x: number,
  axes: readonly ParallelAxisLayout[],
): number {
  let nearest = -1;
  let nearestDistance = PARALLEL_BRUSH_HALF_WIDTH;
  for (let index = 0; index < axes.length; index++) {
    const axis = axes[index];
    if (axis === undefined) continue;
    const distance = Math.abs(x - axis.x);
    if (distance <= nearestDistance) {
      nearestDistance = distance;
      nearest = index;
    }
  }
  return nearest;
}

/**
 * One axis, by the id a range is keyed on.
 * @param axes - The axes, from left to right.
 * @param axisId - The id to find.
 * @returns The axis, or `undefined` when it is no longer drawn.
 */
export function parallelAxisById(
  axes: readonly ParallelAxisLayout[],
  axisId: string,
): ParallelAxisLayout | undefined {
  for (const axis of axes) {
    if (axis.id === axisId) return axis;
  }
  return undefined;
}

/**
 * The bands to draw on each axis: the one being dragged where there is one,
 * and the intervals in force everywhere else.
 * @param axes - The axes, from left to right.
 * @param ranges - What each axis keeps: one interval, several, or none.
 * @param draft - The band being dragged, or `null` when nothing is.
 * @returns The bands, keyed by axis id; an axis with none is left out. The
 * band being dragged replaces the interval it came from rather than being
 * drawn beside it, so an interval never appears twice mid-gesture.
 */
export function parallelBandsOf(
  axes: readonly ParallelAxisLayout[],
  ranges: ParallelRanges,
  draft: ParallelDraft | null,
): ReadonlyMap<string, ParallelBand[]> {
  const drawn = new Map<string, ParallelBand[]>();
  for (const axis of axes) {
    const list = parallelRangeList(ranges[axis.id]);
    const dragging = draft !== null && draft.axis === axis.id;
    const bands: ParallelBand[] = [];
    for (let index = 0; index < list.length; index++) {
      if (dragging && index === draft.index) continue;
      bands.push(parallelBandOf(list[index] as ParallelRange, axis));
    }
    if (dragging) bands.push(draft.band);
    if (bands.length > 0) drawn.set(axis.id, bands);
  }
  return drawn;
}

/** What a released band does to the intervals its axis already kept. */
export interface ParallelCommit {
  /** The intervals in force on that axis. */
  list: readonly ParallelRange[];
  /** Which of them the drag took hold of, or `-1` when it began a new one. */
  index: number;
  /** The band as the pointer left it. */
  band: ParallelBand;
  /** The axis it is on, to read the band back into its own units. */
  layout: ParallelAxisLayout;
  /** Whether the press took an interval and let it go without moving it. */
  still: boolean;
  /** Whether the axis may keep more than one interval. */
  several: boolean;
}

/**
 * The intervals an axis keeps once a band has been let go.
 *
 * A press that keeps nothing is a click, and a click says "take this away":
 * the interval under the pointer when it landed on one, and every interval on
 * the axis when it landed on bare axis. That is the only way to be rid of one
 * interval on an axis carrying four, and it is the gesture that already
 * cleared an axis before it could carry more than one.
 * @param commit - See {@link ParallelCommit}.
 * @returns The intervals, sorted and disjoint.
 */
export function parallelCommitOf(commit: ParallelCommit): ParallelRange[] {
  const { list, index, band, layout, still, several } = commit;
  if (still) return parallelWriteRange(list, index, null);
  if (!parallelIsBand(band)) {
    return index === -1 ? [] : parallelWriteRange(list, index, null);
  }
  const range = parallelRangeOf(band, layout);
  if (!several && index === -1) return [range];
  return parallelWriteRange(list, index, range);
}
