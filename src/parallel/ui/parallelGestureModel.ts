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
} from '../core/parallelBrush.ts';
import type { ParallelRanges } from '../core/parallelTypes.ts';

/** A band being dragged, before the interval it keeps is reported. */
export interface ParallelDraft {
  /** The axis it is on. */
  axis: string;
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
 * The band to draw on each axis: the one being dragged where there is one, and
 * the interval in force everywhere else.
 * @param axes - The axes, from left to right.
 * @param ranges - The interval each axis keeps, or `null` for none.
 * @param draft - The band being dragged, or `null` when nothing is.
 * @returns The bands, keyed by axis id; an axis with none is left out.
 */
export function parallelBandsOf(
  axes: readonly ParallelAxisLayout[],
  ranges: ParallelRanges,
  draft: ParallelDraft | null,
): ReadonlyMap<string, ParallelBand> {
  const drawn = new Map<string, ParallelBand>();
  for (const axis of axes) {
    if (draft !== null && draft.axis === axis.id) {
      drawn.set(axis.id, draft.band);
      continue;
    }
    const range = ranges[axis.id];
    if (range === null || range === undefined) continue;
    drawn.set(axis.id, parallelBandOf(range, axis));
  }
  return drawn;
}
