/**
 * How the controls of a stretched bar sit on its row: its start, then the
 * settings and the glyphs pushed to the right edge, both ends drawn from one
 * rule so the bar keeps one rhythm across its width.
 */

import type { CSSProperties } from 'react';

import type { OverlayMetrics } from '../core/overlayMetrics.ts';

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
    // It takes what the start leaves and never less than its own controls:
    // the start gives way, never the glyphs.
    flex: '1 0 auto',
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

/**
 * The start of a stretched bar, which never folds: on a row too narrow for
 * it once the far end has folded, it wraps its controls onto another line
 * rather than running under the glyphs.
 * @param metrics - The measurements the bar is drawn from.
 * @returns The start's rules.
 */
export function overlayBarStartStyle(metrics: OverlayMetrics): CSSProperties {
  return { ...overlayBarSideStyle(metrics), flexWrap: 'wrap' };
}

/**
 * The glyphs at the end of a stretched bar, which keep their own width
 * whatever the row has left: the `?`, the tools and the button behind which
 * the rest folds stay where a reader looks for them.
 * @param metrics - The measurements the bar is drawn from.
 * @returns The glyphs' rules.
 */
export function overlayBarGlyphsStyle(metrics: OverlayMetrics): CSSProperties {
  return { ...overlayBarSideStyle(metrics), flexShrink: 0 };
}
