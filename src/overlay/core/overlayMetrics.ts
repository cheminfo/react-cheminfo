/** How tightly a floating card packs its controls. */
export type OverlayDensity = 'compact' | 'comfortable';

/**
 * What kind of pointer the reader has.
 *
 * A finger cannot hover and cannot aim at a twenty-four pixel target, so a
 * coarse pointer overrides the density outright rather than nudging it.
 */
export type OverlayPointerKind = 'fine' | 'coarse';

/** Every measurement a floating card and its controls are drawn from. */
export interface OverlayMetrics {
  /** Height of a control, in pixels. */
  controlHeight: number;
  /** Space between two controls, and between a caption and its control. */
  gap: number;
  /** Space inside the card, left and right. */
  paddingX: number;
  /** Space inside the card, top and bottom. */
  paddingY: number;
  /** Size of the text a control says. */
  fontSize: number;
  /** Size of the caption in front of a control. */
  labelSize: number;
  /** Corner radius of a control; the card itself uses `--radius`. */
  controlRadius: number;
  /** Space kept between the card and the edge of the figure. */
  inset: number;
  /** Side of the square button the card collapses to. */
  buttonSize: number;
  /** The size Blueprint's own controls are asked for. */
  blueprintSize: 'small' | 'medium' | 'large';
}

/**
 * The measurements a card is drawn from.
 * @param density - How tightly the caller asked for the controls to be packed.
 * @param pointer - What the reader is pointing with. Defaults to `'fine'`.
 * @returns The measurements. A coarse pointer always gets the largest set,
 * whatever the density says.
 */
export function overlayMetrics(
  density: OverlayDensity,
  pointer: OverlayPointerKind = 'fine',
): OverlayMetrics {
  if (pointer === 'coarse') return COARSE_METRICS;
  return density === 'compact' ? COMPACT_METRICS : COMFORTABLE_METRICS;
}

/**
 * The set a figure embedded in somebody else's page is drawn from.
 *
 * A figure that is a guest on a page it does not own has to spend as little of
 * that page as it can, so every measurement here is the smallest one that is
 * still honest. The control stays at twenty-four pixels — the floor a mouse
 * can be aimed at, and the reason nothing below it is offered at all — while
 * the room around it goes: a four pixel gap, a three pixel band above and
 * below, and a six pixel inset from the figure's edge. A bar built from these
 * stands thirty pixels tall, which is one line of the host's own text.
 *
 * The type steps down a size with it. Eleven pixels is what a control says and
 * ten is what its caption says, because the caption is read once to find the
 * control and the control's own words are read every time it is used.
 */
const COMPACT_METRICS: OverlayMetrics = {
  controlHeight: 24,
  gap: 4,
  paddingX: 6,
  paddingY: 3,
  fontSize: 11,
  labelSize: 10,
  controlRadius: 5,
  inset: 6,
  buttonSize: 24,
  blueprintSize: 'small',
};

/** The everyday set: room to read the captions without crowding the figure. */
const COMFORTABLE_METRICS: OverlayMetrics = {
  controlHeight: 30,
  gap: 8,
  paddingX: 8,
  paddingY: 6,
  fontSize: 12,
  labelSize: 11,
  controlRadius: 6,
  inset: 8,
  buttonSize: 30,
  blueprintSize: 'medium',
};

/**
 * Forty pixels is the smallest target a fingertip hits reliably, and the type
 * grows with it because a phone is held further from the eye than a screen.
 *
 * Nothing here follows the density down. A finger does not become smaller
 * because the figure was embedded, so a compact chart on a phone is a compact
 * chart whose controls are still forty pixels across.
 */
const COARSE_METRICS: OverlayMetrics = {
  controlHeight: 40,
  gap: 10,
  paddingX: 10,
  paddingY: 8,
  fontSize: 13,
  labelSize: 12,
  controlRadius: 8,
  inset: 10,
  buttonSize: 40,
  blueprintSize: 'large',
};
