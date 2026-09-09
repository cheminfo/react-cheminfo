/**
 * The rules a control that writes its own value is drawn with.
 *
 * A bar over a figure used to name its settings and hide their answers: a
 * caption reading `Colour by` beside a box the reader had to open to learn it
 * said `Species`. The name of a setting is read once, on the first visit; its
 * value is read every time the figure is looked at. So these controls write
 * the value and leave the name to the pointer, the screen reader and the menu
 * they open.
 *
 * None of them carries an outline or a fill at rest. The bar already has one
 * container edge in the sunken track the tabs sit in, and a second and third
 * box beside it turn the chrome into the loudest thing on a page whose point
 * is the picture underneath. What stands in for the box is the ink — the value
 * at full strength, its key word in the caption's grey — and a ground that
 * only appears under the pointer.
 */

import type { CSSProperties } from 'react';

import type { OverlayMetrics } from '../core/overlayMetrics.ts';

/** How a value-bearing control stands. */
export interface OverlayValueLook {
  /**
   * Whether the pointer is over it.
   * @default false
   */
  hovered?: boolean;
  /**
   * Whether the keyboard is on it. Drawn as a ring rather than as the hover
   * ground, because a reader tabbing through a bar has to be able to tell
   * where the focus is from a control the pointer happens to be resting on.
   * @default false
   */
  focused?: boolean;
  /**
   * Whether the choices behind it are showing.
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
 * A setting written as its value.
 *
 * Its height is a control's, so it stands level with the tab track beside it,
 * and its width floors at the button size — which is what keeps a setting
 * reading `95%` at forty pixels under a fingertip instead of shrinking to the
 * width of three characters.
 * @param metrics - The measurements the chrome is drawn from.
 * @param look - See {@link OverlayValueLook}.
 * @returns The button's rules.
 */
export function overlayValueButtonStyle(
  metrics: OverlayMetrics,
  look: OverlayValueLook,
): CSSProperties {
  const { hovered = false, focused = false, active = false } = look;
  const { disabled = false } = look;
  const lit = !disabled && (hovered || active);
  return {
    boxSizing: 'border-box',
    display: 'inline-flex',
    alignItems: 'center',
    gap: OVERLAY_VALUE_GAP,
    minWidth: metrics.buttonSize,
    height: metrics.controlHeight,
    padding: `0 ${metrics.paddingX}px`,
    border: 'none',
    borderRadius: metrics.controlRadius + 1,
    background: lit ? 'var(--surface-sunken)' : 'transparent',
    color: 'var(--text)',
    font: 'inherit',
    fontSize: metrics.fontSize,
    lineHeight: 1,
    whiteSpace: 'nowrap',
    cursor: disabled ? 'default' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    ...focusRing(focused && !disabled),
  };
}

/**
 * Several settings gathered into one control.
 *
 * It takes the sunken ground the tab track has rather than an outline of its
 * own, so the two things on the bar that hold more than they show are told
 * apart from the bare glyphs by the same device. Fully rounded, because that
 * is what says a chip holds a reading rather than that it is one more button.
 * @param metrics - The measurements the chrome is drawn from.
 * @param look - See {@link OverlayValueLook}.
 * @returns The chip's rules.
 */
export function overlayChipStyle(
  metrics: OverlayMetrics,
  look: OverlayValueLook,
): CSSProperties {
  const { hovered = false, focused = false, active = false } = look;
  const { disabled = false } = look;
  const lit = !disabled && (hovered || active);
  return {
    boxSizing: 'border-box',
    display: 'inline-flex',
    alignItems: 'center',
    gap: OVERLAY_VALUE_GAP,
    minWidth: metrics.buttonSize,
    height: metrics.controlHeight,
    padding: `0 ${metrics.paddingX + 2}px`,
    border: 'none',
    borderRadius: metrics.controlHeight / 2,
    background: 'var(--surface-sunken)',
    color: 'var(--text)',
    boxShadow: lit ? 'inset 0 0 0 1px var(--border)' : undefined,
    font: 'inherit',
    fontSize: metrics.fontSize,
    lineHeight: 1,
    whiteSpace: 'nowrap',
    cursor: disabled ? 'default' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    ...focusRing(focused && !disabled),
  };
}

/**
 * The value itself, which is what the reader is scanning for.
 * @returns The value's rules.
 */
export function overlayValueTextStyle(): CSSProperties {
  return {
    color: 'var(--text)',
    fontWeight: 600,
  };
}

/**
 * The key word in front of a value.
 *
 * The caption's grey at the caption's weight, so a reader scanning the bar for
 * how the figure is drawn reads `Species` and steps over `Colour` — and the
 * pair still reads as one control rather than as a label and a button.
 * @returns The key word's rules.
 */
export function overlayValueKeyStyle(): CSSProperties {
  return {
    color: 'var(--text-muted)',
    fontWeight: 500,
  };
}

/**
 * The hairline between two settings inside a chip.
 *
 * Short of the chip's full height, so it separates the two readings without
 * cutting the chip in half.
 * @param metrics - The measurements the chrome is drawn from.
 * @returns The separator's rules.
 */
export function overlayChipSeparatorStyle(
  metrics: OverlayMetrics,
): CSSProperties {
  return {
    width: 1,
    height: Math.max(10, metrics.controlHeight - 14),
    background: 'var(--border)',
    margin: `0 ${OVERLAY_VALUE_GAP}px`,
  };
}

/**
 * The caret saying there is more behind the words.
 *
 * Faint, because it is the one part of these controls the reader never needs
 * to read — it says that the value can be changed, and the value is what they
 * came to see.
 * @returns The caret's rules.
 */
export function overlayCaretStyle(): CSSProperties {
  return {
    display: 'inline-flex',
    color: 'var(--text-faint)',
  };
}

/** What is left between the swatches, the words and the caret. */
const OVERLAY_VALUE_GAP = 4;

/**
 * The ring around the control the keyboard is on.
 *
 * Offset by a pixel so it reads as a ring around the control rather than as
 * the outline these controls spend the rest of their life not having. It falls
 * back to the text colour on a page that never declared an accent, since a
 * focus ring nobody can see is the one accessibility fault a keyboard reader
 * cannot work around.
 * @param focused - Whether the keyboard is on it.
 * @returns The outline rules, or nothing.
 */
function focusRing(focused: boolean): CSSProperties {
  if (!focused) return {};
  return {
    outline: '2px solid var(--accent, var(--text))',
    outlineOffset: 1,
  };
}
