/**
 * The handles of a selected picture: a corner resizes it and keeps its
 * proportions, an edge stretches it along one side, and the round handle above
 * it turns it about its centre, by 15° steps. Shift frees the proportions and
 * the angle. Handles keep their size on screen, so where they sit depends on
 * the zoom.
 */

import type { DrawPicture } from './pictures.ts';
import {
  MIN_PICTURE_SIDE,
  drawingToPicture,
  normalizePicture,
  pictureCentre,
  pictureToDrawing,
} from './pictures.ts';
import { ROTATE_HANDLE_GAP } from './selectionFrame.ts';
import type { Point } from './types.ts';

/** A handle on the edge of a picture, or the one that turns it. */
export type PictureHandle =
  'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'rotate';

/** How far from a handle the pointer still takes it, in screen pixels. */
const HANDLE_REACH = 7;

/** The step a picture turns by unless Shift is held, in degrees. */
const ROTATION_STEP = 15;

/** Where each resizing handle sits, as signs of the half-sides. */
const SIGNS = {
  nw: { x: -1, y: -1 },
  n: { x: 0, y: -1 },
  ne: { x: 1, y: -1 },
  e: { x: 1, y: 0 },
  se: { x: 1, y: 1 },
  s: { x: 0, y: 1 },
  sw: { x: -1, y: 1 },
  w: { x: -1, y: 0 },
} as const satisfies Record<Exclude<PictureHandle, 'rotate'>, Point>;

const RESIZE_CURSORS = ['ew-resize', 'nwse-resize', 'ns-resize', 'nesw-resize'];

/**
 * Where the handles of a picture are drawn.
 * @param picture - The picture.
 * @param pixel - Points per screen pixel.
 * @returns Each handle and its centre, in points; the turning handle first.
 */
export function pictureHandles(
  picture: DrawPicture,
  pixel: number,
): Array<{ handle: PictureHandle; point: Point }> {
  const halfWidth = picture.width / 2;
  const halfHeight = picture.height / 2;
  const handles: Array<{ handle: PictureHandle; point: Point }> = [
    {
      handle: 'rotate',
      point: pictureToDrawing(picture, {
        x: 0,
        y: -halfHeight - ROTATE_HANDLE_GAP * pixel,
      }),
    },
  ];
  for (const [handle, sign] of Object.entries(SIGNS)) {
    handles.push({
      handle: handle as PictureHandle,
      point: pictureToDrawing(picture, {
        x: sign.x * halfWidth,
        y: sign.y * halfHeight,
      }),
    });
  }
  return handles;
}

/**
 * The handle of a picture under the pointer, if any.
 * @param picture - The picture.
 * @param point - The pointer, in points.
 * @param pixel - Points per screen pixel.
 * @returns The closest handle within reach, or undefined.
 */
export function pictureHandleAt(
  picture: DrawPicture,
  point: Point,
  pixel: number,
): PictureHandle | undefined {
  let best: PictureHandle | undefined;
  let bestDistance = HANDLE_REACH * pixel;
  for (const { handle, point: centre } of pictureHandles(picture, pixel)) {
    const value = Math.hypot(point.x - centre.x, point.y - centre.y);
    if (value <= bestDistance) {
      best = handle;
      bestDistance = value;
    }
  }
  return best;
}

/**
 * A picture with one of its handles dragged to a point.
 * @param picture - The picture as it was when the drag began.
 * @param handle - The handle dragged.
 * @param pointer - Where the pointer is, in points.
 * @param free - Whether Shift is held, which frees the proportions of a
 * corner and the angle of a turn.
 * @returns The picture.
 */
export function dragPictureHandle(
  picture: DrawPicture,
  handle: PictureHandle,
  pointer: Point,
  free: boolean,
): DrawPicture {
  if (handle === 'rotate') {
    const centre = pictureCentre(picture);
    const angle =
      (Math.atan2(pointer.y - centre.y, pointer.x - centre.x) * 180) / Math.PI +
      90;
    const rotation = free
      ? angle
      : Math.round(angle / ROTATION_STEP) * ROTATION_STEP;
    return normalizePicture({ ...picture, rotation });
  }
  const sign = SIGNS[handle];
  const local = drawingToPicture(picture, pointer);
  // The corner or the edge across from the handle stays where it is.
  const fixed = {
    x: (-sign.x * picture.width) / 2,
    y: (-sign.y * picture.height) / 2,
  };
  const reach = {
    x: (local.x - fixed.x) * sign.x,
    y: (local.y - fixed.y) * sign.y,
  };
  let { width, height } = picture;
  if (sign.x !== 0 && sign.y !== 0 && !free) {
    // The corner follows the pointer along the picture's diagonal.
    const scale = Math.max(
      (reach.x * width + reach.y * height) / (width * width + height * height),
      MIN_PICTURE_SIDE / Math.min(width, height),
    );
    width *= scale;
    height *= scale;
  } else {
    if (sign.x !== 0) width = Math.max(reach.x, MIN_PICTURE_SIDE);
    if (sign.y !== 0) height = Math.max(reach.y, MIN_PICTURE_SIDE);
  }
  const centre = pictureToDrawing(picture, {
    x: sign.x === 0 ? 0 : fixed.x + (sign.x * width) / 2,
    y: sign.y === 0 ? 0 : fixed.y + (sign.y * height) / 2,
  });
  return normalizePicture({
    ...picture,
    x: centre.x - width / 2,
    y: centre.y - height / 2,
    width,
    height,
  });
}

/**
 * The pointer's shape over a handle, following the picture's turn.
 * @param handle - The handle.
 * @param rotation - The picture's turn, in degrees; 0 by default.
 * @returns A CSS cursor.
 */
export function pictureHandleCursor(
  handle: PictureHandle,
  rotation = 0,
): string {
  if (handle === 'rotate') return 'grab';
  const sign = SIGNS[handle];
  const angle = (Math.atan2(sign.y, sign.x) * 180) / Math.PI + rotation;
  const step = Math.round(angle / 45);
  return RESIZE_CURSORS[((step % 4) + 4) % 4] as string;
}
