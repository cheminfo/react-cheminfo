/** What {@link placeOverlayCard} has to know. */
export interface OverlayCardPlacementOptions {
  /** Pointer position inside the figure, in pixels from its left. */
  pointerX: number;
  /** Pointer position inside the figure, in pixels from its top. */
  pointerY: number;
  /** Width of the card, as it was last measured. */
  cardWidth: number;
  /** Height of the card, as it was last measured. */
  cardHeight: number;
  /** Width of the box the card has to stay inside. */
  boxWidth: number;
  /** Height of that box. */
  boxHeight: number;
  /**
   * Gap kept between the pointer and the card, so the card never covers the
   * mark being read.
   * @default 14
   */
  offset?: number;
}

/** Where a pointer-following card goes, and which way round it ended up. */
export interface OverlayCardPlacement {
  /** Distance from the box's left edge to the card's left edge. */
  left: number;
  /** Distance from the box's top edge to the card's top edge. */
  top: number;
  /** Whether the card had to open to the pointer's left. */
  flippedX: boolean;
  /** Whether it had to open above the pointer. */
  flippedY: boolean;
}

/**
 * Place a card down and to the right of the pointer, flipping it to the other
 * side of whichever axis would push it out of the figure.
 *
 * Pure arithmetic on numbers the caller has already measured, so it runs on
 * every pointer move without touching the DOM: reading the card's size back
 * from the layout on each move would force a reflow every frame. Flipping
 * rather than only clamping matters because a card clamped against the right
 * edge sits under the pointer, and the mark the reader is pointing at is
 * exactly the one it then hides.
 * @param options - See {@link OverlayCardPlacementOptions}.
 * @returns Where to put the card's top left corner.
 */
export function placeOverlayCard(
  options: OverlayCardPlacementOptions,
): OverlayCardPlacement {
  const {
    pointerX,
    pointerY,
    cardWidth,
    cardHeight,
    boxWidth,
    boxHeight,
    offset = DEFAULT_OFFSET,
  } = options;

  const flippedX = pointerX + offset + cardWidth > boxWidth;
  const flippedY = pointerY + offset + cardHeight > boxHeight;
  return {
    left: withinBox(
      flippedX ? pointerX - offset - cardWidth : pointerX + offset,
      boxWidth - cardWidth,
    ),
    top: withinBox(
      flippedY ? pointerY - offset - cardHeight : pointerY + offset,
      boxHeight - cardHeight,
    ),
    flippedX,
    flippedY,
  };
}

const DEFAULT_OFFSET = 14;

/**
 * The flip alone is not enough when the card is larger than the figure it has
 * to live in — a fifty pixel sparkline with a full readout beside it — because
 * both sides then overflow. Clamping the far edge to zero keeps the card's top
 * left corner on screen, which is where the reader's eye already is, instead of
 * pushing the whole card past the edge and showing nothing at all.
 * @param value - The offset the flip arrived at.
 * @param furthest - The largest offset that still leaves the card inside.
 * @returns The offset, brought back between zero and that limit.
 */
function withinBox(value: number, furthest: number): number {
  if (!Number.isFinite(value)) return 0;
  const limit = Number.isFinite(furthest) ? Math.max(0, furthest) : 0;
  return Math.max(0, Math.min(value, limit));
}
