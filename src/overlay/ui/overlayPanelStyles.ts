/**
 * The rules a settings panel is drawn with.
 *
 * A panel is the one surface in this domain the reader stops and reads rather
 * than glances at, and everything here follows from that. It says at the top
 * which figure it belongs to, because a panel that opens behind a cog and
 * never names itself leaves the reader guessing which of four pictures they
 * are about to change. It offers a way back, because a configuration nobody
 * understands any more is worse than the default it replaced. And it keeps its
 * commands at the foot rather than among its rows, since a button that clears
 * a selection is not a setting and reading as one costs the reader a mistake.
 *
 * The panel brings its own padding, so it belongs in a popover or a card that
 * has none: nested inside a padded surface, its header rule stops short of
 * both edges and reads as a mis-drawn line rather than as a header.
 */

import type { CSSProperties } from 'react';

import type { OverlayMetrics } from '../core/overlayMetrics.ts';

import { OVERLAY_HELP_NAME_STYLE } from './overlayRowStyles.ts';

/**
 * The panel itself: a header, a body, and whatever the figure can be told to
 * do at the foot.
 * @param metrics - The measurements the card is drawn from.
 * @returns The panel's rules.
 */
export function overlayPanelSurfaceStyle(
  metrics: OverlayMetrics,
): CSSProperties {
  return {
    display: 'flex',
    flexDirection: 'column',
    minWidth: OVERLAY_PANEL_MIN_WIDTH,
    color: 'var(--text)',
    fontSize: metrics.fontSize,
    lineHeight: 1.2,
  };
}

/**
 * The band across the top holding the title and the way back.
 * @param metrics - The measurements the card is drawn from.
 * @returns The header's rules.
 */
export function overlayPanelHeaderStyle(
  metrics: OverlayMetrics,
): CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: metrics.gap,
    padding: `${metrics.gap + 5}px ${metrics.gap + 8}px ${metrics.gap + 4}px`,
    borderBottom: '1px solid var(--border)',
  };
}

/**
 * What the panel is called.
 *
 * Full strength and half a step heavier than the rows under it, which is the
 * least that separates a title from one more caption.
 * @param metrics - The measurements the card is drawn from.
 * @returns The title's rules.
 */
export function overlayPanelTitleStyle(metrics: OverlayMetrics): CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    minWidth: 0,
    color: 'var(--text)',
    fontSize: metrics.fontSize,
    fontWeight: 600,
    whiteSpace: 'nowrap',
  };
}

/**
 * The way back to the settings the figure came with.
 *
 * Plain text rather than a button: it is the one thing in the header that is
 * not the title, and drawing an outline around it would make it compete with
 * the settings it undoes. It is faint until pointed at, then the accent, so a
 * reader who is not looking for it never sees it and one who is finds it where
 * every other panel keeps it.
 * @param metrics - The measurements the card is drawn from.
 * @param hovered - Whether the pointer is over it or the keyboard is on it.
 * @returns The button's rules.
 */
export function overlayPanelResetStyle(
  metrics: OverlayMetrics,
  hovered: boolean,
): CSSProperties {
  return {
    flex: 'none',
    padding: 0,
    border: 'none',
    background: 'transparent',
    color: hovered ? 'var(--accent)' : 'var(--text-faint)',
    font: 'inherit',
    fontSize: Math.max(10, metrics.labelSize + 1),
    lineHeight: 1,
    textDecoration: hovered ? 'underline' : 'none',
    cursor: 'pointer',
  };
}

/**
 * The rows themselves, and the sections they are gathered into.
 * @param metrics - The measurements the card is drawn from.
 * @returns The body's rules.
 */
export function overlayPanelBodyStyle(metrics: OverlayMetrics): CSSProperties {
  return {
    display: 'flex',
    flexDirection: 'column',
    rowGap: metrics.gap + 3,
    padding: `${metrics.gap + 4}px ${metrics.gap + 8}px ${metrics.gap + 7}px`,
  };
}

/**
 * The one line at the foot that teaches the convention.
 *
 * Every name in the panel carries its own explanation and nothing says so; one
 * sentence, once, is what turns a column of dotted underlines from a rendering
 * oddity into an offer.
 * @param metrics - The measurements the card is drawn from.
 * @returns The line's rules.
 */
export function overlayPanelHintStyle(metrics: OverlayMetrics): CSSProperties {
  return {
    margin: 0,
    paddingTop: metrics.paddingY,
    color: 'var(--text-faint)',
    fontSize: Math.max(10, metrics.labelSize),
    lineHeight: 1.45,
  };
}

/**
 * What the figure can be told to do, under a hairline.
 *
 * Below the rows and separated from them, because a command among the settings
 * is a command the reader takes for a setting — and `Clear selection` read as
 * a setting is a click nobody meant to make.
 * @param metrics - The measurements the card is drawn from.
 * @returns The footer's rules.
 */
export function overlayPanelFooterStyle(
  metrics: OverlayMetrics,
): CSSProperties {
  return {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: metrics.gap,
    padding: `${metrics.gap + 4}px ${metrics.gap + 8}px ${metrics.gap + 5}px`,
    borderTop: '1px solid var(--border)',
  };
}

/**
 * One section of a panel: its heading and the rows under it.
 * @param metrics - The measurements the card is drawn from.
 * @returns The section's rules.
 */
export function overlaySectionStyle(metrics: OverlayMetrics): CSSProperties {
  return {
    display: 'flex',
    flexDirection: 'column',
    rowGap: metrics.gap + 3,
  };
}

/** How a section heading stands. */
export interface OverlaySectionLook {
  /**
   * Whether a hairline is drawn above it. The first heading of a panel takes
   * none: a rule immediately under the header's own rule reads as a doubled
   * line rather than as a division.
   * @default true
   */
  divider?: boolean;
  /**
   * Whether the heading carries the section's explanation.
   * @default false
   */
  help?: boolean;
}

/**
 * What a section of a panel is called.
 *
 * Small capitals in the faintest ink the family has, over a hairline: the
 * heading has to give the eye somewhere to rest without being read as one more
 * setting, and anything that looks like the names under it is taken for one.
 * @param metrics - The measurements the card is drawn from.
 * @param look - See {@link OverlaySectionLook}.
 * @returns The heading's rules.
 */
export function overlaySectionHeadingStyle(
  metrics: OverlayMetrics,
  look: OverlaySectionLook,
): CSSProperties {
  const { divider = true, help = false } = look;
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    marginTop: divider ? metrics.paddingY : 0,
    paddingTop: divider ? metrics.gap + 5 : 0,
    borderTop: divider ? '1px solid var(--border)' : undefined,
    color: 'var(--text-faint)',
    fontSize: Math.max(10, metrics.labelSize - 1),
    fontWeight: 700,
    letterSpacing: '0.07em',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
    ...(help ? OVERLAY_HELP_NAME_STYLE : undefined),
  };
}

/**
 * How narrow a panel is allowed to get.
 *
 * The name column and a segmented pair beside it, which is the widest row a
 * panel routinely holds; below this the segments wrap and the grid stops being
 * a grid.
 */
const OVERLAY_PANEL_MIN_WIDTH = 208;
