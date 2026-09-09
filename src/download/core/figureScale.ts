/**
 * How large a figure is saved.
 *
 * The resolution is offered as a multiple of the figure on screen rather than
 * as a pixel width, because the multiple is the part a reader has an opinion
 * about — one for a note, two for a slide, three or four for print — while the
 * pixel count is the consequence, and is written out beside it so nobody has
 * to work it out.
 */

/** The size of a saved figure, in pixels. */
export interface FigurePixels {
  /** Its width. */
  width: number;
  /** Its height. */
  height: number;
}

/** The multiples offered, from the figure as drawn to print resolution. */
export const FIGURE_SCALES: readonly number[] = [1, 2, 3, 4];

/**
 * The multiple a figure is saved at unless the reader says otherwise.
 *
 * Two rather than one: a figure saved at the size it was drawn looks soft on
 * every screen that is not the one it was drawn on, and a slide is where most
 * of these files end up.
 */
export const DEFAULT_FIGURE_SCALE = 2;

/**
 * The longest side a browser will paint into one canvas.
 *
 * Past it the canvas is silently blank rather than refused, which is the worst
 * of both — so a multiple that would cross it is offered greyed rather than
 * left to fail after the reader has pressed save.
 */
export const FIGURE_MAX_PIXELS = 16384;

/**
 * How big the saved file is, at this multiple.
 * @param size - The figure as it is drawn on the page.
 * @param scale - The multiple it is saved at.
 * @returns The size in pixels, whole numbers.
 */
export function figurePixels(size: FigurePixels, scale: number): FigurePixels {
  const factor = Number.isFinite(scale) && scale > 0 ? scale : 1;
  return {
    width: Math.max(1, Math.round(size.width * factor)),
    height: Math.max(1, Math.round(size.height * factor)),
  };
}

/**
 * Whether a browser can actually paint the figure at this multiple.
 * @param size - The figure as it is drawn on the page.
 * @param scale - The multiple it would be saved at.
 * @returns Whether the file would come out.
 */
export function figureScaleFits(size: FigurePixels, scale: number): boolean {
  const pixels = figurePixels(size, scale);
  return (
    pixels.width <= FIGURE_MAX_PIXELS && pixels.height <= FIGURE_MAX_PIXELS
  );
}

/**
 * What a multiple reads on a button: `2×`.
 * @param scale - The multiple.
 * @returns Its label.
 */
export function figureScaleLabel(scale: number): string {
  return `${scale}×`;
}

/**
 * What a size reads in a sentence: `1280 × 920 pixels`.
 * @param pixels - The size of the saved file.
 * @returns The measurement, written out.
 */
export function formatFigurePixels(pixels: FigurePixels): string {
  return `${pixels.width} × ${pixels.height} pixels`;
}
