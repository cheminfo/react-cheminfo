/**
 * A figure cut down to what is painted on it. A 3D viewer or a chart renders
 * the whole of the pane it sits in; placed in a drawing or pasted in a slide,
 * the picture should be the size of the molecule or the plot, not of the pane
 * it was taken from.
 */

import { rasterSvgMarkup } from '../../molecule3d/core/exportImage.ts';

import type { RasterFigureSource } from './croppedMarkup.ts';
import {
  croppedSvgMarkup,
  rasterFigureSource,
  rounded,
} from './croppedMarkup.ts';
import { svgImageUrl } from './figurePng.ts';
import { readFigureSource, withFigureSource } from './figureSource.ts';
import { readFigureStates, statesOf } from './figureState.ts';
import type { FigureSvg } from './figureSvg.ts';
import { paintedBox } from './paintedBox.ts';

/** How much finer than its own size a drawing is painted to find its marks. */
const SCAN_SCALE = 2;

/** The longest side a drawing is painted at to find its marks, in pixels. */
const LARGEST_SCAN = 4096;

/**
 * A figure cut down to what is painted on it, with a thin margin.
 *
 * A figure holding one image — what a WebGL viewer hands back — is cut in its
 * pixels, so what is cut away is not carried along. Any other SVG keeps every
 * element and narrows its view box, so it stays a vector; a chart keeps its
 * axes, which are painted, and loses only the room around them.
 * @param figure - The figure.
 * @returns The cropped figure, or the figure as it came when it has no plain
 *   background to take away or cannot be painted: a crop never costs the
 *   picture.
 */
export async function cropFigure(figure: FigureSvg): Promise<FigureSvg> {
  try {
    const raster = rasterFigureSource(figure.markup);
    const cropped =
      raster === null ? await cropDrawing(figure) : await cropImage(raster);
    if (!cropped) return figure;
    // A figure that says where it came from still says it once cut down,
    // and still carries the state it opens again from.
    const source = readFigureSource(figure.markup);
    if (!source) return cropped;
    const carried = await readFigureStates(figure.markup, source.site);
    const markup = await withFigureSource(cropped.markup, {
      ...source,
      ...(carried === undefined ? {} : statesOf(carried)),
    });
    return { ...cropped, markup };
  } catch {
    return figure;
  }
}

async function cropImage(
  raster: RasterFigureSource,
): Promise<FigureSvg | null> {
  const image = await loadImage(raster.source);
  const width = image.naturalWidth;
  const height = image.naturalHeight;
  const box = paintedBox(paint(image, width, height), width, height);
  if (box === null) return null;
  const canvas = document.createElement('canvas');
  canvas.width = box.width;
  canvas.height = box.height;
  canvas
    .getContext('2d')
    ?.drawImage(
      image,
      box.x,
      box.y,
      box.width,
      box.height,
      0,
      0,
      box.width,
      box.height,
    );
  const scale = raster.width / width;
  const size = {
    width: rounded(box.width * scale),
    height: rounded(box.height * scale),
  };
  return {
    markup: rasterSvgMarkup(canvas.toDataURL('image/png'), size),
    ...size,
  };
}

async function cropDrawing(figure: FigureSvg): Promise<FigureSvg | null> {
  const scale = Math.min(
    SCAN_SCALE,
    LARGEST_SCAN / Math.max(figure.width, figure.height),
  );
  const columns = Math.max(1, Math.round(figure.width * scale));
  const rows = Math.max(1, Math.round(figure.height * scale));
  const url = svgImageUrl(figure.markup);
  try {
    const image = await loadImage(url);
    const box = paintedBox(paint(image, columns, rows), columns, rows);
    if (box === null) return null;
    const scaleX = columns / figure.width;
    const scaleY = rows / figure.height;
    return croppedSvgMarkup(figure, {
      x: box.x / scaleX,
      y: box.y / scaleY,
      width: box.width / scaleX,
      height: box.height / scaleY,
    });
  } finally {
    if (url.startsWith('blob:')) URL.revokeObjectURL(url);
  }
}

async function loadImage(url: string): Promise<HTMLImageElement> {
  const image = new Image();
  image.src = url;
  await image.decode();
  return image;
}

function paint(
  image: HTMLImageElement,
  width: number,
  height: number,
): Uint8ClampedArray {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (context === null) {
    throw new Error('This browser cannot paint the figure into an image.');
  }
  context.drawImage(image, 0, 0, width, height);
  return context.getImageData(0, 0, width, height).data;
}
