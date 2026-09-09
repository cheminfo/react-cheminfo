import type { PopoverNextPlacement } from '@blueprintjs/core';
import { Menu, MenuDivider, MenuItem, PopoverNext } from '@blueprintjs/core';
import type { CSSProperties, ReactElement } from 'react';
import { useId, useState } from 'react';

import type { OverlayOption } from './OverlayRow.tsx';
import { OverlayValueButton } from './OverlayValueButton.tsx';
import { useOverlaySurface } from './overlaySurface.ts';

/** What {@link OverlayValueMenu} needs. */
export interface OverlayValueMenuProps<TValue extends string = string> {
  /**
   * What the setting is called, in full: `Colour by`, `Group outlines`. It
   * names the button for the pointer and the screen reader, and it is written
   * over the menu as its heading — so a reader who opened it on a guess is
   * told what they have opened before they choose.
   */
  label: string;
  /** The current choice, whose own label is what the button writes. */
  value: TValue;
  /** What may be chosen, in the order offered. */
  options: ReadonlyArray<OverlayOption<TValue>>;
  /** Called with the new choice. */
  onChange: (value: TValue) => void;
  /**
   * The one word written in front of the value on a roomy bar.
   * @default the label
   */
  keyWord?: string;
  /**
   * Whether that key word is written.
   * @default true
   */
  showKey?: boolean;
  /**
   * The figure's own colours, drawn as a row of dots in front of the words.
   * @default undefined — no dots are drawn
   */
  swatches?: readonly string[];
  /**
   * Whether the setting cannot be reached at all.
   * @default false
   */
  disabled?: boolean;
  /**
   * Why it cannot be reached, which the pointer is told in place of the name.
   * @default undefined — the pointer is still told the name and the value
   */
  disabledReason?: string;
  /**
   * Which way the menu opens. Away from the nearest edge of the figure, so the
   * choices are not the thing that pushes the reader off the picture.
   * @default 'bottom-end'
   */
  placement?: PopoverNextPlacement;
  /**
   * Value of the `data-testid` attribute of the button.
   * @default undefined
   */
  testId?: string;
}

/**
 * A setting written as its value, whose choices are a menu behind it.
 *
 * It is what a picker becomes on a bar with no room for captions: the same
 * choices, in the same order, with the one in force ticked. It takes the very
 * options the picker takes, so a bar swaps one for the other without reshaping
 * anything it holds — and unlike the picker it answers the reader's question
 * before it is opened, because the answer is what is written on it.
 * @param props - See {@link OverlayValueMenuProps}.
 * @returns The button and its menu.
 */
export function OverlayValueMenu<TValue extends string = string>(
  props: OverlayValueMenuProps<TValue>,
): ReactElement {
  const { label, value, options, onChange, keyWord, showKey } = props;
  const { swatches, disabled = false, disabledReason } = props;
  const { placement = 'bottom-end', testId } = props;
  const { metrics } = useOverlaySurface();
  const headingId = useId();
  const [open, setOpen] = useState(false);

  let written: string = value;
  for (const option of options) {
    if (option.value === value) written = option.label;
  }

  return (
    <PopoverNext
      isOpen={open}
      disabled={disabled}
      placement={placement}
      onInteraction={(next) => setOpen(next)}
      content={
        <Menu
          role="listbox"
          aria-labelledby={headingId}
          size={metrics.blueprintSize}
          style={OVERLAY_VALUE_MENU_STYLE}
        >
          <MenuDivider title={label} titleId={headingId} />
          {options.map((option) => (
            <MenuItem
              key={option.value}
              roleStructure="listoption"
              selected={option.value === value}
              text={option.label}
              htmlTitle={option.title}
              disabled={option.disabled}
              onClick={() => onChange(option.value)}
            />
          ))}
        </Menu>
      }
    >
      <OverlayValueButton
        label={label}
        value={written}
        keyWord={keyWord}
        showKey={showKey}
        swatches={swatches}
        active={open}
        disabled={disabled}
        disabledReason={disabledReason}
        testId={testId}
        opensMenu
      />
    </PopoverNext>
  );
}

/**
 * The menu the value opens.
 *
 * It has a floor width rather than hugging its longest choice, because a menu
 * of three short words opens as a sliver the reader has to aim at.
 */
const OVERLAY_VALUE_MENU_STYLE: CSSProperties = {
  minWidth: 168,
};
