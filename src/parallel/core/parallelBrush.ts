/**
 * The brush, as arithmetic rather than as a library.
 *
 * Everything a vertical brush does — create by dragging on a bare axis, move
 * the band, drag either edge, clear by pressing outside it — is four answers
 * to one question: which part of the axis the press landed on. Written this
 * way it is a pure function of a press and a pointer, so the whole gesture is
 * covered by tests in a runtime with no DOM at all, which is the one thing a
 * DOM-mutating brush could never be.
 */

import type { ParallelAxisLayout } from './parallelAxes.ts';
import { parallelValueToY, parallelYToValue } from './parallelAxes.ts';
import type { ParallelRange } from './parallelTypes.ts';

/** A band kept on one axis, in pixels from the top of the drawing area. */
export interface ParallelBand {
  /** The upper edge, which is the higher value. */
  top: number;
  /** The lower edge, which is the lower value. */
  bottom: number;
}

/** Which part of an axis a press landed on. */
export type ParallelBrushGrip = 'create' | 'move' | 'top' | 'bottom';

/** A drag in progress on one axis. */
export interface ParallelBrushDrag {
  /** The axis being brushed, by its id. */
  axis: string;
  /** Which of that axis's intervals is being written, or `-1` for a new one. */
  index: number;
  /** What the press took hold of. */
  grip: ParallelBrushGrip;
  /** Where the press landed, in pixels from the top of the drawing area. */
  originY: number;
  /** The band as it stood when the press landed. */
  origin: ParallelBand;
}

/** How close to an edge a press has to land to take hold of it, in pixels. */
export const PARALLEL_BRUSH_HANDLE_REACH = 4;

/** How tall a released band has to be to count as a band rather than a click. */
export const PARALLEL_BRUSH_SMALLEST = 1;

/** How far either side of an axis a press still reaches it, in pixels. */
export const PARALLEL_BRUSH_HALF_WIDTH = 9;

/**
 * How close to an axis's own end a band edge counts as standing on it.
 *
 * Half a pixel is below anything a pointer can aim at, and the two ends are
 * where the rows a reader most wants sit: the axes end exactly on the data,
 * so the extreme row is drawn on the end itself.
 */
const END_REACH = 0.5;

/**
 * What a press at that height takes hold of.
 * @param y - Where the press landed, in pixels from the top of the drawing area.
 * @param band - The band already on that axis, or `null` when it carries none.
 * @returns The grip. A press within {@link PARALLEL_BRUSH_HANDLE_REACH} of an
 * edge takes that edge, a press inside the band moves it, and anything else —
 * including a press on a bare axis — starts a new one.
 */
export function parallelBrushGrip(
  y: number,
  band: ParallelBand | null,
): ParallelBrushGrip {
  if (band === null) return 'create';
  if (Math.abs(y - band.top) <= PARALLEL_BRUSH_HANDLE_REACH) return 'top';
  if (Math.abs(y - band.bottom) <= PARALLEL_BRUSH_HANDLE_REACH) return 'bottom';
  if (y > band.top && y < band.bottom) return 'move';
  return 'create';
}

/** Which of an axis's bands a press took hold of, and by what. */
export interface ParallelBrushTarget {
  /** The band, as an index into the list, or `-1` when none was under it. */
  index: number;
  /** What the press took hold of. */
  grip: ParallelBrushGrip;
}

/** Nothing under the press, so it starts a band of its own. */
const NEW_BAND: ParallelBrushTarget = { index: -1, grip: 'create' };

/**
 * Which band a press at that height took hold of, on an axis carrying several.
 * @param y - Where the press landed, in pixels from the top of the drawing area.
 * @param bands - The bands on that axis, in any order.
 * @returns The band and the grip. An edge wins over the band it belongs to and
 * over any band it lies inside, so two bands dragged flush against each other
 * can still be pulled apart; a press on bare axis starts a new band.
 */
export function parallelBrushTarget(
  y: number,
  bands: readonly ParallelBand[],
): ParallelBrushTarget {
  let nearest = NEW_BAND;
  let nearestDistance = PARALLEL_BRUSH_HANDLE_REACH;
  for (let index = 0; index < bands.length; index++) {
    const band = bands[index] as ParallelBand;
    const toTop = Math.abs(y - band.top);
    if (toTop <= nearestDistance) {
      nearestDistance = toTop;
      nearest = { index, grip: 'top' };
    }
    const toBottom = Math.abs(y - band.bottom);
    if (toBottom <= nearestDistance) {
      nearestDistance = toBottom;
      nearest = { index, grip: 'bottom' };
    }
  }
  if (nearest !== NEW_BAND) return nearest;
  for (let index = 0; index < bands.length; index++) {
    const band = bands[index] as ParallelBand;
    if (y > band.top && y < band.bottom) return { index, grip: 'move' };
  }
  return NEW_BAND;
}

/**
 * The band a drag stands at, now that the pointer is there.
 * @param drag - The drag, as it began.
 * @param y - Where the pointer is, in pixels from the top of the drawing area.
 * @param height - Height of the drawing area, in pixels.
 * @returns The band, held inside the drawing area at both ends. Dragging one
 * edge past the other swaps them rather than inverting the band, and a band
 * being moved keeps its height rather than being squashed against an end.
 */
export function parallelBandAt(
  drag: ParallelBrushDrag,
  y: number,
  height: number,
): ParallelBand {
  const to = clamp(y, 0, height);
  if (drag.grip === 'create') return order(drag.originY, to);
  if (drag.grip === 'top') return order(to, drag.origin.bottom);
  if (drag.grip === 'bottom') return order(drag.origin.top, to);
  const shift = clamp(
    to - drag.originY,
    -drag.origin.top,
    height - drag.origin.bottom,
  );
  return {
    top: drag.origin.top + shift,
    bottom: drag.origin.bottom + shift,
  };
}

/**
 * Whether a released band keeps anything, or was a click that clears the axis.
 * @param band - The band, as the pointer left it.
 * @returns Whether it is tall enough to be an interval.
 */
export function parallelIsBand(band: ParallelBand): boolean {
  return band.bottom - band.top >= PARALLEL_BRUSH_SMALLEST;
}

/**
 * Where an interval sits on its axis, in pixels.
 * @param range - The interval, low value first.
 * @param axis - The axis it belongs to.
 * @returns The band.
 */
export function parallelBandOf(
  range: ParallelRange,
  axis: ParallelAxisLayout,
): ParallelBand {
  return order(
    parallelValueToY(range[1], axis),
    parallelValueToY(range[0], axis),
  );
}

/**
 * What interval a band keeps, in the axis's own units.
 * @param band - The band, in pixels from the top of the drawing area.
 * @param axis - The axis it belongs to.
 * @returns The interval, low value first — which is the order every filter in
 * the family reads, and getting it backwards keeps nothing at all. An edge
 * standing on an end of the axis reports that end verbatim: inverting the
 * placement is not exact, and one ulp is enough to drop the row the axis ends
 * on from its own full-range brush.
 */
export function parallelRangeOf(
  band: ParallelBand,
  axis: ParallelAxisLayout,
): ParallelRange {
  const low =
    band.bottom >= parallelValueToY(axis.min, axis) - END_REACH
      ? axis.min
      : parallelYToValue(band.bottom, axis);
  const high =
    band.top <= parallelValueToY(axis.max, axis) + END_REACH
      ? axis.max
      : parallelYToValue(band.top, axis);
  return low <= high ? [low, high] : [high, low];
}

function order(a: number, b: number): ParallelBand {
  return a <= b ? { top: a, bottom: b } : { top: b, bottom: a };
}

function clamp(value: number, low: number, high: number): number {
  if (value < low) return low;
  if (value > high) return high;
  return value;
}
