/**
 * The frame around a selection and its handles, the same on every canvas of
 * the family: a corner scales everything selected about the corner across
 * from it, keeping its proportions, and the round handle above it turns it
 * about the frame's middle, by 15° steps; Shift frees the angle. A group is a
 * selection like any other, so it is scaled and turned the same way. Handles
 * keep their size on screen, so where they sit depends on the zoom.
 *
 * What the frame surrounds is the site's to measure — the box of what its
 * selection draws — and how each of its items takes a {@link Similarity} is
 * the site's too.
 */

import { roundCoordinate } from './geometry.ts';
import { normalizeDegrees } from './pictures.ts';
import type { Similarity } from './transform.ts';
import { pointMap } from './transform.ts';
import type { Box, Point } from './types.ts';

/** A corner of the frame, or the handle that turns it. */
export type FrameHandle = 'nw' | 'ne' | 'se' | 'sw' | 'rotate';

/** How far above a frame its turning handle sits, in screen pixels. */
export const ROTATE_HANDLE_GAP = 24;

/** How far the frame stands off what it frames, in screen pixels. */
const FRAME_GAP = 6;

/** How far from a handle the pointer still takes it, in screen pixels. */
const HANDLE_REACH = 7;

/** The step a selection turns by unless Shift is held, in degrees. */
const ROTATION_STEP = 15;

/** The smallest the longer side of a frame is scaled down to, in its units. */
const MIN_SIDE = 4;

/** Where each corner sits, as signs of the half-sides. */
const CORNERS = {
  nw: { x: -1, y: -1 },
  ne: { x: 1, y: -1 },
  se: { x: 1, y: 1 },
  sw: { x: -1, y: 1 },
} as const satisfies Record<Exclude<FrameHandle, 'rotate'>, Point>;

/**
 * The frame around the box of what a selection draws, standing off it.
 * @param box - The box of what the selection draws.
 * @param pixel - Units per screen pixel.
 * @returns The frame, or undefined when there is nothing a scale or a turn
 * would change.
 */
export function framedBox(
  box: Box | undefined,
  pixel: number,
): Box | undefined {
  if (!box || Math.max(box.width, box.height) < 1) return undefined;
  const gap = FRAME_GAP * pixel;
  return {
    x: box.x - gap,
    y: box.y - gap,
    width: box.width + 2 * gap,
    height: box.height + 2 * gap,
  };
}

/**
 * Where the handles of a frame are drawn.
 * @param frame - The frame.
 * @param pixel - Units per screen pixel.
 * @returns Each handle and its centre; the turning handle first.
 */
export function frameHandles(
  frame: Box,
  pixel: number,
): Array<{ handle: FrameHandle; point: Point }> {
  const handles: Array<{ handle: FrameHandle; point: Point }> = [
    {
      handle: 'rotate',
      point: {
        x: frame.x + frame.width / 2,
        y: frame.y - ROTATE_HANDLE_GAP * pixel,
      },
    },
  ];
  for (const [handle, sign] of Object.entries(CORNERS)) {
    handles.push({
      handle: handle as FrameHandle,
      point: cornerOf(frame, sign),
    });
  }
  return handles;
}

/**
 * The handle of a frame under the pointer, if any.
 * @param frame - The frame.
 * @param point - The pointer.
 * @param pixel - Units per screen pixel.
 * @returns The closest handle within reach, or undefined.
 */
export function frameHandleAt(
  frame: Box,
  point: Point,
  pixel: number,
): FrameHandle | undefined {
  let best: FrameHandle | undefined;
  let bestDistance = HANDLE_REACH * pixel;
  for (const { handle, point: centre } of frameHandles(frame, pixel)) {
    const value = Math.hypot(point.x - centre.x, point.y - centre.y);
    if (value <= bestDistance) {
      best = handle;
      bestDistance = value;
    }
  }
  return best;
}

/**
 * The scale or the turn a handle dragged from one point to another asks for.
 * @param frame - The frame as it was when the handle was taken.
 * @param handle - The handle.
 * @param start - Where the pointer took it.
 * @param pointer - Where the pointer is.
 * @param free - Whether Shift is held, which frees the angle of a turn.
 * @returns The transform.
 */
export function frameTransform(
  frame: Box,
  handle: FrameHandle,
  start: Point,
  pointer: Point,
  free: boolean,
): Similarity {
  if (handle === 'rotate') {
    const pivot = {
      x: frame.x + frame.width / 2,
      y: frame.y + frame.height / 2,
    };
    const turned =
      ((Math.atan2(pointer.y - pivot.y, pointer.x - pivot.x) -
        Math.atan2(start.y - pivot.y, start.x - pivot.x)) *
        180) /
      Math.PI;
    const rotation = free
      ? Math.round(turned * 10) / 10
      : Math.round(turned / ROTATION_STEP) * ROTATION_STEP;
    return { pivot, scale: 1, rotation: normalizeDegrees(rotation) };
  }
  const sign = CORNERS[handle];
  const pivot = cornerOf(frame, { x: -sign.x, y: -sign.y });
  const corner = cornerOf(frame, sign);
  const diagonal = { x: corner.x - pivot.x, y: corner.y - pivot.y };
  const reach =
    ((pointer.x - pivot.x) * diagonal.x + (pointer.y - pivot.y) * diagonal.y) /
    (diagonal.x * diagonal.x + diagonal.y * diagonal.y);
  const floor = MIN_SIDE / Math.max(frame.width, frame.height);
  const scale = Math.max(Math.round(reach * 1000) / 1000, floor);
  return { pivot, scale, rotation: 0 };
}

/**
 * The corners of a frame once a transform is applied, to draw it while a
 * handle is dragged.
 * @param frame - The frame.
 * @param transform - The transform.
 * @returns The four corners, in order around the frame.
 */
export function frameCorners(frame: Box, transform: Similarity): Point[] {
  const map = pointMap(transform);
  return [CORNERS.nw, CORNERS.ne, CORNERS.se, CORNERS.sw].map((sign) =>
    map(cornerOf(frame, sign)),
  );
}

/**
 * The pointer's shape over a handle.
 * @param handle - The handle.
 * @param held - Whether it is held.
 * @returns A CSS cursor.
 */
export function frameCursor(handle: FrameHandle, held: boolean): string {
  if (handle === 'rotate') return held ? 'grabbing' : 'grab';
  return handle === 'nw' || handle === 'se' ? 'nwse-resize' : 'nesw-resize';
}

function cornerOf(frame: Box, sign: Point): Point {
  return {
    x: roundCoordinate(frame.x + ((sign.x + 1) / 2) * frame.width),
    y: roundCoordinate(frame.y + ((sign.y + 1) / 2) * frame.height),
  };
}
