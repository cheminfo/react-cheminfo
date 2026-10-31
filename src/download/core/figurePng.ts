/**
 * A figure painted into pixels, at whatever resolution the reader asked for.
 *
 * The picture is drawn once as an SVG and then rasterized from it, rather than
 * being drawn a second time into a canvas: a figure that is saved has to be
 * the figure that was read, and two drawing paths are two things to keep in
 * step. Scaling is the browser's own, so a figure saved at three times is
 * genuinely three times the detail rather than a stretched screenshot.
 *
 * The file states its resolution, so a document places it at the size the
 * figure has on the page rather than at one pixel per point.
 */

import { figureDpi } from './figureDpi.ts';
import { DEFAULT_FIGURE_SCALE, figurePixels } from './figureScale.ts';
import type { FigureSvg } from './figureSvg.ts';
import { FIGURE_SVG_TYPE } from './figureSvg.ts';
import { withPngDpi } from './pngDpi.ts';

/** What a saved raster figure is. */
export const FIGURE_PNG_TYPE = 'image/png';

/**
 * The figure as a PNG.
 * @param figure - The figure, already copied off the page.
 * @param scale - How many pixels are painted per pixel on screen.
 * @returns The image, stating `96 × scale` dots per inch.
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

  const encoded = await encode(canvas);
  const png = new Uint8Array(await encoded.arrayBuffer());
  return new Blob([withPngDpi(png, figureDpi(scale))], {
    type: FIGURE_PNG_TYPE,
  });
}

/**
 * Where the browser reads an SVG document back from, to paint it.
 *
 * An object URL rather than a `data:` one, because a figure of a few thousand
 * dots runs to hundreds of kilobytes and a `data:` URL that long is refused
 * outright by some browsers — except for a document holding a
 * `<foreignObject>`, which is how native MathML sits in a chart. Chromium
 * taints any canvas that paints such a document read from an object URL, and
 * the figure then cannot be saved at all; read from a `data:` URL it paints
 * clean. Such a figure carries a handful of labels, far short of that length.
 * @param markup - The SVG document.
 * @returns The URL; one starting with `blob:` is revoked once read.
 */
export function svgImageUrl(markup: string): string {
  return markup.includes('<foreignObject')
    ? `data:${FIGURE_SVG_TYPE},${encodeURIComponent(markup)}`
    : URL.createObjectURL(new Blob([markup], { type: FIGURE_SVG_TYPE }));
}

/**
 * The SVG document, decoded and ready to be painted.
 * @param figure - The figure, already copied off the page.
 * @returns The decoded image.
 */
async function loadFigure(figure: FigureSvg): Promise<HTMLImageElement> {
  const url = svgImageUrl(figure.markup);
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
    if (url.startsWith('blob:')) URL.revokeObjectURL(url);
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
