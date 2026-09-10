/**
 * Finding the drawings inside whatever the caller pointed at.
 *
 * A caller names a figure by the `id` of the box it is mounted in — never by
 * handing over an element it had to hold a ref to — because the box is
 * something a page already has a name for, and because the thing that saves
 * the figure is then free to sit anywhere on the page rather than inside the
 * component that drew it.
 */

import type { FigurePixels } from './figureScale.ts';

/** Chrome floating over a figure, which is not part of the picture. */
const CHROME = '[data-figure="chrome"]';

/** A key floating over a figure, which is. */
const LEGEND = '[data-figure="legend"]';

/** A figure's box on the page, in the coordinates a bounding box reports. */
export interface FigureBounds {
  /** Its left edge. */
  left: number;
  /** Its top edge. */
  top: number;
  /** Its width. */
  width: number;
  /** Its height. */
  height: number;
}

/**
 * The element a caller named.
 * @param target - The `id` of the box the figure is mounted in, or the element
 *   itself.
 * @returns The element.
 * @throws {Error} When no element on the page carries that `id`.
 */
export function figureElement(target: string | Element): Element {
  if (typeof target !== 'string') return target;
  // Escaped, because the ids React generates are not bare identifiers: a raw
  // `#«r3»-panel` is not a selector any browser will parse.
  const element = document.querySelector(`#${CSS.escape(target)}`);
  if (element === null) {
    throw new Error(`No element with the id ${target} to save.`);
  }
  return element;
}

/**
 * The drawings inside it, in the order they are painted.
 *
 * What is collected is every `<svg>` that is part of the picture: one for a
 * plain chart, sixteen for a pair grid. The glyphs of the controls floating
 * over a figure are `<svg>` too, so anything inside an element marked as
 * chrome is left behind — a cog saved into the middle of a scatter plot is the
 * bug this exists to prevent. A drawing with no area is left behind as well,
 * because a tab that is not showing is still in the document.
 * @param element - The box the figure is mounted in.
 * @returns The drawings.
 */
export function figureDrawings(element: Element): readonly SVGSVGElement[] {
  if (element.tagName.toLowerCase() === 'svg') {
    return [element as SVGSVGElement];
  }
  const drawings: SVGSVGElement[] = [];
  for (const drawing of element.querySelectorAll('svg')) {
    if (drawing.closest(CHROME) !== null) continue;
    if (isNested(drawings, drawing)) continue;
    const box = drawing.getBoundingClientRect();
    if (box.width <= 0 || box.height <= 0) continue;
    drawings.push(drawing);
  }
  return drawings;
}

/**
 * The keys inside it.
 *
 * A key is chrome — it is a filter the reader presses — and is therefore not
 * among the drawings, but it is still part of the picture: a saved figure
 * whose colours stand for nothing is not a figure. So it is collected
 * separately, to be redrawn over the drawings rather than copied with them.
 * @param element - The box the figure is mounted in.
 * @returns The keys, in the order they are painted.
 */
export function figureLegends(element: Element): readonly Element[] {
  const legends: Element[] = [];
  for (const legend of element.querySelectorAll(LEGEND)) {
    legends.push(legend);
  }
  return legends;
}

/**
 * The box every drawing of a figure fits in.
 * @param drawings - The drawings, as they sit on the page.
 * @returns The box, or one with no area where there are no drawings.
 */
export function figureBounds(drawings: readonly SVGSVGElement[]): FigureBounds {
  let left = Number.POSITIVE_INFINITY;
  let top = Number.POSITIVE_INFINITY;
  let right = Number.NEGATIVE_INFINITY;
  let bottom = Number.NEGATIVE_INFINITY;
  for (const drawing of drawings) {
    const box = drawing.getBoundingClientRect();
    if (box.left < left) left = box.left;
    if (box.top < top) top = box.top;
    if (box.right > right) right = box.right;
    if (box.bottom > bottom) bottom = box.bottom;
  }
  if (!Number.isFinite(left) || !Number.isFinite(top)) {
    return { left: 0, top: 0, width: 0, height: 0 };
  }
  return { left, top, width: right - left, height: bottom - top };
}

/**
 * How big the saved figure would be at its own size, for a control that has to
 * write the resulting file size before anybody presses save.
 * @param target - The `id` of the box the figure is mounted in, or the element.
 * @returns The size in pixels, or `null` where there is nothing to save.
 */
export function figureSize(target: string | Element): FigurePixels | null {
  let bounds: FigureBounds;
  try {
    bounds = figureBounds(figureDrawings(figureElement(target)));
  } catch {
    return null;
  }
  if (bounds.width <= 0 || bounds.height <= 0) return null;
  return {
    width: Math.round(bounds.width),
    height: Math.round(bounds.height),
  };
}

/**
 * Whether a drawing already sits inside one that was taken.
 * @param taken - The drawings collected so far.
 * @param drawing - The one being considered.
 * @returns Whether it is already part of the figure.
 */
function isNested(
  taken: readonly SVGSVGElement[],
  drawing: SVGSVGElement,
): boolean {
  for (const other of taken) {
    if (other.contains(drawing)) return true;
  }
  return false;
}
