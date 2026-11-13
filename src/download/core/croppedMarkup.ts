/**
 * The markup half of a figure crop, which needs no browser: reading the size
 * of an SVG and the image it holds, and narrowing a drawing's view box to a
 * part of it.
 */

import type { FigurePixels } from './figureScale.ts';
import type { FigureSvg } from './figureSvg.ts';
import type { SvgBox } from './svgBounds.ts';

/** An SVG whose only element is one image. */
const ONLY_IMAGE =
  /^\s*<svg\b[^>]*>\s*(?<image><image\b[^>]*?)\/?>\s*(?:<\/image>\s*)?<\/svg>\s*$/i;

/** The attributes that size the root of an SVG, which a crop rewrites. */
const SIZE_ATTRIBUTES = /\s(?:width|height|viewBox)\s*=\s*(?:"[^"]*"|'[^']*')/g;

/** The image a figure holds and nothing else. */
export interface RasterFigureSource {
  /** The image, as a `data:` URI. */
  source: string;
  /** The width it is drawn at, in pixels. */
  width: number;
  /** The height it is drawn at, in pixels. */
  height: number;
}

/**
 * The image an SVG holds and nothing else, drawn over the whole of it.
 * @param markup - The SVG document.
 * @returns The image, or `null` when the SVG draws anything else, draws the
 *   image elsewhere than over itself, or links to it rather than holding it.
 */
export function rasterFigureSource(markup: string): RasterFigureSource | null {
  const image = ONLY_IMAGE.exec(markup)?.groups?.image;
  if (image === undefined || /\s(?:x|y|transform)\s*=/.test(image)) {
    return null;
  }
  const root = rootTag(markup);
  const width = Number(attribute(image, 'width'));
  const height = Number(attribute(image, 'height'));
  if (!(width > 0 && height > 0)) return null;
  const sameSize =
    Number(attribute(root, 'width')) === width &&
    Number(attribute(root, 'height')) === height;
  const view = attribute(root, 'viewBox');
  const sameView =
    view === undefined ||
    view
      .trim()
      .split(/[\s,]+/)
      .map(Number)
      .join(' ') === `0 0 ${width} ${height}`;
  const source = (
    attribute(image, 'href') ?? attribute(image, 'xlink:href')
  )?.replaceAll('&amp;', '&');
  if (!sameSize || !sameView || !source?.startsWith('data:image/')) {
    return null;
  }
  return { source, width, height };
}

/**
 * An SVG document as a figure that can be painted: its markup and the size it
 * states, in pixels — its `width` and `height` when they are pixels, its view
 * box otherwise.
 * @param markup - The SVG document.
 * @returns The figure, or `undefined` when the SVG states no size in pixels.
 */
export function svgFigure(markup: string): FigureSvg | undefined {
  const root = rootTag(markup);
  const view = viewBoxOf(attribute(root, 'viewBox'));
  const width = pixels(attribute(root, 'width')) ?? view?.width;
  const height = pixels(attribute(root, 'height')) ?? view?.height;
  if (width === undefined || height === undefined) return undefined;
  return { markup, width: Math.ceil(width), height: Math.ceil(height) };
}

/**
 * A drawing showing only part of itself: its view box narrowed to that part,
 * and its size to the part's.
 * @param figure - The drawing.
 * @param box - The part kept, in pixels of the figure at its own size.
 * @returns The cropped figure, or `null` when its view box has proportions
 *   other than its own, so it is letterboxed and a part of the picture is no
 *   simple part of the view box.
 */
export function croppedSvgMarkup(
  figure: FigureSvg,
  box: SvgBox,
): FigureSvg | null {
  const root = rootTag(figure.markup);
  const view = viewBoxOf(attribute(root, 'viewBox')) ?? {
    x: 0,
    y: 0,
    width: figure.width,
    height: figure.height,
  };
  const unitsX = view.width / figure.width;
  const unitsY = view.height / figure.height;
  if (Math.abs(unitsX - unitsY) > 0.01 * unitsX) return null;
  const width = rounded(box.width);
  const height = rounded(box.height);
  const cropped = [
    view.x + box.x * unitsX,
    view.y + box.y * unitsY,
    box.width * unitsX,
    box.height * unitsY,
  ]
    .map((value) => rounded(value))
    .join(' ');
  const fixed = root
    .replaceAll(SIZE_ATTRIBUTES, '')
    .replace(
      /^<svg/i,
      `<svg width="${width}" height="${height}" viewBox="${cropped}"`,
    );
  return {
    markup: figure.markup.replace(root, () => fixed),
    width,
    height,
  };
}

/**
 * A drawing stated at another size: the same picture, its view box kept, so
 * it opens — and a PNG of it prints — at that size.
 * @param figure - The drawing.
 * @param size - The size it is stated at, in pixels.
 * @returns The resized figure.
 */
export function resizedSvgFigure(
  figure: FigureSvg,
  size: FigurePixels,
): FigureSvg {
  const root = rootTag(figure.markup);
  const view = viewBoxOf(attribute(root, 'viewBox')) ?? {
    x: 0,
    y: 0,
    width: figure.width,
    height: figure.height,
  };
  const width = rounded(size.width);
  const height = rounded(size.height);
  const box = [view.x, view.y, view.width, view.height]
    .map((value) => rounded(value))
    .join(' ');
  const fixed = root
    .replaceAll(SIZE_ATTRIBUTES, '')
    .replace(
      /^<svg/i,
      `<svg width="${width}" height="${height}" viewBox="${box}"`,
    );
  return { markup: figure.markup.replace(root, () => fixed), width, height };
}

/**
 * A number as SVG writes it: at most two decimals.
 * @param value - The number.
 * @returns The rounded number.
 */
export function rounded(value: number): number {
  const result = Math.round(value * 100) / 100;
  return Object.is(result, -0) ? 0 : result;
}

function rootTag(markup: string): string {
  return /<svg\b[^>]*>/i.exec(markup)?.[0] ?? '';
}

function attribute(tag: string, name: string): string | undefined {
  const pattern = new RegExp(
    String.raw`\s${name}\s*=\s*(?:"(?<double>[^"]*)"|'(?<single>[^']*)')`,
  );
  const groups = pattern.exec(tag)?.groups;
  return groups?.double ?? groups?.single;
}

function viewBoxOf(value: string | undefined): SvgBox | undefined {
  if (value === undefined) return undefined;
  const parts = value
    .trim()
    .split(/[\s,]+/)
    .map(Number);
  const [x, y, width, height] = parts;
  if (parts.length !== 4 || x === undefined || y === undefined) {
    return undefined;
  }
  if (!Number.isFinite(x) || !Number.isFinite(y)) return undefined;
  if (!width || !height || !(width > 0) || !(height > 0)) return undefined;
  return { x, y, width, height };
}

function pixels(value: string | undefined): number | undefined {
  const match = /^\s*(?<number>[\d.]+)\s*(?:px)?\s*$/.exec(value ?? '');
  const number = Number(match?.groups?.number);
  return number > 0 ? number : undefined;
}
