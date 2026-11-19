/**
 * What an SVG document says about itself, read from its text without a
 * browser: the size it asks to be drawn at, and the attributes of its root.
 */

import type { SvgBox } from './svgBounds.ts';

/** A width and a height, in points. */
export interface SvgSize {
  /** Width, in points. */
  width: number;
  /** Height, in points. */
  height: number;
}

/** Points in a CSS pixel, the unit of a length written without one. */
const PIXEL = 0.75;

/** The size a browser gives an SVG that states none, in CSS pixels. */
const DEFAULT_SIZE = { width: 300, height: 150 };

/** Points in one unit of each length an SVG may state its size in. */
const POINTS_PER_UNIT: Readonly<Record<string, number>> = {
  '': PIXEL,
  px: PIXEL,
  pt: 1,
  pc: 12,
  in: 72,
  cm: 72 / 2.54,
  mm: 72 / 25.4,
  q: 72 / 101.6,
  em: 12,
  ex: 6,
};

/**
 * The size an SVG asks to be drawn at: its width and height, completed from
 * its view box when one of them is missing, or a browser's 300 × 150 pixels.
 * @param svg - The SVG document.
 * @returns Its size, in points.
 */
export function svgSizeInPoints(svg: string): SvgSize {
  const root = svgRootTag(svg);
  const width = lengthInPoints(svgAttribute(root, 'width'));
  const height = lengthInPoints(svgAttribute(root, 'height'));
  const box = svgViewBox(svgAttribute(root, 'viewBox'));
  if (width && height) return { width, height };
  if (box) {
    if (width) return { width, height: (width * box.height) / box.width };
    if (height) return { width: (height * box.width) / box.height, height };
    return { width: box.width * PIXEL, height: box.height * PIXEL };
  }
  return {
    width: width ?? DEFAULT_SIZE.width * PIXEL,
    height: height ?? DEFAULT_SIZE.height * PIXEL,
  };
}

/**
 * The opening tag of an SVG's root element.
 * @param svg - The SVG document.
 * @returns The tag, or an empty string when there is none.
 */
export function svgRootTag(svg: string): string {
  return /<svg\b[^>]*>/i.exec(svg)?.[0] ?? '';
}

/**
 * The value of an attribute written in a tag.
 * @param tag - The tag.
 * @param name - The attribute.
 * @returns Its value, or `undefined` when the tag does not write it.
 */
export function svgAttribute(tag: string, name: string): string | undefined {
  const pattern = new RegExp(
    String.raw`\s${name}\s*=\s*(?:"(?<double>[^"]*)"|'(?<single>[^']*)')`,
  );
  const groups = pattern.exec(tag)?.groups;
  return groups?.double ?? groups?.single;
}

/**
 * A `viewBox` attribute read as a rectangle.
 * @param value - The attribute's value.
 * @returns The rectangle, or `undefined` when it is missing or draws nothing.
 */
export function svgViewBox(value: string | undefined): SvgBox | undefined {
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

function lengthInPoints(value: string | undefined): number | undefined {
  if (value === undefined) return undefined;
  const match =
    /^\s*(?<amount>[+]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?)\s*(?<unit>[a-z]*)\s*$/i.exec(
      value,
    );
  if (!match?.groups) return undefined;
  const factor = POINTS_PER_UNIT[match.groups.unit?.toLowerCase() ?? ''];
  const amount = Number(match.groups.amount);
  if (factor === undefined || !(amount > 0)) return undefined;
  return amount * factor;
}
