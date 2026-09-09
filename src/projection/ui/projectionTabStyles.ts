/**
 * Every rule the tabs are drawn with.
 *
 * They are here rather than in each tab because the tabs have to read as one
 * figure seen several ways: a panel title on "what differs" and the name over
 * a bar on "how much each explains" are the same size and the same grey, or
 * the reader meets what looks like two products in one viewer. Every colour is
 * a family token, so a tab on any site of the family is that site's own grey.
 *
 * The numbers are the ones an embedded figure can afford. The viewer is a
 * guest on somebody else's page, so nothing here reserves room for chrome that
 * is not carrying information: the explanation is behind the question mark in
 * the bar and the key floats on the picture, which leaves the tab itself
 * spending its height on the figure alone.
 */

import type { CSSProperties } from 'react';

import {
  CHART_BASE_MARGINS,
  CHART_TICK_ROOM,
  CHART_TITLE_OFFSET,
  CHART_TITLE_ROOM,
} from '../../chart/ui/chartStyles.ts';
/** Height a tab takes when the viewer does not say, and the least one panel gets. */
export const PROJECTION_TAB_HEIGHT = 420;
export const SMALLEST_PANEL = 110;

/** Room the title over a panel takes, which the panel itself gives up. */
export const PANEL_TITLE_ROOM = 18;

/**
 * Where the plot rectangle falls inside a figure whose two axes are both
 * named, which is every scores map this viewer draws.
 *
 * It is the frame's own arithmetic repeated rather than measured, because the
 * chrome that has to stay off the axis labels — the floating key — is laid out
 * in HTML beside the drawing rather than inside it, and has nothing to measure
 * until after it has been placed.
 */
export const PROJECTION_PLOT_ROOM = {
  top: CHART_BASE_MARGINS.top,
  right: CHART_BASE_MARGINS.right,
  bottom:
    CHART_BASE_MARGINS.bottom +
    CHART_TICK_ROOM.bottom +
    CHART_TITLE_ROOM.bottom,
  left: CHART_BASE_MARGINS.left + CHART_TICK_ROOM.left + CHART_TITLE_ROOM.left,
} as const;

/**
 * The rectangle the data is drawn in, as a layer of its own.
 *
 * Chrome placed in it is placed against the picture rather than against the
 * figure's box, which is what keeps a floating key off the axis labels without
 * either of them knowing about the other. It takes no pointer events: only the
 * card inside it takes those back.
 */
export const PROJECTION_PLOT_AREA_STYLE = {
  position: 'absolute',
  top: PROJECTION_PLOT_ROOM.top,
  right: PROJECTION_PLOT_ROOM.right,
  bottom: PROJECTION_PLOT_ROOM.bottom,
  left: PROJECTION_PLOT_ROOM.left,
  pointerEvents: 'none',
} as const satisfies CSSProperties;

/** A column of panels, tight enough that the stack reads as one figure. */
export const STACK_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
} as const satisfies CSSProperties;

/**
 * A panel's title.
 *
 * The swatch carries the component's colour and the words never do: the
 * palette holds a yellow, and a yellow title on a white ground is a title
 * nobody reads.
 */
export const PANEL_TITLE_STYLE = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 5,
  color: 'var(--text)',
  fontSize: 11,
  fontWeight: 600,
} as const satisfies CSSProperties;

/** The square of colour in front of a panel's title or a bar's name. */
export const SWATCH_STYLE = {
  display: 'inline-block',
  width: 9,
  height: 9,
  borderRadius: 2,
} as const satisfies CSSProperties;

/**
 * Everything, as a percentage.
 *
 * The shares tab draws its vertical axis from nothing to this rather than from
 * 0 to 1, so its ticks read 0, 25, 50 … and a reader never has to multiply a
 * fraction in their head to compare a bar with the sentence about it.
 */
export const WHOLE_SHARE = 100;

/** Room under the shares plot for the component names and the caption below them. */
export const SHARES_BOTTOM_ROOM =
  CHART_BASE_MARGINS.bottom + CHART_TICK_ROOM.bottom + CHART_TITLE_ROOM.bottom;

/** Where the left edge of the shares plot falls, which its names are laid out from. */
export const SHARES_LEFT_ROOM =
  CHART_BASE_MARGINS.left + CHART_TICK_ROOM.left + CHART_TITLE_ROOM.left;

/** Where the right edge of the shares plot falls. */
export const SHARES_RIGHT_ROOM = CHART_BASE_MARGINS.right;

/** Baselines of a component's name and of the caption under the names. */
export const SHARES_NAME_OFFSET = 15;
export const SHARES_CAPTION_OFFSET =
  CHART_TICK_ROOM.bottom + CHART_TITLE_OFFSET;

/** The layer the component names are written in, outside the frame's own clip. */
export const AXIS_LAYER_STYLE = {
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
} as const satisfies CSSProperties;

/** One component's name under its bar. */
export const AXIS_NAME_STYLE = {
  fill: 'var(--text-muted)',
  fontSize: 11,
  userSelect: 'none',
} as const satisfies CSSProperties;

/** What the horizontal axis measures, written under the names. */
export const AXIS_CAPTION_STYLE = {
  fill: 'var(--text-muted)',
  fontSize: 12,
  fontWeight: 500,
  userSelect: 'none',
} as const satisfies CSSProperties;

/** The running total's own name, written at the right-hand end of its line. */
export const TOTAL_LABEL_STYLE = {
  fill: 'var(--text-muted)',
  fontSize: 11,
  fontWeight: 600,
  userSelect: 'none',
} as const satisfies CSSProperties;

/**
 * How much one press of the target stepper moves it, in percentage points.
 *
 * The bar and the panel behind the cog step the same setting, so they step it
 * by the same amount: a reader who nudges the target on one and then on the
 * other must not find it moving in two different sizes.
 */
export const PROJECTION_SHARE_STEP = 5;
