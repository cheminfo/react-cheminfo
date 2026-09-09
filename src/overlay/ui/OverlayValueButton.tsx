import { Icon } from '@blueprintjs/core';
import type { ReactElement } from 'react';
import { useState } from 'react';

import { OverlaySwatchIcon } from './OverlaySwatchIcon.tsx';
import { useOverlaySurface } from './overlaySurface.ts';
import {
  overlayCaretStyle,
  overlayValueButtonStyle,
  overlayValueKeyStyle,
  overlayValueTextStyle,
} from './overlayValueStyles.ts';

/** What {@link OverlayValueButton} needs. */
export interface OverlayValueButtonProps {
  /**
   * What the setting is called, in full and phrased as the question the reader
   * already has: `Colour by`, `Group outlines`. It is never the thing written
   * on the bar — it goes into `title` and `aria-label` with the value after
   * it, so a button showing `Species` still announces `Colour by — Species`.
   */
  label: string;
  /**
   * What the setting is currently on, which is the thing actually written:
   * `Species`, `95%`. Write the answer rather than the jargon.
   */
  value: string;
  /**
   * The one word written in front of the value on a roomy bar.
   * @default the label, which is right wherever the name is already one word
   */
  keyWord?: string;
  /**
   * Whether that key word is written. This is the first thing a narrowing bar
   * turns off: the name of a setting is read once and its value every time.
   * @default true
   */
  showKey?: boolean;
  /**
   * The figure's own colours, drawn as a row of dots in front of the words. A
   * reader who has just looked at four groups of dots recognises them without
   * being taught anything, which is worth more than any paint-pot glyph.
   * @default undefined — no dots are drawn
   */
  swatches?: readonly string[];
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
  /**
   * Why it cannot be pressed, which the pointer is told in place of the name.
   * A greyed control that does not say why is worse than one that is missing.
   * @default undefined — the pointer is still told the name and the value
   */
  disabledReason?: string;
  /**
   * Whether pressing it opens a menu, which is what tells a screen reader
   * there is more behind the words than a press.
   * @default false
   */
  opensMenu?: boolean;
  /**
   * Called when it is pressed. Leave it out inside a popover, which listens on
   * the wrapper it puts around the button and would otherwise be told twice.
   * @default undefined — nothing of its own happens
   */
  onClick?: () => void;
  /**
   * Value of the `data-testid` attribute.
   * @default undefined
   */
  testId?: string;
}

/**
 * A setting written as its own value, with a caret saying it can be changed.
 *
 * It replaces the two idioms a bar used to hold for the same job — a caption
 * beside an outlined segmented control, and a caption beside a native select —
 * with one that costs no box at all. The reader scans the bar and reads
 * `Species` and `95%`, which is how the figure is drawn; the names of the two
 * settings are one press away and in every announcement.
 * @param props - See {@link OverlayValueButtonProps}.
 * @returns The button.
 */
export function OverlayValueButton(
  props: OverlayValueButtonProps,
): ReactElement {
  const { label, value, keyWord = label, showKey = true, swatches } = props;
  const { active = false, disabled = false, disabledReason } = props;
  const { opensMenu = false, onClick, testId } = props;
  const { metrics } = useOverlaySurface();
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  const name = `${label} — ${value}`;
  const told = disabled && disabledReason !== undefined ? disabledReason : name;

  return (
    <button
      type="button"
      title={told}
      aria-label={name}
      aria-haspopup={opensMenu ? 'menu' : undefined}
      aria-expanded={opensMenu ? active : undefined}
      disabled={disabled}
      data-testid={testId}
      style={overlayValueButtonStyle(metrics, {
        hovered,
        focused,
        active,
        disabled,
      })}
      onClick={onClick}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      {swatches === undefined || swatches.length === 0 ? null : (
        <OverlaySwatchIcon colors={swatches} />
      )}
      {showKey ? <span style={overlayValueKeyStyle()}>{keyWord}</span> : null}
      <span style={overlayValueTextStyle()}>{value}</span>
      <span aria-hidden="true" style={overlayCaretStyle()}>
        <Icon icon="caret-down" size={caretSize(metrics.fontSize)} />
      </span>
    </button>
  );
}

/**
 * How big the caret is drawn.
 *
 * A little larger than the type it follows, because Blueprint's caret is a
 * small triangle inside its box and one drawn at the font size reads as a
 * speck rather than as an invitation to press.
 * @param fontSize - The size of the words it follows.
 * @returns The caret's size in pixels.
 */
function caretSize(fontSize: number): number {
  return fontSize + 2;
}
