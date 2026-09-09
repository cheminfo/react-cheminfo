/** Which corner of a figure a floating card sits in. */
export type OverlayCorner =
  'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

/**
 * Where a floating card sits: over one of the figure's corners, or docked
 * outside the picture entirely.
 *
 * The three docked forms are the escape hatch for a figure whose data reaches
 * all four corners. A chart that cannot spare a corner should move its
 * controls out rather than cover the one cluster the reader came for.
 *
 * `stretch` is the one that spans the whole width rather than sitting at one
 * end of the row: the settings bar of a figure embedded in somebody else's
 * page, which is chrome above the picture and not a card floating on it. It is
 * deliberately not offered as a floating placement — a full-width strip over a
 * figure covers the very data it is there to explain.
 */
export type OverlayPlacement = OverlayCorner | 'above' | 'below' | 'stretch';

/**
 * The offsets a placement gives a card.
 *
 * Written out as a plain object of numbers rather than borrowed from React, so
 * the whole of this entry point stays free of the framework that eventually
 * spreads it onto a `style` prop. Only the two edges a corner is actually
 * measured from are present: a key carrying `undefined` would still win over
 * an offset the caller had merged in underneath it.
 */
export interface OverlayCornerStyle {
  /** Whether the card is lifted out of the flow, or left in it and docked. */
  position: 'absolute' | 'static';
  /**
   * Distance from the figure's top edge, in pixels.
   * @default undefined — absent unless the card sits in a top corner
   */
  top?: number;
  /**
   * Distance from the figure's right edge, in pixels.
   * @default undefined — absent unless the card sits in a right corner
   */
  right?: number;
  /**
   * Distance from the figure's bottom edge, in pixels.
   * @default undefined — absent unless the card sits in a bottom corner
   */
  bottom?: number;
  /**
   * Distance from the figure's left edge, in pixels.
   * @default undefined — absent unless the card sits in a left corner
   */
  left?: number;
}

/**
 * The positioning a placement gives a card.
 * @param placement - Where the card sits.
 * @param inset - Distance kept between the card and the figure's edge, in pixels.
 * @returns The style to spread onto the card. Every docked placement returns
 * `position: 'static'`, so the same component lays out in the flow without a
 * second code path.
 */
export function overlayCornerStyle(
  placement: OverlayPlacement,
  inset: number,
): OverlayCornerStyle {
  if (placement === 'top-left') {
    return { position: 'absolute', top: inset, left: inset };
  }
  if (placement === 'top-right') {
    return { position: 'absolute', top: inset, right: inset };
  }
  if (placement === 'bottom-left') {
    return { position: 'absolute', bottom: inset, left: inset };
  }
  if (placement === 'bottom-right') {
    return { position: 'absolute', bottom: inset, right: inset };
  }
  return { position: 'static' };
}
