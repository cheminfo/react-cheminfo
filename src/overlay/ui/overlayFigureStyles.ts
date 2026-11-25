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

/** A readout's title reads a pixel larger than its rows: 13 over 12 at the everyday density. */
const READOUT_TITLE_STEP = 1;

/**
 * The frame of the family's designed card (rules/visual-identity.md): a raised
 * surface with the family's border, corners and shadow — the readout over a
 * figure, and any card a site draws in the family's look.
 */
export const CARD_FRAME_STYLE = {
  borderRadius: 'var(--radius)',
  border: '1px solid var(--border)',
  background: 'var(--surface)',
  boxShadow: 'var(--shadow-md)',
  color: 'var(--text)',
} as const satisfies CSSProperties;

/**
 * The card holding everything known about one point: the designed card — its
 * rows at the size a control says (12 px at the everyday density), 1.4 apart.
 * @param metrics - The measurements the card is drawn from.
 * @returns The card's rules.
 */
export function readoutCardStyle(metrics: OverlayMetrics): CSSProperties {
  return {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    boxSizing: 'border-box',
    padding: `${metrics.paddingY}px ${metrics.paddingX}px`,
    ...CARD_FRAME_STYLE,
    fontSize: metrics.fontSize,
    lineHeight: 1.4,
    whiteSpace: 'nowrap',
  };
}

/** A readout placed over a figure: above it, never taking the pointer. */
export const READOUT_PLACE_STYLE = {
  position: 'absolute',
  zIndex: 2,
  pointerEvents: 'none',
} as const satisfies CSSProperties;

/**
 * The readout's first line — what the reader pointed at, and a pinned card's
 * dismiss button —, a step larger than the rows and ruled off from them.
 * @param metrics - The measurements the card is drawn from.
 * @returns The title's rules.
 */
export function readoutTitleStyle(metrics: OverlayMetrics): CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingBottom: 2,
    marginBottom: 2,
    borderBottom: '1px solid var(--border)',
    fontSize: metrics.fontSize + READOUT_TITLE_STEP,
    fontWeight: 600,
  };
}

/** One line of the readout: its chip, its label, its value. */
export const READOUT_ROW_STYLE = {
  display: 'flex',
  alignItems: 'baseline',
  gap: 6,
} as const satisfies CSSProperties;

/** What a value is, muted, cut with an ellipsis rather than wrapped. */
export const READOUT_LABEL_STYLE = {
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  color: 'var(--text-muted)',
} as const satisfies CSSProperties;

/** What the title names, muted after it: a shape's kind beside its own name. */
export const READOUT_ASIDE_STYLE = {
  color: 'var(--text-muted)',
  fontWeight: 400,
} as const satisfies CSSProperties;

/**
 * The values line up on their own column and share one digit width, so a
 * column of numbers can be compared down the card rather than read one by one.
 */
export const READOUT_VALUE_STYLE = {
  marginLeft: 'auto',
  fontWeight: 600,
  fontVariantNumeric: 'tabular-nums',
  whiteSpace: 'nowrap',
} as const satisfies CSSProperties;

/**
 * The colour chip of a row belonging to one series, ringed by a hairline so
 * a white or a pale series still shows on the card.
 */
export const READOUT_CHIP_STYLE = {
  alignSelf: 'center',
  flex: 'none',
  boxSizing: 'border-box',
  width: 8,
  height: 8,
  border: '1px solid var(--border-strong)',
  borderRadius: 2,
} as const satisfies CSSProperties;

/** The footer saying how many rows were left out. */
export const READOUT_FOOTER_STYLE = {
  marginTop: 2,
  paddingTop: 2,
  borderTop: '1px solid var(--border)',
  color: 'var(--text-faint)',
} as const satisfies CSSProperties;
