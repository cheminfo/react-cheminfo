/** A rectangle of an SVG, in the units the drawing is laid out in. */
export interface SvgBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Marks the group holding what a drawing is of, as opposed to its canvas. */
export const CONTENT_ATTRIBUTE = 'data-export-content';

/**
 * The rectangle the drawing itself occupies, rather than the one on screen.
 *
 * A canvas is mostly empty space to draw into: what is on screen is a window
 * over it, wherever it was last panned to and however far it was zoomed. None
 * of that belongs in a file, so a picture is written out from the drawing
 * outwards — the group it is drawn in is measured, and the window is ignored.
 * Whatever is written on it is measured with it, so a name hanging under the
 * bottom of the drawing is not cut off.
 *
 * An SVG that marks no such group — a molecule depiction, which is drawn to the
 * size of its box and nothing else — is measured whole. What is left out there
 * is only the room the drawing already left around itself.
 * @param svg - The element to measure, as it is rendered.
 * @param padding - Room left around the symbols, in drawing units. Defaults to
 *   `0`.
 * @returns The rectangle, or `null` when nothing is drawn or the element is not
 *   rendered — a measurement is only ever taken of something on screen.
 */
export function contentBox(svg: SVGSVGElement, padding = 0): SvgBox | null {
  const marked = svg.querySelector(`[${CSS.escape(CONTENT_ATTRIBUTE)}]`);
  const content = marked instanceof SVGGraphicsElement ? marked : svg;

  const box = content.getBBox();
  if (box.width <= 0 || box.height <= 0) return null;

  return {
    x: box.x - padding,
    y: box.y - padding,
    width: box.width + padding * 2,
    height: box.height + padding * 2,
  };
}

/** Room left around the marks of a drawing saved from what it is of. */
export const CONTENT_PADDING = 12;

/**
 * The part of a drawing a saved figure is made of, when the drawing says.
 *
 * Only a drawing that marks the group it is *of* is cropped: a canvas the
 * reader pans and zooms, whose window on screen is wherever it was last left.
 * Every other drawing is saved at the box it is drawn to, which is what a
 * chart is — its axes reach the edges of that box, and a crop to where its
 * trace happens to reach would leave them hanging.
 * @param svg - The drawing, as it is rendered.
 * @returns The rectangle to save, in drawing units, or `null` when the drawing
 *   marks no such group or nothing is drawn in it.
 */
export function drawingCrop(svg: SVGSVGElement): SvgBox | null {
  const marked = `[${CSS.escape(CONTENT_ATTRIBUTE)}]`;
  if (svg.querySelector(marked) === null) return null;
  return contentBox(svg, CONTENT_PADDING);
}
