import type { IconName } from '@blueprintjs/core';
import { Icon } from '@blueprintjs/core';
import type { ReactElement } from 'react';
import { useState } from 'react';

import { overlayIconButtonStyle } from './overlayControlStyles.ts';
import { useOverlaySurface } from './overlaySurface.ts';

/** What {@link OverlayIconButton} needs. */
export interface OverlayIconButtonProps {
  /**
   * The glyph: a Blueprint icon name, or an element of the caller's own — an
   * inline `<svg>` drawing the very mark the figure draws, which is the one
   * kind of icon a reader does not have to learn.
   */
  icon: IconName | ReactElement;
  /**
   * What the setting is called, phrased as the question the reader already
   * has: `Colour by`, `Group outlines`. It is written into both `title` and
   * `aria-label`, because a glyph says nothing until it is named — that is the
   * price of an icon-only bar, and it is paid here rather than left to each
   * caller to remember.
   */
  label: string;
  /**
   * What the setting is currently on, written after the name as
   * `label — value`. Give it wherever there is one: `Colour by — species`
   * answers the reader's actual question, where `Colour by` alone only tells
   * them which question the button asks.
   * @default undefined — the name alone
   */
  value?: string;
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
  /**
   * Why it cannot be pressed, which the pointer is told in place of the name.
   * A greyed glyph that does not say why is the one thing worse than a glyph.
   * @default undefined — the pointer is still told the name
   */
  disabledReason?: string;
  /**
   * Whether pressing it opens a menu. Its state is then announced as a menu
   * that is open or shut rather than as a button that is pressed, which is
   * what tells a screen reader there is more behind it.
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
 * One setting reduced to its glyph.
 *
 * A bar of named controls over an embedded figure spends more of the picture
 * on its own words than the figure spends on the data, so on the bar a setting
 * is a glyph and its name is what the pointer and the screen reader are told.
 * That trade is only honest while the name is always there, which is why the
 * label is required rather than optional and why it carries the current value
 * with it: an icon nobody can name is a control nobody presses.
 * @param props - See {@link OverlayIconButtonProps}.
 * @returns The button.
 */
export function OverlayIconButton(props: OverlayIconButtonProps): ReactElement {
  const { icon, label, value, active = false, disabled = false } = props;
  const { disabledReason, opensMenu = false, onClick, testId } = props;
  const { metrics } = useOverlaySurface();
  const [lit, setLit] = useState(false);

  const name = value === undefined ? label : `${label} — ${value}`;
  const told = disabled && disabledReason !== undefined ? disabledReason : name;

  return (
    <button
      type="button"
      title={told}
      aria-label={name}
      aria-haspopup={opensMenu ? 'menu' : undefined}
      aria-expanded={opensMenu ? active : undefined}
      aria-pressed={opensMenu ? undefined : active}
      disabled={disabled}
      data-testid={testId}
      style={overlayIconButtonStyle(metrics, {
        hovered: lit,
        active,
        disabled,
      })}
      onClick={onClick}
      onPointerEnter={() => setLit(true)}
      onPointerLeave={() => setLit(false)}
      onFocus={() => setLit(true)}
      onBlur={() => setLit(false)}
    >
      {typeof icon === 'string' ? (
        <Icon icon={icon} size={glyphSize(metrics.buttonSize)} />
      ) : (
        icon
      )}
    </button>
  );
}

/**
 * How big the glyph is drawn inside the button.
 *
 * A little over half the button, which leaves the ring of empty space that
 * makes a bare glyph read as something pressable rather than as a mark printed
 * on the bar.
 * @param buttonSize - The side of the button.
 * @returns The glyph's size in pixels.
 */
function glyphSize(buttonSize: number): number {
  return Math.max(12, Math.round(buttonSize * 0.55));
}
