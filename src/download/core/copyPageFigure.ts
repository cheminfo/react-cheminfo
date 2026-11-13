/**
 * The page's figure put on the clipboard, as a host would take it: the SVG the
 * page draws, saying where it came from and what it was drawn from, and a PNG
 * painted from it. Pasted into draw or write, it is a figure a double click
 * opens again on the site that drew it.
 */

import type { FigureNotice } from './copyFigure.ts';
import { copyFigure } from './copyFigure.ts';
import { rasterFigureSource, svgFigure } from './croppedMarkup.ts';
import { figurePng } from './figurePng.ts';
import { DEFAULT_FIGURE_SCALE } from './figureScale.ts';
import { withPageFigureSource } from './pageFigureSource.ts';

/**
 * Draws the page's figure as an SVG document, or resolves to `undefined` when
 * the page shows none yet.
 */
export type PageFigureWriter = () => Promise<string | undefined>;

/** What a figure that was never drawn rejects with, so nothing is said. */
class NothingToCopy extends Error {}

/**
 * Put the page's figure on the clipboard. Call it from the key or the click
 * itself: the write is started before anything is awaited, as Safari demands.
 * @param write - Draws the figure.
 * @returns `copied`, `copyUnsupported` where the clipboard takes no picture,
 * or `undefined` when the page had no figure to copy.
 * @throws {Error} When the figure could not be drawn or painted.
 */
export async function copyPageFigure(
  write: PageFigureWriter,
): Promise<FigureNotice | undefined> {
  const drawn = write().then((svg) => {
    if (svg === undefined) throw new NothingToCopy('The page shows no figure.');
    return svg;
  });
  const figure = drawn.then((svg) => withPageFigureSource(svg));
  const png = drawn.then((svg) => {
    const sized = svgFigure(svg);
    if (sized === undefined) {
      throw new Error('The figure states no size, so it cannot be painted.');
    }
    // A picture of a picture gains nothing from more pixels than it holds.
    const scale = rasterFigureSource(svg) ? 1 : DEFAULT_FIGURE_SCALE;
    return figurePng(sized, scale);
  });
  try {
    return await copyFigure(png, figure);
  } catch (error) {
    if (error instanceof NothingToCopy) return undefined;
    throw error;
  }
}
