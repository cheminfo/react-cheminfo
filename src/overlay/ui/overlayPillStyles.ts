/**
 * The rules the package's one segmented control is drawn with.
 *
 * A sunken track with the choice in force lifted out of it: the same device
 * whether it is moving between a figure's views or picking one setting inside
 * a card, and it is written here rather than in either component so the two
 * cannot drift into looking like two different controls.
 *
 * Nothing here is filled with the site's accent. The strongest colour on the
 * page belongs to the data, and a saturated block of it in the chrome above a
 * scatter pulls the eye off the picture the reader came for — so the choice in
 * force is told apart by being *raised* rather than by being coloured.
 *
 * The raising is said three ways at once — a lighter ground, darker ink, a
 * heavier weight, and only then a shadow — because a reader who has asked the
 * operating system for high contrast is shown no shadow at all, and a control
 * whose one signal was the shadow then says nothing about which choice is in
 * force.
 */

import type { CSSProperties } from 'react';

import type { OverlayMetrics } from '../core/overlayMetrics.ts';

/**
 * How big a segmented group is drawn.
 *
 * `strip` is the figure's own tab bar, at the full height of a control.
 * `setting` is one question inside a card, a little smaller so it reads as
 * something the figure is set with rather than as a second tab bar.
 */
export type OverlaySegmentedSize = 'strip' | 'setting';

/** How one segment stands among the others. */
export interface OverlayPillLook {
  /** Whether it is the choice in force. */
  selected: boolean;
  /**
   * Whether it cannot be picked.
   * @default false
   */
  disabled?: boolean;
  /**
   * Which of the two sizes the group is drawn at.
   * @default 'strip'
   */
  size?: OverlaySegmentedSize;
}

/**
 * The sunken track the segments sit in.
 *
 * It carries no outline. A hairline around a group that is already a shade
 * darker than the card is a fourth container edge in a bar that has room for
 * one, and the sinking alone is what tells the reader the segments belong
 * together.
 * @param metrics - The measurements the chrome is drawn from.
 * @param size - Which of the two sizes it is drawn at.
 * @returns The track's rules.
 */
export function overlayPillGroupStyle(
  metrics: OverlayMetrics,
  size: OverlaySegmentedSize = 'strip',
): CSSProperties {
  return {
    boxSizing: 'border-box',
    display: 'inline-flex',
    alignItems: 'center',
    gap: OVERLAY_TRACK_GAP,
    height: trackHeight(metrics, size),
    padding: OVERLAY_TRACK_PADDING,
    borderRadius: trackRadius(metrics),
    background: 'var(--surface-sunken)',
  };
}

/**
 * One segment.
 *
 * Its height is the track's less the band of track left showing above and
 * below it, so the choice in force reads as a tile lying *in* the track rather
 * than as a block that has covered it over.
 * @param metrics - The measurements the chrome is drawn from.
 * @param look - See {@link OverlayPillLook}.
 * @returns The segment's rules.
 */
export function overlayPillStyle(
  metrics: OverlayMetrics,
  look: OverlayPillLook,
): CSSProperties {
  const { selected, disabled = false, size = 'strip' } = look;
  return {
    boxSizing: 'border-box',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    height: trackHeight(metrics, size) - OVERLAY_TRACK_PADDING * 2,
    padding: `0 ${segmentPaddingX(metrics, size)}px`,
    border: 'none',
    borderRadius: trackRadius(metrics) - OVERLAY_TRACK_PADDING,
    background: selected ? 'var(--surface)' : 'transparent',
    color: selected ? 'var(--text)' : 'var(--text-muted)',
    boxShadow: selected ? 'var(--shadow-sm)' : undefined,
    font: 'inherit',
    fontSize: metrics.fontSize,
    fontWeight: selected ? 600 : 500,
    lineHeight: 1,
    whiteSpace: 'nowrap',
    cursor: disabled ? 'default' : 'pointer',
    opacity: disabled ? 0.6 : 1,
  };
}

/**
 * The count after a segment's label.
 *
 * The digits are tabular, so a row of counts does not shuffle the labels
 * sideways as the numbers behind them change.
 * @param metrics - The measurements the chrome is drawn from.
 * @param selected - Whether it is on the choice in force.
 * @returns The count's rules.
 */
export function overlayPillCountStyle(
  metrics: OverlayMetrics,
  selected: boolean,
): CSSProperties {
  return {
    fontSize: Math.max(9, metrics.labelSize - 1),
    fontVariantNumeric: 'tabular-nums',
    fontWeight: 500,
    opacity: selected ? 0.85 : 0.75,
  };
}

/**
 * The band of track showing around a segment, on every side.
 *
 * Two pixels: enough that the lifted tile is read as sitting inside something,
 * and little enough that the group still stands as tall as the controls beside
 * it.
 */
const OVERLAY_TRACK_PADDING = 2;

/** What is left between two segments, which is the track showing through. */
const OVERLAY_TRACK_GAP = 2;

/**
 * How tall the track stands.
 * @param metrics - The measurements the chrome is drawn from.
 * @param size - Which of the two sizes it is drawn at.
 * @returns The height in pixels.
 */
function trackHeight(
  metrics: OverlayMetrics,
  size: OverlaySegmentedSize,
): number {
  if (size === 'strip') return metrics.controlHeight;
  return Math.max(20, metrics.controlHeight - 4);
}

/**
 * The track's corner.
 *
 * Two pixels rounder than a control of the same height, because the segment
 * inside it takes that pair back and a tile with a square corner in a rounded
 * track reads as a misfit rather than as a lift.
 * @param metrics - The measurements the chrome is drawn from.
 * @returns The radius in pixels.
 */
function trackRadius(metrics: OverlayMetrics): number {
  return metrics.controlRadius + 2;
}

/**
 * The room each side of a segment's label.
 *
 * The type does not shrink with the smaller size — a control that is quieter
 * should take less room, not become harder to read — so only the room around
 * the words goes.
 * @param metrics - The measurements the chrome is drawn from.
 * @param size - Which of the two sizes it is drawn at.
 * @returns The padding in pixels.
 */
function segmentPaddingX(
  metrics: OverlayMetrics,
  size: OverlaySegmentedSize,
): number {
  return size === 'strip' ? metrics.paddingX + 2 : metrics.paddingX;
}
