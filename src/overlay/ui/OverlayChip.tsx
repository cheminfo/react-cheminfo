import type { PopoverNextPlacement } from '@blueprintjs/core';
import { Icon, PopoverNext } from '@blueprintjs/core';
import type { ReactElement, ReactNode } from 'react';
import { Fragment, useId, useState } from 'react';

import { OverlaySwatchIcon } from './OverlaySwatchIcon.tsx';
import { overlayGroupTitleStyle } from './overlayControlStyles.ts';
import { overlayPanelStyle } from './overlayStyles.ts';
import { useOverlaySurface } from './overlaySurface.ts';
import {
  overlayCaretStyle,
  overlayChipSeparatorStyle,
  overlayChipStyle,
  overlayValueTextStyle,
} from './overlayValueStyles.ts';

/** One setting a chip reads out. */
export interface OverlayChipSetting {
  /**
   * What the setting is called, in full: `Colour by`, `Group outlines`. It is
   * never written on the chip — it is what the chip announces, so a screen
   * reader is told which question each value answers.
   */
  label: string;
  /** What the setting is currently on, which is what the chip writes. */
  value: string;
  /**
   * The figure's own colours, drawn as a row of dots at the head of the chip.
   * @default undefined — no dots are drawn
   */
  swatches?: readonly string[];
}

/** What {@link OverlayChip} needs. */
export interface OverlayChipProps {
  /** What the settings are called together, written over the panel it opens. */
  label: string;
  /** The settings it reads out, in the order they are written. */
  settings: readonly OverlayChipSetting[];
  /**
   * The controls behind it, each with its own caption — the same controls the
   * bar holds when it has room for them, rather than a reduced set.
   */
  children: ReactNode;
  /**
   * Whether none of the settings can be reached.
   * @default false
   */
  disabled?: boolean;
  /**
   * Which way the panel opens.
   * @default 'bottom-end'
   */
  placement?: PopoverNextPlacement;
  /**
   * Value of the `data-testid` attribute of the chip.
   * @default undefined
   */
  testId?: string;
}

/**
 * Several settings gathered into one rounded chip that still reads them out.
 *
 * This is what a narrow bar folds its settings into, and the whole argument
 * for it is that it is not a cog. A cog says only that there are settings; a
 * reader looking at a scatter of coloured dots on a phone wants to know what
 * the colours mean and how wide the outlines are drawn, and `Species · 95%`
 * answers both without being opened. What the fold actually buys is one
 * button's padding and one caret per setting swallowed — which is why the
 * words survive it and only the boxes around them go.
 * @param props - See {@link OverlayChipProps}.
 * @returns The chip and its panel.
 */
export function OverlayChip(props: OverlayChipProps): ReactElement {
  const { label, settings, children, disabled = false } = props;
  const { placement = 'bottom-end', testId } = props;
  const { metrics } = useOverlaySurface();
  const headingId = useId();
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  const swatches = leadingSwatches(settings);
  const name = announce(settings);

  return (
    <PopoverNext
      isOpen={open}
      disabled={disabled}
      placement={placement}
      onInteraction={(next) => setOpen(next)}
      content={
        <div
          role="group"
          aria-labelledby={headingId}
          style={overlayPanelStyle(metrics)}
        >
          <span id={headingId} style={overlayGroupTitleStyle(metrics)}>
            {label}
          </span>
          {children}
        </div>
      }
    >
      <button
        type="button"
        title={name}
        aria-label={name}
        aria-haspopup="menu"
        aria-expanded={open}
        disabled={disabled}
        data-testid={testId}
        style={overlayChipStyle(metrics, {
          hovered,
          focused,
          active: open,
          disabled,
        })}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      >
        {swatches === undefined ? null : (
          <OverlaySwatchIcon colors={swatches} />
        )}
        {settings.map((setting, index) => (
          <Fragment key={setting.label}>
            {index === 0 ? null : (
              <span
                aria-hidden="true"
                style={overlayChipSeparatorStyle(metrics)}
              />
            )}
            <span style={overlayValueTextStyle()}>{setting.value}</span>
          </Fragment>
        ))}
        <span aria-hidden="true" style={overlayCaretStyle()}>
          <Icon icon="caret-down" size={metrics.fontSize + 2} />
        </span>
      </button>
    </PopoverNext>
  );
}

/**
 * What the chip is called, which is every setting spelled out in full.
 *
 * The chip writes bare values, so a reader who cannot see it would otherwise
 * be told `Species · 95%` and left to guess which question each answers.
 * @param settings - The settings it reads out.
 * @returns The name.
 */
function announce(settings: readonly OverlayChipSetting[]): string {
  let name = '';
  for (const setting of settings) {
    if (name !== '') name += ', ';
    name += `${setting.label} — ${setting.value}`;
  }
  return name;
}

/**
 * The colours drawn at the head of the chip.
 *
 * The first setting that has any, and only that one: two rows of dots inside
 * one chip read as one palette of eight colours, which is the one thing this
 * glyph exists not to say.
 * @param settings - The settings it reads out.
 * @returns The colours, or nothing.
 */
function leadingSwatches(
  settings: readonly OverlayChipSetting[],
): readonly string[] | undefined {
  for (const setting of settings) {
    const { swatches } = setting;
    if (swatches !== undefined && swatches.length > 0) return swatches;
  }
  return undefined;
}
