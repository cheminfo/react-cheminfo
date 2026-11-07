/**
 * Saving a figure that is on the page, named by the box it is mounted in.
 *
 * Which of the two formats a reader wants is not a question the figure can
 * answer for them: an SVG is the one to put in a paper, where it stays sharp
 * at any size and can still be edited, and a PNG is the one every chat window,
 * slide deck and issue tracker actually accepts. So both are offered. The
 * resolution paints a PNG with more pixels, and makes an SVG open larger.
 */

import { downloadBlob } from './downloadBlob.ts';
import { figurePng } from './figurePng.ts';
import { defaultFigureScale } from './figureScale.ts';
import type { FigureSvg, FigureSvgOptions } from './figureSvg.ts';
import { FIGURE_SVG_TYPE, figureSvg } from './figureSvg.ts';
import { withPageFigureSource } from './pageFigureSource.ts';
import { sanitizeFileName } from './sanitizeFileName.ts';

/** Which file a figure is saved as. */
export type FigureFormat = 'svg' | 'png';

/** How a figure is saved. */
export interface DownloadFigureOptions extends FigureSvgOptions {
  /**
   * Which file to write.
   * @default 'png'
   */
  format?: FigureFormat;
  /**
   * How many pixels are painted per pixel on screen. An SVG is drawn the same
   * and opens this many times larger, which is the size a slide or a word
   * processor places it at.
   * @default 2 for a PNG, 1 for an SVG — which then opens at the size it has
   * on screen
   */
  scale?: number;
  /**
   * What the saved file is called, without its extension.
   * @default 'figure'
   */
  fileName?: string;
}

/** What a figure is called when the caller does not say. */
const DEFAULT_FILE_NAME = 'figure';

/**
 * Save the figure mounted in that box.
 * @param target - The `id` of the box, or the element itself.
 * @param options - See {@link DownloadFigureOptions}.
 * @throws {Error} When the box holds no figure, or the browser cannot paint it.
 */
export async function downloadFigure(
  target: string | Element,
  options: DownloadFigureOptions = {},
): Promise<void> {
  const file = await figureFile(target, options);
  downloadBlob(file, file.name);
}

/**
 * The file {@link downloadFigure} saves, for a caller that hands it elsewhere,
 * such as the share sheet.
 * @param target - The `id` of the box, or the element itself.
 * @param options - See {@link DownloadFigureOptions}.
 * @returns The file, named.
 * @throws {Error} When the box holds no figure, or the browser cannot paint it.
 */
export async function figureFile(
  target: string | Element,
  options: DownloadFigureOptions = {},
): Promise<File> {
  const { format = 'png', fileName = DEFAULT_FILE_NAME, background } = options;
  const scale = options.scale ?? defaultFigureScale(format);
  const name = sanitizeFileName(fileName, DEFAULT_FILE_NAME);

  if (format === 'svg') {
    const figure = figureSvg(target, { background, scale });
    const markup = await withPageFigureSource(figure.markup);
    return new File([markup], `${name}.svg`, { type: FIGURE_SVG_TYPE });
  }
  const figure = figureSvg(target, { background });
  const png = await figurePng(figure, scale);
  return new File([png], `${name}.png`, { type: png.type });
}

/**
 * Save a figure its page wrote as an SVG document itself, rather than one
 * copied off the page: a drawing whose file carries more than its picture.
 * The SVG is saved as written, at the size it states; the PNG is painted from
 * it at the multiple asked for.
 * @param figure - The document, and its size in pixels of the page.
 * @param options - Which file, at what multiple, and its name; a background
 * is the document's own business.
 * @throws {Error} When the browser cannot paint it.
 */
export async function downloadFigureSvg(
  figure: FigureSvg,
  options: Omit<DownloadFigureOptions, 'background'> = {},
): Promise<void> {
  const file = await figureSvgFile(figure, options);
  downloadBlob(file, file.name);
}

/**
 * The file {@link downloadFigureSvg} saves, for a caller that hands it
 * elsewhere, such as the share sheet.
 * @param figure - The document, and its size in pixels of the page.
 * @param options - Which file, at what multiple, and its name.
 * @returns The file, named.
 * @throws {Error} When the browser cannot paint it.
 */
export async function figureSvgFile(
  figure: FigureSvg,
  options: Omit<DownloadFigureOptions, 'background'> = {},
): Promise<File> {
  const { format = 'png', fileName = DEFAULT_FILE_NAME } = options;
  const name = sanitizeFileName(fileName, DEFAULT_FILE_NAME);
  if (format === 'svg') {
    const markup = await withPageFigureSource(figure.markup);
    return new File([markup], `${name}.svg`, { type: FIGURE_SVG_TYPE });
  }
  const scale = options.scale ?? defaultFigureScale(format);
  const png = await figurePng(figure, scale);
  return new File([png], `${name}.png`, { type: png.type });
}
