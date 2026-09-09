/**
 * The rules the chrome that explains a figure is drawn with: the plain-English
 * band under it, the key naming what its colours mean, and the card that
 * follows the pointer.
 *
 * This is the half of the domain that answers "what am I looking at", and it
 * is separated from the controls because a figure can need all of it while
 * offering nothing to change.
 */

import type { CSSProperties } from 'react';

import type { OverlayMetrics } from '../core/overlayMetrics.ts';

/**
 * The plain-English band under a figure.
 *
 * `strong` is for a sentence the reader is meant to act on — what a drag is
 * about to do — and is the one place the chrome raises its voice.
 * @param metrics - The measurements the card is drawn from.
 * @param tone - How loudly it speaks.
 * @returns The caption band's rules.
 */
export function overlayCaptionStyle(
  metrics: OverlayMetrics,
  tone: 'quiet' | 'strong',
): CSSProperties {
  return {
    display: 'block',
    maxWidth: '100%',
    padding: `${metrics.paddingY}px ${metrics.paddingX}px`,
    color: tone === 'strong' ? 'var(--text)' : 'var(--text-muted)',
    fontSize: metrics.labelSize,
    fontWeight: tone === 'strong' ? 600 : 400,
    lineHeight: 1.35,
    textWrap: 'pretty',
  };
}

/**
 * The stack of entries naming what a colour or a shape means.
 * @param metrics - The measurements the card is drawn from.
 * @returns The legend's rules.
 */
export function overlayLegendStyle(metrics: OverlayMetrics): CSSProperties {
  return {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: Math.max(2, metrics.gap - 4),
    padding: `${metrics.paddingY}px ${metrics.paddingX}px`,
    color: 'var(--text)',
    fontSize: metrics.labelSize,
    lineHeight: 1.3,
  };
}

/**
 * The sentence over a legend's entries, which names the encoding.
 * @param metrics - The measurements the card is drawn from.
 * @returns The title's rules.
 */
export function overlayLegendTitleStyle(
  metrics: OverlayMetrics,
): CSSProperties {
  return {
    marginBottom: 2,
    color: 'var(--text-muted)',
    fontSize: metrics.labelSize,
    fontWeight: 600,
    whiteSpace: 'nowrap',
  };
}

/** One entry of a legend: its mark, then what the mark means. */
export const OVERLAY_LEGEND_ENTRY_STYLE = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  border: 'none',
  background: 'none',
  color: 'inherit',
  font: 'inherit',
  padding: 0,
  textAlign: 'left',
} as const satisfies CSSProperties;

/**
 * The card that follows the pointer, holding everything known about one point.
 * @param metrics - The measurements the card is drawn from.
 * @returns The readout's rules.
 */
export function overlayReadoutStyle(metrics: OverlayMetrics): CSSProperties {
  return {
    position: 'absolute',
    zIndex: 2,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    maxWidth: 280,
    padding: `${metrics.paddingY}px ${metrics.paddingX}px`,
    borderRadius: 'var(--radius)',
    border: '1px solid var(--border)',
    background: 'var(--surface)',
    boxShadow: 'var(--shadow-md)',
    color: 'var(--text)',
    fontSize: metrics.labelSize,
    lineHeight: 1.35,
    pointerEvents: 'none',
  };
}
