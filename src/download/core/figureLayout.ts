/**
 * The shape a figure is drawn at before it is saved.
 *
 * A saved figure is the drawing the reader is looking at, so its proportions
 * are the proportions of the box it sits in. The resolution scales that
 * drawing — more pixels for a PNG, a larger page for an SVG — but leaves its
 * shape, and the size of its words against its axes, exactly as they were. A
 * figure for a slide or for a journal column wants another shape, and the only
 * way to give it one is to draw it again at that size, so its axes and labels
 * are laid out for the new box rather than stretched into it.
 */

import type { FigurePixels } from './figureScale.ts';

/** The shapes a figure can be drawn at for a file. */
export type FigureLayout = 'screen' | 'standard' | 'wide' | 'column' | 'custom';

/** The shapes, in the order they are offered. */
export const FIGURE_LAYOUTS = [
  'screen',
  'standard',
  'wide',
  'column',
  'custom',
] as const satisfies readonly FigureLayout[];

/**
 * How wide a journal's single column is, in CSS pixels: 8.5 cm at 96 pixels
 * per inch. A figure laid out at that width prints its text at the size it is
 * read at on screen, a 12 px label becoming a 9 pt one.
 */
export const FIGURE_COLUMN_WIDTH = 321;

/** The narrowest side a figure is drawn at, below which no chart has room for its axes. */
export const FIGURE_LAYOUT_MIN = 120;

/** The widest side a figure is drawn at: past it the page would be laying out a poster. */
export const FIGURE_LAYOUT_MAX = 4096;

/**
 * The size a figure is drawn at, in the shape the reader picked.
 *
 * The two slide shapes keep the width of the figure on screen and change its
 * height, since the width is what a page already gave it. The journal column
 * does the reverse: its width is fixed by the journal, and the figure keeps
 * the proportions it has on screen.
 * @param layout - The shape picked.
 * @param screen - The figure as it is drawn on the page.
 * @param custom - The size typed in, read only for `custom`. Defaults to the
 *   figure on screen.
 * @returns The size to draw it at, in whole pixels.
 */
export function figureLayoutSize(
  layout: FigureLayout,
  screen: FigurePixels,
  custom: FigurePixels = screen,
): FigurePixels {
  switch (layout) {
    case 'standard':
      return sized(screen.width, (screen.width * 3) / 4);
    case 'wide':
      return sized(screen.width, (screen.width * 9) / 16);
    case 'column':
      return sized(
        FIGURE_COLUMN_WIDTH,
        (FIGURE_COLUMN_WIDTH * screen.height) / Math.max(screen.width, 1),
      );
    case 'custom':
      return sized(custom.width, custom.height);
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
 * @param custom - The size typed in.
 * @returns Whether the size differs from the one on screen.
 */
export function figureLayoutRedraws(
  layout: FigureLayout,
  screen: FigurePixels,
  custom?: FigurePixels,
): boolean {
  const drawn = figureLayoutSize(layout, screen, custom);
  return drawn.width !== screen.width || drawn.height !== screen.height;
}

/**
 * A size, both sides held to the range.
 * @param width - The width asked for.
 * @param height - The height asked for.
 * @returns The size.
 */
function sized(width: number, height: number): FigurePixels {
  return { width: figureLayoutSide(width), height: figureLayoutSide(height) };
}
