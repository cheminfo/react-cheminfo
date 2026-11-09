/**
 * How large a rendered molecule is handed on as a figure — to a page that
 * frames the viewer, or into the file a site saves — and how it is encoded.
 *
 * The viewer fills its pane, so most of what it renders is background. A
 * figure keeps only the part holding the molecule, and keeps it no larger
 * than a slide or a printed page needs: a drawing places it a few centimetres
 * wide, where 1920 pixels is several times print resolution.
 */

import { clamp } from '../../format/core/clamp.ts';

import type { ImageSize } from './exportImage.ts';

/** The longest side of a figure's image, in pixels. */
export const FIGURE_LONGEST_SIDE = 1920;

/**
 * How a figure's image is encoded. A rendered molecule is smooth shading on
 * an opaque background, which JPEG keeps at a sixth of PNG's weight with no
 * difference to see.
 */
export const FIGURE_IMAGE_TYPE = 'image/jpeg';

/** The JPEG quality of a figure's image. */
export const FIGURE_IMAGE_QUALITY = 0.9;

/** A figure's image, rendered and encoded. */
export interface RenderedFigure {
  /** The image, as a `data:` URI. */
  dataUri: string;
  /** Its width, in pixels. */
  width: number;
  /** Its height, in pixels. */
  height: number;
}

/** Part of a frame, each side a fraction of the frame's, from its top left. */
export interface RelativeCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** A part of a frame, in pixels, from its top left. */
export interface PixelBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** The frame a figure is rendered in, and the part of it the figure keeps. */
export interface FigureFrame {
  /** The width of the whole frame, in pixels. */
  width: number;
  /** The height of the whole frame, in pixels. */
  height: number;
  /** The part kept. */
  viewport: PixelBox;
}

/**
 * The frame to render a figure in, so that the part of it holding the molecule
 * comes out no larger than `longest` on its longer side. The frame keeps the
 * viewer's shape, so the molecule is drawn exactly as it stands on screen; it
 * is only ever made smaller than asked, never larger.
 * @param size - The frame asked for, in pixels.
 * @param crop - The part holding the molecule, as fractions of the frame. A
 * crop with no area keeps the whole frame.
 * @param longest - The longest side the kept part may have, in pixels.
 * @returns The frame and the part of it kept.
 */
export function figureFrame(
  size: ImageSize,
  crop: RelativeCrop,
  longest: number,
): FigureFrame {
  const part = hasArea(crop) ? crop : { x: 0, y: 0, width: 1, height: 1 };
  const kept = Math.max(part.width * size.width, part.height * size.height);
  const factor = Math.min(1, longest / kept);
  const width = Math.max(1, Math.round(size.width * factor));
  const height = Math.max(1, Math.round(size.height * factor));
  const x = clamp(Math.floor(part.x * width), 0, width - 1);
  const y = clamp(Math.floor(part.y * height), 0, height - 1);
  return {
    width,
    height,
    viewport: {
      x,
      y,
      width: clamp(Math.round(part.width * width), 1, width - x),
      height: clamp(Math.round(part.height * height), 1, height - y),
    },
  };
}

function hasArea(crop: RelativeCrop): boolean {
  return (
    Number.isFinite(crop.x) &&
    Number.isFinite(crop.y) &&
    crop.width > 0 &&
    crop.height > 0
  );
}
