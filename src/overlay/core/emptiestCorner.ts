import type { OverlayCorner } from './overlayPlacement.ts';

/** What {@link emptiestCorner} has to know about the figure. */
export interface EmptiestCornerOptions {
  /** Width of the plot, in pixels. */
  width: number;
  /** Height of the plot, in pixels. */
  height: number;
  /**
   * Width the card is expected to take. It is an estimate on purpose: the card
   * has not been laid out when the corner is chosen.
   * @default 210
   */
  cardWidth?: number;
  /**
   * Height the card is expected to take.
   * @default 76
   */
  cardHeight?: number;
  /**
   * The corner kept when two are equally empty, which is the common case on a
   * sparse plot. Keeping a preference is what stops the card hopping between
   * corners as one point is added.
   * @default 'top-right'
   */
  preferred?: OverlayCorner;
}

/**
 * The corner of a plot with the fewest marks under it.
 *
 * A card in a fixed corner eventually sits on the one cluster the reader came
 * for. Counting first costs four comparisons per point, once per relayout, and
 * it is the difference between chrome and an obstruction.
 *
 * Ties are settled by a fixed order so the answer never depends on which mark
 * was read first: the preferred corner, then the one diagonally across from it,
 * then the remaining two clockwise from the top left. The diagonal comes second
 * because the preferred corner only loses when it holds marks, and the far side
 * of the plot is the least likely place for the rest of that same cluster.
 * @param x - Horizontal position of every mark, in pixels from the plot's left.
 * @param y - Vertical position of every mark, in pixels from the plot's top.
 * @param options - See {@link EmptiestCornerOptions}.
 * @returns The emptiest corner; the preferred one when several tie. An empty
 * plot, or one whose size has not been measured, is entirely empty and so
 * returns the preferred corner too.
 */
export function emptiestCorner(
  x: ArrayLike<number>,
  y: ArrayLike<number>,
  options: EmptiestCornerOptions,
): OverlayCorner {
  const {
    width,
    height,
    cardWidth = DEFAULT_CARD_WIDTH,
    cardHeight = DEFAULT_CARD_HEIGHT,
    preferred = 'top-right',
  } = options;

  const leftEdge = cardWidth;
  const rightEdge = width - cardWidth;
  const topEdge = cardHeight;
  const bottomEdge = height - cardHeight;

  const counts: Record<OverlayCorner, number> = {
    'top-left': 0,
    'top-right': 0,
    'bottom-left': 0,
    'bottom-right': 0,
  };

  const total = Math.min(x.length, y.length);
  for (let index = 0; index < total; index++) {
    const pointX = x[index];
    const pointY = y[index];
    if (pointX === undefined || pointY === undefined) continue;
    const inLeft = pointX <= leftEdge;
    const inRight = pointX >= rightEdge;
    const inTop = pointY <= topEdge;
    const inBottom = pointY >= bottomEdge;
    if (inTop && inLeft) counts['top-left']++;
    if (inTop && inRight) counts['top-right']++;
    if (inBottom && inLeft) counts['bottom-left']++;
    if (inBottom && inRight) counts['bottom-right']++;
  }

  let best = preferred;
  let fewest = counts[preferred];
  for (const corner of tieOrder(preferred)) {
    if (counts[corner] >= fewest) continue;
    best = corner;
    fewest = counts[corner];
  }
  return best;
}

const DEFAULT_CARD_WIDTH = 210;
const DEFAULT_CARD_HEIGHT = 76;

const CORNERS: readonly OverlayCorner[] = [
  'top-left',
  'top-right',
  'bottom-right',
  'bottom-left',
];

const OPPOSITE: Record<OverlayCorner, OverlayCorner> = {
  'top-left': 'bottom-right',
  'top-right': 'bottom-left',
  'bottom-left': 'top-right',
  'bottom-right': 'top-left',
};

function tieOrder(preferred: OverlayCorner): OverlayCorner[] {
  const opposite = OPPOSITE[preferred];
  const order: OverlayCorner[] = [opposite];
  for (const corner of CORNERS) {
    if (corner !== preferred && corner !== opposite) order.push(corner);
  }
  return order;
}
