/**
 * An SVG sized in points, 72 to the inch, as the figure the family's save
 * panel paints: the page counts 96 pixels to the inch, so the panel then
 * offers it in dots per inch, and a PNG painted from it states the resolution
 * it was painted at.
 */

import { CSS_PIXELS_PER_INCH } from './figureDpi.ts';
import type { FigureSvg } from './figureSvg.ts';
import { svgSizeInPoints } from './svgMarkup.ts';

/** Points in an inch. */
const POINTS_PER_INCH = 72;

/**
 * An SVG, with its size in pixels of the page.
 * @param svg - The SVG file's text, sized in points.
 * @returns The figure.
 */
export function pointsSvgFigure(svg: string): FigureSvg {
  const size = svgSizeInPoints(svg);
  const factor = CSS_PIXELS_PER_INCH / POINTS_PER_INCH;
  return {
    markup: svg,
    width: size.width * factor,
    height: size.height * factor,
  };
}
