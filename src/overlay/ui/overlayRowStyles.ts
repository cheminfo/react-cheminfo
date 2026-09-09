/**
 * The rules one caption-and-control pair is drawn with.
 *
 * A row is the unit both a bar and a settings panel are built from, and the
 * two want different geometry out of it. On a bar the caption sits against its
 * control and the pair hugs its own width, because the bar is a line of
 * separate things. In a panel every control has to start at the same x, or the
 * reader has no column to run their eye down and the panel has to be read
 * rather than scanned. Both shapes are written here so that a row cannot end
 * up half one and half the other.
 *
 * The name is also where a row's help lives. A panel that hangs a question
 * mark off every control stacks a column of glyphs down its left edge, and the
 * eye reads that column before it reads any of the words; a dotted underline
 * on the name says the same thing with no ink of its own, and leaves the words
 * the widest thing in the panel.
 */

import type { CSSProperties } from 'react';

import type { OverlayMetrics } from '../core/overlayMetrics.ts';

/**
 * One caption-and-control pair on a bar.
 * @param metrics - The measurements the card is drawn from.
 * @returns The row's rules.
 */
export function overlayRowStyle(metrics: OverlayMetrics): CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: Math.max(4, metrics.gap - 2),
    minHeight: metrics.controlHeight,
  };
}

/**
 * One caption-and-control pair in a settings panel.
 *
 * Two columns of fixed width rather than a flexible line: the whole complaint
 * a panel of ragged rows draws is that every control starts at a different x,
 * and a name column that is only as wide as the words in it is a column that
 * moves from panel to panel.
 * @param metrics - The measurements the card is drawn from.
 * @param nameWidth - Width of the name column, in pixels.
 * @returns The row's rules.
 */
export function overlayGridRowStyle(
  metrics: OverlayMetrics,
  nameWidth: number,
): CSSProperties {
  return {
    display: 'grid',
    gridTemplateColumns: `${nameWidth}px minmax(0, 1fr)`,
    alignItems: 'center',
    columnGap: Math.max(10, metrics.gap + 2),
    minHeight: metrics.controlHeight,
    width: '100%',
  };
}

/**
 * How wide the name column is.
 *
 * Eight characters of the caption's own type plus the room a descender needs:
 * enough for `Bar order` and `Averages` without wrapping, and derived from the
 * type size rather than fixed, so a panel a reader has asked for at a larger
 * size widens its column with its words instead of breaking them.
 * @param metrics - The measurements the card is drawn from.
 * @returns The width, in pixels.
 */
export function overlayNameColumnWidth(metrics: OverlayMetrics): number {
  return metrics.labelSize * 8 + 8;
}

/** The control's own cell of a panel row. */
export const OVERLAY_GRID_CELL_STYLE = {
  display: 'flex',
  alignItems: 'center',
  minWidth: 0,
} as const satisfies CSSProperties;

/** How a row's name stands. */
export interface OverlayNameLook {
  /**
   * Whether the name carries the control's explanation.
   * @default false
   */
  help?: boolean;
  /**
   * Whether the control it names cannot be reached.
   * @default false
   */
  disabled?: boolean;
}

/**
 * The name of a control.
 *
 * It never wraps: a name breaking over two lines makes the row taller than the
 * control it names, which reads as a fault in the layout rather than as a long
 * word. When it carries help it is underlined with dots and takes the help
 * cursor, which is the one convention that lets every question mark leave the
 * panel — and it fades with its control, because a name at full strength over
 * a greyed control reads as half broken rather than as unavailable.
 * @param metrics - The measurements the card is drawn from.
 * @param look - See {@link OverlayNameLook}.
 * @returns The name's rules.
 */
export function overlayNameStyle(
  metrics: OverlayMetrics,
  look: OverlayNameLook,
): CSSProperties {
  const { help = false, disabled = false } = look;
  return {
    color: 'var(--text-muted)',
    fontSize: metrics.labelSize,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    userSelect: 'none',
    ...(help ? OVERLAY_HELP_NAME_STYLE : undefined),
    ...(disabled ? OVERLAY_FADED_NAME_STYLE : undefined),
  };
}

/**
 * What any name gains when it is the thing carrying the explanation.
 *
 * Written apart from {@link overlayNameStyle} because a section heading is a
 * name too, and the reader has to be taught the convention once rather than
 * per kind of label.
 */
export const OVERLAY_HELP_NAME_STYLE = {
  textDecoration: 'underline dotted var(--border-strong)',
  textUnderlineOffset: 3,
  cursor: 'help',
} as const satisfies CSSProperties;

/**
 * What a name gains when its control cannot be reached.
 *
 * A control that does not apply is greyed rather than removed, because one
 * that vanishes teaches the reader nothing about why it went.
 */
export const OVERLAY_FADED_NAME_STYLE = {
  opacity: 0.6,
} as const satisfies CSSProperties;

/**
 * One caption-and-control pair whose caption sits above the control.
 *
 * Reached once the captions are long enough that writing them in front of
 * their controls would push the card past a third of the figure — at which
 * point the chrome is hiding more of the picture than the captions are worth.
 * @param metrics - The measurements the card is drawn from.
 * @returns The stacked row's rules.
 */
export function overlayStackedRowStyle(metrics: OverlayMetrics): CSSProperties {
  return {
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 2,
    minHeight: metrics.controlHeight,
  };
}
