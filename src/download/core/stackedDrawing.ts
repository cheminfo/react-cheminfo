import { CHART_PANE_ATTRIBUTE } from '../../chart/core/chartPane.ts';

import { SVG_NAMESPACE } from './svgNamespace.ts';

/**
 * The drawing a picture of an editor is taken of, found in the box it sits in.
 *
 * A drawing is laid out again on every resize, so nothing is held onto but the
 * box, and what is in it is read at the moment a button is pressed. The box is
 * asked for rather than the whole editor because an editor is full of SVG —
 * every icon in every toolbar is one — and the first found in it would be a
 * picture of a magnifying glass.
 *
 * A box holding a stack of charts holds a drawing per pane, and the picture is
 * all of them: with a run open, a chromatogram stands over the spectrum taken
 * where its cursor is, and that pairing *is* the figure — a picture of the
 * chromatogram alone, saved under the spectrum's name, is the wrong answer to
 * every question it was asked. They are composed into one SVG here rather than
 * rasterized separately, so the same writers save it, at any resolution, as
 * either a PNG or a vector.
 * @param box - The box the drawing sits in, `null` before it is mounted.
 * @returns The drawing, the panes composed into one, or `null` when the box
 * holds nothing that has been laid out.
 */
export function drawingIn(box: HTMLElement | null): SVGSVGElement | null {
  if (box === null) return null;

  const panes = box.querySelectorAll<HTMLElement>(
    `[${CSS.escape(CHART_PANE_ATTRIBUTE)}]`,
  );
  if (panes.length === 0) return box.querySelector('svg');

  return stackDrawings(paneDrawings(panes));
}

/**
 * Compose several drawings into one, stacked in the order they were given.
 *
 * Each becomes a nested `<svg>` placed at the height the ones above it reached
 * and sized as it is on screen, which is what keeps its own `viewBox` scaling
 * right — a chart is drawn to the box it was given, so a pane copied at any
 * other size would have its axes stretched away from its trace. The composite
 * is never on the page, so it states its size in attributes: that is where
 * `elementBox` reads it back from.
 * @param drawings - What to stack, top to bottom.
 * @returns The composite, the single drawing it was handed unchanged, or `null`
 * when nothing among them has been laid out.
 */
export function stackDrawings(
  drawings: readonly SVGSVGElement[],
): SVGSVGElement | null {
  const first = drawings[0];
  if (first === undefined) return null;
  if (drawings.length === 1) return first;

  const stacked = document.createElementNS(SVG_NAMESPACE, 'svg');
  let width = 0;
  let top = 0;
  for (const drawing of drawings) {
    const rect = drawing.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) continue;

    const copy = drawing.cloneNode(true) as SVGSVGElement;
    if (!copy.hasAttribute('viewBox')) {
      copy.setAttribute(
        'viewBox',
        `0 0 ${round(rect.width)} ${round(rect.height)}`,
      );
    }
    copy.setAttribute('x', '0');
    copy.setAttribute('y', String(round(top)));
    copy.setAttribute('width', String(round(rect.width)));
    copy.setAttribute('height', String(round(rect.height)));
    stacked.append(copy);

    width = Math.max(width, rect.width);
    top += rect.height;
  }
  if (top <= 0) return null;

  stacked.setAttribute('width', String(round(width)));
  stacked.setAttribute('height', String(round(top)));
  stacked.setAttribute('viewBox', `0 0 ${round(width)} ${round(top)}`);
  return stacked;
}

/**
 * The drawing each pane of a stack holds.
 * @param panes - The pane boxes, top to bottom.
 * @returns One drawing per pane that holds one, in the order they are stacked.
 */
function paneDrawings(panes: Iterable<HTMLElement>): SVGSVGElement[] {
  const found: SVGSVGElement[] = [];
  for (const pane of panes) {
    const drawing = pane.querySelector('svg');
    if (drawing !== null) found.push(drawing);
  }
  return found;
}

/**
 * A coordinate of the composite, short enough to read.
 * @param value - The coordinate.
 * @returns It, to two decimals.
 */
function round(value: number): number {
  return Math.round(value * 100) / 100;
}
