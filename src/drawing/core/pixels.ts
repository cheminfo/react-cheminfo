import type { Box } from './types.ts';

/** The size of an image, in pixels. */
export interface PixelSize {
  /** Columns. */
  width: number;
  /** Rows. */
  height: number;
}

/**
 * The whole pixels a box covers inside an image: the box grown out to the
 * pixel corners around it, then clipped to the image — the pixels a view, a
 * shape or a crop reads. A box at x 0.9, 10 wide, covers 11 columns.
 * @param box - The box, image pixels; its corner may sit between pixels.
 * @param size - The image's size; `Infinity` leaves a side unbounded.
 * @returns The pixels, or `null` when the box covers none of the image.
 */
export function coveredPixels(box: Box, size: PixelSize): Box | null {
  const left = Math.max(0, Math.floor(box.x));
  const top = Math.max(0, Math.floor(box.y));
  const right = Math.min(size.width, Math.ceil(box.x + box.width));
  const bottom = Math.min(size.height, Math.ceil(box.y + box.height));
  if (right <= left || bottom <= top) return null;
  return { x: left, y: top, width: right - left, height: bottom - top };
}
