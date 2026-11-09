import { Button, Icon, PopoverNext } from '@blueprintjs/core';
import type { ReactElement, ReactNode } from 'react';
import { ColorPicker } from 'react-science/ui';

import { joinColor, splitColor } from '../core/palette.ts';

/** What {@link SwatchRow} needs. */
export interface SwatchRowProps {
  /** What the row colours, the name of its group for a screen reader. */
  label: string;
  /** The colours offered, `#rrggbb` or `#rrggbbaa`, and their names. */
  colors: ReadonlyArray<{ name: string; value: string }>;
  /** The colour pressed, or undefined for none. */
  value: string | undefined;
  /** Called with the colour of the swatch pressed. */
  onPick: (color: string) => void;
  /**
   * A swatch's name for a screen reader, from its colour's.
   * @default it
   */
  nameOf?: (name: string) => string;
  /**
   * What stands before the swatches: a "none".
   * @default nothing
   */
  leading?: ReactNode;
  /**
   * What stands after them: a {@link CustomColorButton}.
   * @default nothing
   */
  custom?: ReactNode;
  /**
   * Whether the swatches keep to one line, the last dropped.
   * @default false
   */
  clip?: boolean;
}

/**
 * A row of round swatches, one pressed for the colour in use.
 * @param props - See {@link SwatchRowProps}.
 * @returns The row.
 */
export function SwatchRow(props: SwatchRowProps): ReactElement {
  const { label, colors, value, onPick, nameOf, leading, custom, clip } = props;
  const swatches = colors.map((color) => (
    <button
      key={color.value}
      type="button"
      className="color-row__swatch"
      style={{ background: color.value }}
      title={color.name}
      aria-label={nameOf ? nameOf(color.name) : color.name}
      aria-pressed={value === color.value}
      onClick={() => {
        onPick(color.value);
      }}
    />
  ));
  return (
    <div className="color-row" role="group" aria-label={label}>
      {leading}
      {clip ? <div className="color-row__swatches">{swatches}</div> : swatches}
      {custom}
    </div>
  );
}

/** What {@link CustomColorButton} shows and offers. */
export interface CustomColorButtonProps {
  /** The colour in use, or undefined for none. */
  value: string | undefined;
  /** The colours the picker offers again. */
  presets: string[];
  /**
   * What the button is named.
   * @default 'Another colour, with its opacity'
   */
  label?: string;
  /** Called with the colour picked. */
  onPick: (color: string) => void;
}

/**
 * The last button of a row of swatches: any other colour, with its opacity.
 * While `value` is none of the `presets`, the button is pressed and its drop
 * painted in that colour; with no value, the picker opens on the first preset.
 * @param props - See {@link CustomColorButtonProps}.
 * @returns The button and its picker.
 */
export function CustomColorButton(props: CustomColorButtonProps): ReactElement {
  const { value, presets, onPick } = props;
  const { label = 'Another colour, with its opacity' } = props;
  const color = value ?? presets[0] ?? '#000000';
  const custom = value !== undefined && !presets.includes(value.toLowerCase());
  return (
    <PopoverNext
      placement="bottom-end"
      content={
        <ColorPicker
          color={{ hex: color }}
          presetColors={presets}
          onChangeComplete={(change) => {
            onPick(joinColor(change.hex, change.rgb.a));
          }}
        />
      }
    >
      <Button
        size="small"
        variant="minimal"
        active={custom}
        icon={
          custom ? <Icon icon="tint" color={splitColor(color).hex} /> : 'tint'
        }
        aria-label={label}
        title={label}
      />
    </PopoverNext>
  );
}
