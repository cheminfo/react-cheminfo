/**
 * A figure painted into pixels, at whatever resolution the reader asked for.
 *
 * The picture is drawn once as an SVG and then rasterized from it, rather than
 * being drawn a second time into a canvas: a figure that is saved has to be
 * the figure that was read, and two drawing paths are two things to keep in
 * step. Scaling is the browser's own, so a figure saved at three times is
 * genuinely three times the detail rather than a stretched screenshot.
 */

import { DEFAULT_FIGURE_SCALE, figurePixels } from './figureScale.ts';
import type { FigureSvg } from './figureSvg.ts';
import { FIGURE_SVG_TYPE } from './figureSvg.ts';

/** What a saved raster figure is. */
export const FIGURE_PNG_TYPE = 'image/png';

/**
 * The figure as a PNG.
 * @param figure - The figure, already copied off the page.
 * @param scale - How many pixels are painted per pixel on screen.
 * @returns The image.
 * @throws {Error} When the browser cannot paint or encode it.
 */
export async function figurePng(
  figure: FigureSvg,
  scale: number = DEFAULT_FIGURE_SCALE,
): Promise<Blob> {
  const pixels = figurePixels(figure, scale);
  const drawing = await loadFigure(figure);

  const canvas = document.createElement('canvas');
  canvas.width = pixels.width;
  canvas.height = pixels.height;
  const context = canvas.getContext('2d');
  if (context === null) {
    throw new Error('This browser cannot paint the figure into an image.');
  }
  context.drawImage(drawing, 0, 0, pixels.width, pixels.height);

  return encode(canvas);
}

/**
 * The SVG document, decoded and ready to be painted.
 *
 * It goes through an object URL rather than a `data:` one because a figure of
 * a few thousand dots runs to hundreds of kilobytes, and a `data:` URL that
 * long is refused outright by some browsers.
 * @param figure - The figure, already copied off the page.
 * @returns The decoded image.
 */
async function loadFigure(figure: FigureSvg): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(
    new Blob([figure.markup], { type: FIGURE_SVG_TYPE }),
  );
  try {
    const image = new Image(figure.width, figure.height);
    await new Promise<void>((resolve, reject) => {
      image.addEventListener('load', () => resolve());
      image.addEventListener('error', () => {
        reject(new Error('The figure could not be read back as an image.'));
      });
      image.src = url;
    });
    return image;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * The painted canvas, as a file.
 * @param canvas - The canvas the figure was painted into.
 * @returns The image.
 */
function encode(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob === null) {
        reject(new Error('The figure could not be encoded as a PNG.'));
        return;
      }
      resolve(blob);
    }, FIGURE_PNG_TYPE);
  });
}
