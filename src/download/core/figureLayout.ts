/**
 * The width a figure is saved at.
 *
 * A saved figure is the drawing the reader is looking at, so its proportions
 * are the proportions of the box it sits in, whatever width it is saved at.
 * The width is what a document asks for — a journal column, a full page —
 * and the resolution then says how many pixels a PNG spends on it. A drawing
 * is scaled to that width; a chart that can be laid out again is drawn again
 * at it, so its axes and labels keep the size they read on screen.
 */

import type { FigurePixels } from './figureScale.ts';

/** The widths a figure can be saved at. */
export type FigureLayout = 'screen' | 'column' | 'double' | 'custom';

/** The widths, in the order they are offered. */
export const FIGURE_LAYOUTS = [
  'screen',
  'column',
  'double',
  'custom',
] as const satisfies readonly FigureLayout[];

/**
 * How wide a journal's single column is, in CSS pixels: 8.5 cm at 96 pixels
 * per inch. A figure laid out at that width prints its text at the size it is
 * read at on screen, a 12 px label becoming a 9 pt one.
 */
export const FIGURE_COLUMN_WIDTH = 321;

/** How wide a figure across a journal's two columns is: 17.5 cm. */
export const FIGURE_DOUBLE_COLUMN_WIDTH = 661;

/** The narrowest side a figure is drawn at, below which no chart has room for its axes. */
export const FIGURE_LAYOUT_MIN = 120;

/** The widest side a figure is drawn at: past it the page would be laying out a poster. */
export const FIGURE_LAYOUT_MAX = 4096;

/**
 * The size a figure is saved at, at the width picked and in the proportions
 * it has on screen.
 * @param layout - The width picked.
 * @param screen - The figure as it is drawn on the page.
 * @param customWidth - The width typed, read only for `custom`. Defaults to
 *   the figure on screen.
 * @returns The size, in whole pixels.
 */
export function figureLayoutSize(
  layout: FigureLayout,
  screen: FigurePixels,
  customWidth: number = screen.width,
): FigurePixels {
  switch (layout) {
    case 'column':
      return keepingShape(FIGURE_COLUMN_WIDTH, screen);
    case 'double':
      return keepingShape(FIGURE_DOUBLE_COLUMN_WIDTH, screen);
    case 'custom':
      return keepingShape(customWidth, screen);
    case 'screen':
      return { width: screen.width, height: screen.height };
    default:
      throw new Error(`unknown figure layout: ${String(layout)}`);
  }
}

/**
 * One side, held to the range a figure can be drawn at.
 * @param value - What was asked for, typed or computed.
 * @returns A whole number of pixels, inside the range.
 */
export function figureLayoutSide(value: number): number {
  if (!Number.isFinite(value)) return FIGURE_LAYOUT_MIN;
  return Math.min(
    FIGURE_LAYOUT_MAX,
    Math.max(FIGURE_LAYOUT_MIN, Math.round(value)),
  );
}

/**
 * Whether a figure is drawn again for the file, rather than copied as it is.
 * @param layout - The shape picked.
 * @param screen - The figure as it is drawn on the page.
 * @param customWidth - The width typed in.
 * @returns Whether the size differs from the one on screen.
 */
export function figureLayoutRedraws(
  layout: FigureLayout,
  screen: FigurePixels,
  customWidth?: number,
): boolean {
  const drawn = figureLayoutSize(layout, screen, customWidth);
  return drawn.width !== screen.width || drawn.height !== screen.height;
}

/**
 * A width, held to the range, and the height that keeps the figure's
 * proportions.
 * @param width - The width asked for.
 * @param screen - The figure on screen.
 * @returns The size.
 */
function keepingShape(width: number, screen: FigurePixels): FigurePixels {
  const side = figureLayoutSide(width);
  return {
    width: side,
    height: figureLayoutSide(
      (side * screen.height) / Math.max(screen.width, 1),
    ),
  };
}
