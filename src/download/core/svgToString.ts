import type { SvgBox } from './svgBounds.ts';
import { SVG_NAMESPACE } from './svgNamespace.ts';

export interface SvgDocumentOptions {
  /**
   * The rectangle of the drawing to write out, in drawing units.
   * @default what the element is currently showing
   */
  box?: SvgBox | null;
  /**
   * How wide the document is, in pixels.
   * @default the width the element is drawn at
   */
  width?: number;
  /**
   * How tall the document is, in pixels.
   * @default the height the element is drawn at
   */
  height?: number;
  /**
   * What the document is read out as. Given one, the copy becomes a picture
   * rather than the thing on screen: it is no longer reachable by the keyboard,
   * and it is described as what it shows rather than as what could be done to
   * it.
   * @default the label the element already carries
   */
  label?: string;
}

/**
 * Write a rendered SVG element out as a standalone SVG document.
 *
 * On the page the element takes its size from the box it sits in, which is not
 * something that travels with it: opened on its own the same markup would be
 * sized by whatever it is opened in. The copy therefore carries a size, as
 * attributes, so the file is a picture rather than a drawing to be laid out
 * again.
 *
 * A rectangle can be given to write out part of the drawing — the symbols
 * rather than the canvas around them — and a size to write it out bigger than
 * it is on screen. Neither turns the picture into pixels: an SVG holds shapes,
 * so the numbers only say how big it opens.
 * @param svg - The element to write out, as it is rendered.
 * @param options - What part of it to write out, and how big.
 * @returns The SVG document, ready to be saved or rasterized.
 */
export function svgToString(
  svg: SVGSVGElement,
  options: SvgDocumentOptions = {},
): string {
  const { box = null, width, height, label } = options;

  const clone = svg.cloneNode(true) as SVGSVGElement;
  if (label !== undefined) {
    clone.setAttribute('role', 'img');
    clone.setAttribute('aria-label', label);
    // A canvas is focused to be drawn on; a file of it is only looked at.
    clone.removeAttribute('tabindex');
  }
  const rendered = svg.getBoundingClientRect();
  const drawnWidth = side(width ?? box?.width ?? rendered.width);
  const drawnHeight = side(height ?? box?.height ?? rendered.height);

  clone.setAttribute('xmlns', SVG_NAMESPACE);
  clone.setAttribute('width', String(drawnWidth));
  clone.setAttribute('height', String(drawnHeight));
  if (box) {
    clone.setAttribute(
      'viewBox',
      `${round(box.x)} ${round(box.y)} ${round(box.width)} ${round(box.height)}`,
    );
  } else if (!clone.hasAttribute('viewBox')) {
    clone.setAttribute('viewBox', `0 0 ${drawnWidth} ${drawnHeight}`);
  }

  return new XMLSerializer().serializeToString(clone);
}

/**
 * A side of the document, as an attribute takes it.
 * @param value - How long it is.
 * @returns Whole pixels, never zero: a document sized zero is an empty file.
 */
function side(value: number): number {
  return Math.max(1, Math.round(value));
}

/**
 * A drawing coordinate, short enough to read.
 * @param value - The coordinate.
 * @returns It, to two decimals.
 */
function round(value: number): number {
  return Math.round(value * 100) / 100;
}
