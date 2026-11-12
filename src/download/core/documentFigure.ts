/**
 * A figure handed to a document — write, draw — drawn again at the size a
 * document places it at.
 *
 * A chart on the page is as wide as the window, and its type is sized for the
 * window. Copied as it is, a thousand-pixel chart placed in a 424-pixel column
 * shrinks its 12px tick labels to 5px. Scaling the copy cannot fix that, so a
 * page that hands figures to a host draws them again off the page at
 * {@link DOCUMENT_FIGURE_SIZE}, where the axes and labels are laid out for the
 * box they will be read in.
 */

import type { FigurePixels } from './figureScale.ts';
import type { FigureSvg, FigureSvgOptions } from './figureSvg.ts';
import { figureSvg } from './figureSvg.ts';
import { figureElement } from './figureTarget.ts';

/**
 * The size a figure is drawn at for a document: close to the 424 pixels write
 * starts a figure at, and well inside a draw page, so the chart's type lands
 * at the size it is read at on screen.
 */
export const DOCUMENT_FIGURE_SIZE: FigurePixels = { width: 480, height: 300 };

/** Draws a figure again at a size, and hands the box it was drawn in to `save`. */
export type DocumentFigureRedraw = (
  size: FigurePixels,
  save: (box: Element) => Promise<void>,
) => Promise<void>;

const redraws = new Map<string, DocumentFigureRedraw>();

/**
 * Say how the figure in a box is drawn again for a document.
 * @param id - The `id` of the box the figure is mounted in.
 * @param redraw - Draws it again, off the page.
 * @returns Takes the registration back, unless another has replaced it.
 */
export function registerDocumentFigure(
  id: string,
  redraw: DocumentFigureRedraw,
): () => void {
  redraws.set(id, redraw);
  return () => {
    if (redraws.get(id) === redraw) redraws.delete(id);
  };
}

/**
 * The figure in a box, as a document receives it: drawn again at
 * {@link DOCUMENT_FIGURE_SIZE} when the page registered a way to, copied as it
 * is on screen otherwise.
 * @param target - The `id` of the box the figure is mounted in, or the element.
 * @param options - See {@link FigureSvgOptions}.
 * @returns The figure.
 * @throws {Error} When the box holds no drawing to save.
 */
export async function documentFigureSvg(
  target: string | Element,
  options: FigureSvgOptions = {},
): Promise<FigureSvg> {
  const element = figureElement(target);
  const redraw = redraws.get(element.id);
  if (redraw === undefined) return figureSvg(element, options);
  let figure: FigureSvg | undefined;
  await redraw(DOCUMENT_FIGURE_SIZE, async (box) => {
    figure = figureSvg(box, options);
  });
  if (figure === undefined) {
    throw new Error('The figure could not be drawn for the document.');
  }
  return figure;
}
