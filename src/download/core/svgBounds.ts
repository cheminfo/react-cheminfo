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

/**
 * The rectangle the element itself covers, rather than the marks inside it.
 *
 * A chart is drawn to the box it was given — its axes reach the edges of it and
 * its trace reaches wherever the data does — so the box is the picture, and
 * measuring the marks would crop the frame off it. It is measured where it is
 * on the page, and read off its own attributes where it is not: a picture of a
 * stacked editor is composed out of the panes rather than being any one element
 * on screen, so it never has a place on the page to be measured at and carries
 * the size it was composed at instead.
 * @param svg - The element to measure.
 * @returns The rectangle, or `null` when it is neither laid out nor sized.
 */
export function elementBox(svg: SVGSVGElement): SvgBox | null {
  const laidOut = svg.getBoundingClientRect();
  if (laidOut.width > 0 && laidOut.height > 0) {
    return { x: 0, y: 0, width: laidOut.width, height: laidOut.height };
  }

  const width = statedSide(svg, 'width');
  const height = statedSide(svg, 'height');
  if (width <= 0 || height <= 0) return null;
  return { x: 0, y: 0, width, height };
}

/**
 * A side the element states for itself, for one that is not on the page.
 * @param svg - The element.
 * @param name - Which side to read.
 * @returns Its length in drawing units, `0` when it states none.
 */
function statedSide(svg: SVGSVGElement, name: 'width' | 'height'): number {
  const stated = Number.parseFloat(svg.getAttribute(name) ?? '');
  return Number.isFinite(stated) ? stated : 0;
}
