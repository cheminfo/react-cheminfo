/**
 * The rules one control inside a floating card is drawn with.
 *
 * They are apart from the card's own rules because a control is the part a
 * future chart will reuse without the card: a legend swatch, a glyph standing
 * for one setting, a titled cluster in a settings panel. Every one of them
 * takes the card's measurements, so a control looks the same wherever it is
 * put.
 */

import type { CSSProperties } from 'react';

import type { OverlayMetrics } from '../core/overlayMetrics.ts';

/**
 * The hairline between two clusters of controls.
 * @param metrics - The measurements the card is drawn from.
 * @returns The divider's rules.
 */
export function overlayDividerStyle(metrics: OverlayMetrics): CSSProperties {
  return {
    width: 1,
    alignSelf: 'stretch',
    minHeight: metrics.controlHeight - 8,
    background: 'var(--border)',
    margin: `0 ${Math.max(2, metrics.gap - 4)}px`,
  };
}

/**
 * The square in front of a toggle's caption.
 *
 * This is the one rule here that draws a colour it was handed rather than a
 * family token: given a series' own colour, a row of toggles becomes the
 * figure's legend, and a swatch that did not match the mark on the chart would
 * be worse than no swatch at all. The inset hairline is what keeps a pale
 * series visible against the card.
 * @param color - The colour the swatch stands for.
 * @returns The swatch's rules.
 */
export function overlaySwatchStyle(color: string): CSSProperties {
  return {
    display: 'inline-block',
    width: 10,
    height: 10,
    borderRadius: 2,
    background: color,
    boxShadow: 'inset 0 0 0 1px var(--border)',
  };
}

/**
 * A cluster of controls that answer one question together.
 *
 * It never wraps inside itself, so a cluster moves to the next line of the
 * card whole rather than breaking across two lines mid-thought.
 * @param metrics - The measurements the card is drawn from.
 * @param direction - Whether the controls sit side by side or stacked.
 * @returns The cluster's rules.
 */
export function overlayGroupStyle(
  metrics: OverlayMetrics,
  direction: 'row' | 'column',
): CSSProperties {
  return {
    display: 'inline-flex',
    flexDirection: direction,
    flexWrap: 'nowrap',
    alignItems: direction === 'row' ? 'center' : 'flex-start',
    gap: metrics.gap,
  };
}

/**
 * The title over a cluster of controls.
 *
 * Small capitals rather than a heavier weight: the title has to read as a
 * label *on* the cluster, and anything that looks like the captions inside it
 * is taken for one more control.
 * @param metrics - The measurements the card is drawn from.
 * @returns The title's rules.
 */
export function overlayGroupTitleStyle(metrics: OverlayMetrics): CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    color: 'var(--text-faint)',
    fontSize: Math.max(9, metrics.labelSize - 2),
    fontWeight: 600,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
  };
}

/** How an icon button stands. */
export interface OverlayIconLook {
  /**
   * Whether the pointer is over it or the keyboard is on it.
   * @default false
   */
  hovered?: boolean;
  /**
   * Whether the choices behind it are showing, or the thing it turns on is on.
   * @default false
   */
  active?: boolean;
  /**
   * Whether it cannot be pressed.
   * @default false
   */
  disabled?: boolean;
}

/**
 * A setting reduced to its glyph.
 *
 * It carries no outline and no ground until it is pointed at, because a bar of
 * six settings each in its own box is six boxes competing with the figure
 * underneath, and the reader is looking for a setting rather than for a
 * button. What answers for the missing box is the ink: faint at rest, the
 * caption's grey under the pointer, full strength while the choices are open,
 * so the button tells the reader what it is doing without ever growing an edge.
 * @param metrics - The measurements the card is drawn from.
 * @param look - See {@link OverlayIconLook}.
 * @returns The button's rules.
 */
export function overlayIconButtonStyle(
  metrics: OverlayMetrics,
  look: OverlayIconLook,
): CSSProperties {
  const { hovered = false, active = false, disabled = false } = look;
  const lit = !disabled && (hovered || active);
  return {
    boxSizing: 'border-box',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    minWidth: metrics.buttonSize,
    height: metrics.buttonSize,
    padding: `0 ${OVERLAY_ICON_PADDING}px`,
    border: 'none',
    borderRadius: metrics.controlRadius + 1,
    background: lit ? 'var(--surface-sunken)' : 'transparent',
    color: iconInk(active && !disabled, lit),
    font: 'inherit',
    fontSize: metrics.fontSize,
    lineHeight: 1,
    whiteSpace: 'nowrap',
    cursor: disabled ? 'default' : 'pointer',
    opacity: disabled ? 0.6 : 1,
  };
}

/**
 * The room each side of a glyph.
 *
 * Two pixels, which is what lets a palette of four dots sit in a button that
 * is otherwise square: the button keeps its width as a floor rather than as a
 * size, so the one control whose glyph is wider than it is tall grows instead
 * of cropping the dots that are the whole point of it.
 */
const OVERLAY_ICON_PADDING = 2;

/**
 * What an icon button is drawn in.
 * @param active - Whether its choices are showing.
 * @param lit - Whether it is pointed at or active.
 * @returns The ink.
 */
function iconInk(active: boolean, lit: boolean): string {
  if (active) return 'var(--text)';
  return lit ? 'var(--text-muted)' : 'var(--text-faint)';
}
