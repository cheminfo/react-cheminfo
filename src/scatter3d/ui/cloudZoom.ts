import { clamp } from '../../format/core/clamp.ts';

/**
 * How far the reader may stand back from the box, and how near they may get.
 *
 * A cloud without a zoom cannot be read where its groups overlap, which on a
 * projection is exactly where the reader is looking. The range is kept modest
 * at both ends: past four the frame is off the picture and there is nothing
 * left to say which way is which, and below four tenths the cloud is a smudge
 * in the middle of an empty box.
 */

/** How far the wheel may zoom out and in. */
export const CLOUD_ZOOM_RANGE = { min: 0.4, max: 4 } as const;

/**
 * A zoom held inside what the box can usefully be seen at.
 * @param zoom - The zoom asked for.
 * @returns The zoom to draw at; `1` for anything that is not a number.
 */
export function clampCloudZoom(zoom: number): number {
  return clamp(zoom, CLOUD_ZOOM_RANGE.min, CLOUD_ZOOM_RANGE.max, 1);
}
