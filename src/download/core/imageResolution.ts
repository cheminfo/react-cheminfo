/** How big a picture is written out, as a multiple of the size it is drawn at. */
export interface ImageResolution {
  /** Identifies the resolution in a picker. */
  id: string;
  /** What the option reads. */
  label: string;
  /** How many pixels each drawing unit becomes. */
  scale: number;
}

/**
 * The sizes a picture leaves the editor at.
 *
 * A drawing unit is about a screen pixel, so the multipliers read as what the
 * picture is for rather than as numbers: what is on screen, the same again on a
 * retina display, and the two steps up a figure needs to survive being printed
 * or thrown on a wall.
 */
export const IMAGE_RESOLUTIONS = [
  { id: 'screen', label: 'Screen (1×)', scale: 1 },
  { id: 'retina', label: 'Retina (2×)', scale: 2 },
  { id: 'print', label: 'Print (4×)', scale: 4 },
  { id: 'poster', label: 'Poster (8×)', scale: 8 },
] as const satisfies readonly ImageResolution[];

/** One of the resolutions offered. */
export type ImageResolutionId = (typeof IMAGE_RESOLUTIONS)[number]['id'];

/**
 * The resolution a picture is written out at unless another is picked: what is
 * on screen, doubled, which is what a picture pasted into a document wants.
 */
export const DEFAULT_IMAGE_RESOLUTION = IMAGE_RESOLUTIONS[1];

/**
 * Longest side a browser rasterizes reliably.
 *
 * Above roughly this, Safari and Chrome quietly hand back an empty canvas
 * instead of refusing, so the picture would be saved blank.
 */
const MAXIMUM_SIDE = 8192;

/** Most pixels a rasterized picture is allowed to hold. */
const MAXIMUM_PIXELS = 32 * 1024 * 1024;

/** How big a picture comes out, in pixels. */
export interface ImageSize {
  /** Width of the picture, in pixels. */
  width: number;
  /** Height of the picture, in pixels. */
  height: number;
  /**
   * What each drawing unit was actually worth. Below the resolution that was
   * asked for when it would have made a picture too big to rasterize.
   */
  scale: number;
}

/**
 * How big a rectangle of the drawing comes out at a given resolution.
 *
 * The resolution is a wish rather than an instruction: a wide glycan asked for
 * at 8× would run past what a browser can rasterize and come back blank, so the
 * scale is brought down until the picture fits instead. The scale it settled on
 * comes back with the size, so what will actually be written can be shown
 * before it is.
 * @param box - The rectangle being written out.
 * @param box.width - How wide it is, in drawing units.
 * @param box.height - How tall it is, in drawing units.
 * @param scale - How many pixels each drawing unit should become.
 * @returns The size, and the scale it was reached at.
 */
export function imageSize(
  box: { width: number; height: number },
  scale: number,
): ImageSize {
  const wanted = Number.isFinite(scale) && scale > 0 ? scale : 1;
  const width = Math.max(box.width, 1);
  const height = Math.max(box.height, 1);

  const limit = Math.min(
    MAXIMUM_SIDE / width,
    MAXIMUM_SIDE / height,
    Math.sqrt(MAXIMUM_PIXELS / (width * height)),
  );
  const used = Math.min(wanted, limit);
  // A picture held back by the limit is rounded down rather than to the nearest
  // pixel, so rounding cannot put it back over what it was held to.
  const toPixels = used < wanted ? Math.floor : Math.round;

  return {
    width: Math.max(1, toPixels(width * used)),
    height: Math.max(1, toPixels(height * used)),
    scale: used,
  };
}

/**
 * The resolution an identifier stands for.
 * @param id - What was picked.
 * @returns The resolution, falling back to the default one.
 */
export function imageResolution(id: string): ImageResolution {
  return (
    IMAGE_RESOLUTIONS.find((resolution) => resolution.id === id) ??
    DEFAULT_IMAGE_RESOLUTION
  );
}

/**
 * A size, written the way it is shown next to the resolution it comes from.
 * @param size - The size to write, `null` when nothing is drawn.
 * @returns The text, e.g. `1440 × 620 px`.
 */
export function formatImageSize(size: ImageSize | null): string {
  if (!size) return 'nothing to export';
  return `${size.width} × ${size.height} px`;
}
