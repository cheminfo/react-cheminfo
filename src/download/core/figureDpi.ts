/**
 * A figure's resolution stated in dots per inch.
 *
 * A pixel of the page is a ninety-sixth of an inch, by the definition of CSS,
 * so every figure on screen already has a printed size, and the multiple it is
 * painted at is a resolution in another unit: 1× is 96 dpi. A figure whose size
 * on the page is the size it prints at — a structure drawn to a journal's bond
 * length — is offered its resolution in dots per inch, which is what a journal
 * asks for; any other figure is offered multiples of what the reader sees.
 */

import type { FigurePixels } from './figureScale.ts';
import { figureScaleLabel } from './figureScale.ts';

/** How the resolution of a figure is offered. */
export type FigureResolutionUnit = 'multiple' | 'dpi';

/** How many pixels of the page make an inch. */
export const CSS_PIXELS_PER_INCH = 96;

/**
 * The dots per inch offered: a slide, a journal's halftone, its combination
 * art, and its line art.
 */
export const FIGURE_DPIS: readonly number[] = [150, 300, 600, 1200];

/** The dots per inch a figure with a printed size is saved at by default. */
export const DEFAULT_FIGURE_DPI = 300;

/** Centimetres in an inch. */
const CENTIMETRES_PER_INCH = 2.54;

/**
 * The multiple a figure is painted at to reach this many dots per inch.
 * @param dpi - Dots per inch.
 * @returns The multiple of its size on the page.
 */
export function dpiScale(dpi: number): number {
  return dpi / CSS_PIXELS_PER_INCH;
}

/**
 * The dots per inch a figure painted at this multiple has, when it is printed
 * at its size on the page.
 * @param scale - The multiple of its size on the page.
 * @returns Whole dots per inch.
 */
export function figureDpi(scale: number): number {
  return Math.round(scale * CSS_PIXELS_PER_INCH);
}

/**
 * The size a figure prints at.
 * @param size - Its size on the page, in pixels.
 * @returns Its width and height in centimetres.
 */
export function figureCentimetres(size: FigurePixels): FigurePixels {
  const factor = CENTIMETRES_PER_INCH / CSS_PIXELS_PER_INCH;
  return { width: size.width * factor, height: size.height * factor };
}

/**
 * The size a figure prints at, written out to a tenth of a centimetre.
 * @param size - Its size on the page, in pixels.
 * @param language - The language the numbers are written in.
 * @returns Its width and height in centimetres, as text: `8.5` or `8,5`.
 */
export function formatFigureCentimetres(
  size: FigurePixels,
  language: string,
): { width: string; height: string } {
  const printed = figureCentimetres(size);
  const format = new Intl.NumberFormat(language, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  return {
    width: format.format(printed.width),
    height: format.format(printed.height),
  };
}

/**
 * What a resolution reads on a button: `2×`, or `300 dpi`.
 * @param scale - The multiple of the figure's size on the page.
 * @param unit - How the resolution is offered.
 * @returns Its label.
 */
export function figureResolutionLabel(
  scale: number,
  unit: FigureResolutionUnit,
): string {
  return unit === 'dpi' ? `${figureDpi(scale)} dpi` : figureScaleLabel(scale);
}
