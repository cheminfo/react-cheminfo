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
import type { FigureSvgOptions } from './figureSvg.ts';
import { FIGURE_SVG_TYPE, figureSvg } from './figureSvg.ts';
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
  const { format = 'png', fileName = DEFAULT_FILE_NAME, background } = options;
  const scale = options.scale ?? defaultFigureScale(format);

  const name = sanitizeFileName(fileName, DEFAULT_FILE_NAME);

  if (format === 'svg') {
    const figure = figureSvg(target, { background, scale });
    const blob = new Blob([figure.markup], { type: FIGURE_SVG_TYPE });
    downloadBlob(blob, `${name}.svg`);
    return;
  }
  const figure = figureSvg(target, { background });
  downloadBlob(await figurePng(figure, scale), `${name}.png`);
}
