import { clamp } from '../../format/core/clamp.ts';

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
  /**
   * Width of the mark's box, from the pointer position rightwards: a card
   * anchored to a mark rather than to the pointer opens beside the box, to its
   * right, or flips to its left side, and never covers it.
   * @default 0 — a point
   */
  anchorWidth?: number;
  /**
   * Which side of the pointer the card opens on, before a flip: below it, or
   * above it — a card pinned to a pixel reads above the pixel, as a label
   * does.
   * @default 'below'
   */
  opens?: 'below' | 'above';
  /**
   * Another card already on the figure — a loupe, a pinned readout — that
   * this one must not cover: it then takes the first of its other sides,
   * across, then along, then both, that keeps clear of it.
   * @default undefined — nothing to keep clear of
   */
  avoid?: { left: number; top: number; width: number; height: number };
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
 * Place a card down and to the right of the pointer — or up, `opens: 'above'`
 * —, flipping it to the other side of whichever axis would push it out of the
 * figure. A card anchored to a mark's box (`anchorWidth`) opens beside the box
 * and flips to the box's other side.
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
    offset = OVERLAY_CARD_OFFSET,
    anchorWidth = 0,
    opens = 'below',
  } = options;

  const right = pointerX + Math.max(0, anchorWidth);
  const below = pointerY + offset;
  const above = pointerY - offset - cardHeight;
  const flippedX = right + offset + cardWidth > boxWidth;
  const flippedY =
    opens === 'below' ? below + cardHeight > boxHeight : above < 0;
  const at = (acrossX: boolean, acrossY: boolean): OverlayCardPlacement => {
    const downwards = opens === 'below' ? !acrossY : acrossY;
    return {
      left: withinBox(
        acrossX ? pointerX - offset - cardWidth : right + offset,
        boxWidth - cardWidth,
      ),
      top: withinBox(downwards ? below : above, boxHeight - cardHeight),
      flippedX: acrossX,
      flippedY: acrossY,
    };
  };
  const natural = at(flippedX, flippedY);
  const { avoid } = options;
  if (avoid === undefined || !covers(natural, cardWidth, cardHeight, avoid)) {
    return natural;
  }
  const others = [
    at(flippedX, !flippedY),
    at(!flippedX, flippedY),
    at(!flippedX, !flippedY),
  ];
  for (const other of others) {
    if (!covers(other, cardWidth, cardHeight, avoid)) return other;
  }
  return natural;
}

function covers(
  card: OverlayCardPlacement,
  width: number,
  height: number,
  other: NonNullable<OverlayCardPlacementOptions['avoid']>,
): boolean {
  return (
    card.left < other.left + other.width &&
    other.left < card.left + width &&
    card.top < other.top + other.height &&
    other.top < card.top + height
  );
}

/** The gap kept between the pointer and a card, CSS pixels, unless told otherwise. */
export const OVERLAY_CARD_OFFSET = 14;

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
  return clamp(value, 0, Number.isFinite(furthest) ? Math.max(0, furthest) : 0);
}
