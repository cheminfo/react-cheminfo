/**
 * The rules of a bar stretched across the whole width of the figure: its solid
 * ground, its row, its two ends, and how it rests while nothing points at it.
 */

import type { CSSProperties } from 'react';

import type { OverlayMetrics } from '../core/overlayMetrics.ts';

import type { OverlayBarRest } from './overlayBarShape.ts';
import { overlayContentStyle } from './overlayStyles.ts';

/**
 * The ground behind a bar that spans the whole width of the figure.
 *
 * Solid, unblurred and never faded, where a floating card is translucent: a
 * strip across the full width is chrome the figure is mounted in rather than
 * something laid on top of it, and a blurred translucent band over the top of
 * an embedded figure reads as a rendering fault. The hairline is at the foot
 * alone, so the bar is separated from the picture it introduces without being
 * boxed off from the page that is hosting it.
 */
export const OVERLAY_BAR_GROUND_STYLE = {
  position: 'absolute',
  inset: 0,
  borderBottom: '1px solid var(--border)',
  background: 'var(--surface)',
  pointerEvents: 'none',
} as const satisfies CSSProperties;

/**
 * The row inside a stretched bar, whose two ends are pushed apart.
 *
 * It never wraps. A bar that wrapped would change the figure's height as the
 * page around it resized, and an embedded figure that moves the host's layout
 * while it is being read is worse than one whose second-tier controls have
 * folded away into the button at its end.
 * @param metrics - The measurements the bar is drawn from.
 * @returns The row's rules.
 */
export function overlayBarContentStyle(metrics: OverlayMetrics): CSSProperties {
  return {
    ...overlayContentStyle(metrics),
    flexWrap: 'nowrap',
    justifyContent: 'space-between',
    width: '100%',
    minWidth: 0,
  };
}

/** How strong a quiet bar's controls are drawn while it rests. */
export const OVERLAY_QUIET_OPACITY = 0.45;

/**
 * How much of a resting bar's ground is left: almost none, so the strip reads
 * as the page behind it until the figure is pointed at.
 */
export const OVERLAY_RESTING_GROUND_OPACITY = 0.08;

/**
 * The opacity of a stretched bar's controls.
 * @param rest - How the bar rests.
 * @param awake - Whether the figure is pointed at or a control holds the focus.
 * @returns The rules fading the controls, never the ground under them.
 */
export function overlayBarRestStyle(
  rest: OverlayBarRest,
  awake: boolean,
): CSSProperties {
  if (rest === 'visible') return {};
  const opacity = awake ? 1 : rest === 'quiet' ? OVERLAY_QUIET_OPACITY : 0;
  return { opacity, transition: 'opacity 150ms ease-out' };
}

/**
 * The ground of a stretched bar — its surface and the hairline under it —
 * faded with its controls, so a resting bar is the page's own grey.
 * @param rest - How the bar rests.
 * @param awake - Whether the figure is pointed at or a control holds the focus.
 * @returns The ground's rules.
 */
export function overlayBarGroundStyle(
  rest: OverlayBarRest,
  awake: boolean,
): CSSProperties {
  if (rest === 'visible') return OVERLAY_BAR_GROUND_STYLE;
  return {
    ...OVERLAY_BAR_GROUND_STYLE,
    opacity: awake ? 1 : OVERLAY_RESTING_GROUND_OPACITY,
    transition: 'opacity 150ms ease-out',
  };
}

/**
 * Everything on a stretched bar after its start: the settings, then the glyphs
 * pushed to the right edge, so settings always read from the left and the `?`
 * and the save glyph are always found in the same corner.
 * @param metrics - The measurements the bar is drawn from.
 * @returns The group's rules.
 */
export function overlayBarGroupStyle(metrics: OverlayMetrics): CSSProperties {
  return {
    display: 'flex',
    flex: '1 1 auto',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: metrics.gap,
    minWidth: 0,
  };
}

/**
 * One end of a stretched bar.
 *
 * Both ends are drawn from the same rule, so the pills at the start and the
 * controls at the end keep one rhythm across the width between them.
 * @param metrics - The measurements the bar is drawn from.
 * @returns The end's rules.
 */
export function overlayBarSideStyle(metrics: OverlayMetrics): CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: metrics.gap,
    minWidth: 0,
  };
}
