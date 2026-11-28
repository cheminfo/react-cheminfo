/**
 * An SVG another program wrote — a spectrum copied out of NMRium, a figure
 * exported from a plotting library — recognised, measured in points, and made
 * to stand on its own as an image.
 */

import type { SvgSize } from '../../download/core/svgMarkup.ts';

import { startsWithRoot, withoutByteOrderMark } from './xmlTree.ts';

/**
 * Whether a text is an SVG another program wrote, which an editor places as a
 * picture rather than reads as one of its own drawings.
 * @param text - Any text.
 * @param isOwn - Whether an SVG is one the site wrote, which it reads again
 * as a drawing: its native SVG test.
 * @returns True for a whole SVG document that is not one of the site's own.
 */
export function isForeignSvg(
  text: string,
  isOwn: (svg: string) => boolean,
): boolean {
  const body = withoutByteOrderMark(text);
  return (
    startsWithRoot(body, 'svg') && /<\/svg\s*>\s*$/i.test(body) && !isOwn(body)
  );
}

/**
 * An SVG made to draw on its own as an image: the SVG namespace declared on
 * its root, the XLink one too when it uses it, and the one HTML entity an SVG
 * copied out of a web page carries most — `&nbsp;` — written as XML reads it.
 * Nothing else is changed: an image runs no script and fetches nothing, so the
 * SVG needs no cleaning to be safe.
 * @param svg - The SVG's text.
 * @returns The SVG's text, standing alone.
 */
export function svgAsImage(svg: string): string {
  const root = rootTag(svg);
  let fixed = root;
  if (!/\sxmlns\s*=/.test(root)) {
    fixed = fixed.replace(/^<svg/i, '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  if (/\sxlink:/.test(svg) && !/\sxmlns:xlink\s*=/.test(root)) {
    fixed = fixed.replace(
      /^<svg/i,
      '<svg xmlns:xlink="http://www.w3.org/1999/xlink"',
    );
  }
  const text = fixed === root ? svg : svg.replace(root, fixed);
  return text.replaceAll('&nbsp;', '&#160;').trim();
}

/**
 * A size made to fit a square, its proportions kept; a size already inside it
 * is kept as it is.
 * @param size - The size, in points.
 * @param largest - The longest side allowed, in points.
 * @returns The size, in points.
 */
export function fitSize(size: SvgSize, largest: number): SvgSize {
  const longest = Math.max(size.width, size.height);
  if (longest <= largest) return size;
  const factor = largest / longest;
  return { width: size.width * factor, height: size.height * factor };
}

function rootTag(svg: string): string {
  return /<svg\b[^>]*>/i.exec(svg)?.[0] ?? '';
}
