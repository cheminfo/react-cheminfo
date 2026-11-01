/**
 * Where a rendered picture is painted: the box holding every pixel that
 * differs from its background, the background being the colour its four
 * corners share.
 */

import type { SvgBox } from './svgBounds.ts';

/**
 * How far a channel may stray from the background and still be background:
 * the noise antialiasing and shading leave in an empty margin.
 */
const TOLERANCE = 8;

/** The margin kept around what is painted, as a share of its longest side. */
const MARGIN = 0.02;

/**
 * The part of a rendered picture worth keeping: what is painted on it, with a
 * thin margin.
 *
 * A 3D viewer or a chart renders the whole of the pane it sits in, and most of
 * that pane is background. The background is read off the corners rather than
 * assumed, so a white pane, a transparent one and a coloured slide are all
 * told apart from what is drawn on them.
 * @param pixels - The picture's RGBA values, row by row, as `ImageData` holds
 *   them.
 * @param width - Its width, in pixels.
 * @param height - Its height, in pixels.
 * @returns The box, in pixels, or `null` when there is nothing to take away:
 *   the corners disagree, so there is no background to tell apart, nothing is
 *   painted on the background, or the painting already fills the picture.
 */
export function paintedBox(
  pixels: ArrayLike<number>,
  width: number,
  height: number,
): SvgBox | null {
  if (width < 1 || height < 1) return null;
  const background = cornerBackground(pixels, width, height);
  if (background === null) return null;
  const transparent = (background[3] ?? 0) <= TOLERANCE;
  let left = width;
  let right = -1;
  let top = height;
  let bottom = -1;
  for (let y = 0; y < height; y++) {
    const row = y * width * 4;
    for (let x = 0; x < width; x++) {
      const at = row + x * 4;
      const painted = transparent
        ? (pixels[at + 3] ?? 0) > TOLERANCE
        : differs(pixels, at, background);
      if (!painted) continue;
      if (x < left) left = x;
      if (x > right) right = x;
      if (y < top) top = y;
      if (y > bottom) bottom = y;
    }
  }
  if (right < 0) return null;
  const margin = Math.max(
    1,
    Math.round(MARGIN * Math.max(right - left + 1, bottom - top + 1)),
  );
  const x = Math.max(0, left - margin);
  const y = Math.max(0, top - margin);
  const box = {
    x,
    y,
    width: Math.min(width, right + 1 + margin) - x,
    height: Math.min(height, bottom + 1 + margin) - y,
  };
  return box.width === width && box.height === height ? null : box;
}

function cornerBackground(
  pixels: ArrayLike<number>,
  width: number,
  height: number,
): number[] | null {
  const background = [
    pixels[0] ?? 0,
    pixels[1] ?? 0,
    pixels[2] ?? 0,
    pixels[3] ?? 0,
  ];
  const corners = [
    (width - 1) * 4,
    (height - 1) * width * 4,
    ((height - 1) * width + width - 1) * 4,
  ];
  for (const corner of corners) {
    if (differs(pixels, corner, background)) return null;
  }
  return background;
}

function differs(
  pixels: ArrayLike<number>,
  at: number,
  background: readonly number[],
): boolean {
  for (let channel = 0; channel < 4; channel++) {
    const delta = (pixels[at + channel] ?? 0) - (background[channel] ?? 0);
    if (Math.abs(delta) > TOLERANCE) return true;
  }
  return false;
}
