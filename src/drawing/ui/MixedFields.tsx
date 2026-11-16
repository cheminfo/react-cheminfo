import {
  FormGroup,
  HTMLSelect,
  SegmentedControl,
  Switch,
} from '@blueprintjs/core';
import type { ReactElement, ReactNode } from 'react';

import type { NumberInputBaseProps } from '../../number/ui/NumberInput.tsx';
import { NumberInput } from '../../number/ui/NumberInput.tsx';
import type { FontChoice } from '../core/fonts.ts';
import { FONTS } from '../core/fonts.ts';
import { MIXED, MIXED_VALUE } from '../core/mixed.ts';
import { sharedValue } from '../core/shared.ts';

/** The class of a select the objects differ on, its text greyed. */
const MIXED_SELECT = 'mixed-select';

/** What {@link SharedNumberInput} needs, beside the box's own settings. */
export interface SharedNumberInputProps<T> extends Omit<
  NumberInputBaseProps,
  'placeholder'
> {
  /** The objects selected. */
  objects: readonly T[];
  /** The number of one of them, its default filled in. */
  read: (object: T) => number;
  /** Called with the number typed, for all of them. */
  onChange: (value: number) => void;
}

/**
 * A number shared by the objects selected: the number when they all have
 * it, an empty box saying "Mixed" when they differ, and the number typed
 * then given to all of them. A stepper or an arrow key on a mixed box
 * starts from the first object's number.
 * @param props - See {@link SharedNumberInputProps}.
 * @returns The box.
 */
export function SharedNumberInput<T>(
  props: SharedNumberInputProps<T>,
): ReactElement {
  const { objects, read, onChange, ...box } = props;
  const value = sharedValue(objects, read);
  const [first] = objects;
  // Only a mixed box may be empty: one emptied while the objects agree
  // shows their number again when it is left.
  return value === undefined ? (
    <NumberInput
      {...box}
      allowEmpty
      value={undefined}
      stepFrom={first === undefined ? undefined : read(first)}
      placeholder={MIXED}
      onChange={(next: number | undefined) => {
        if (next !== undefined) onChange(next);
      }}
    />
  ) : (
    <NumberInput {...box} value={value} onChange={onChange} />
  );
}

/** What {@link SharedSwitch} needs. */
export interface SharedSwitchProps {
  /** What it switches. */
  label: string;
  /** Whether it is on, undefined when the objects differ. */
  checked: boolean | undefined;
  /** Called with the new state. */
  onChange: (checked: boolean) => void;
}

/**
 * A switch shared by the objects selected: on when it is on for all of
 * them, off with "mixed" beside its label when they differ, so one click
 * turns it on for all.
 * @param props - See {@link SharedSwitchProps}.
 * @returns The switch.
 */
export function SharedSwitch(props: SharedSwitchProps): ReactElement {
  const { label, checked, onChange } = props;
  return (
    <Switch
      checked={checked ?? false}
      labelElement={
        checked === undefined ? (
          <>
            {label} <span className={MIXED_VALUE}>{MIXED.toLowerCase()}</span>
          </>
        ) : (
          label
        )
      }
      onChange={(event) => {
        onChange(event.currentTarget.checked);
      }}
    />
  );
}

/** What {@link ChoiceField} needs. */
export interface ChoiceFieldProps<T extends string> {
  /** The field's label. */
  label: string;
  /**
   * What is said under the field.
   * @default nothing
   */
  helperText?: ReactNode;
  /** The option pressed, undefined while the objects differ on it. */
  value: T | undefined;
  /** The options, in the order they are shown. */
  options: ReadonlyArray<{ label: string; value: T }>;
  /**
   * Whether the field is greyed and takes no click.
   * @default false
   */
  disabled?: boolean;
  /** Called with the option chosen. */
  onChange: (value: T) => void;
}

/**
 * A labelled choice among a few options, all in view: the `value` pressed,
 * or none while it is undefined, the objects differing on it.
 * @param props - See {@link ChoiceFieldProps}.
 * @returns The field.
 */
export function ChoiceField<T extends string>(
  props: ChoiceFieldProps<T>,
): ReactElement {
  const { label, helperText, value, options, disabled, onChange } = props;
  return (
    <FormGroup label={label} helperText={helperText} disabled={disabled}>
      <SegmentedControl
        size="small"
        fill
        disabled={disabled}
        value={value ?? ''}
        options={[...options]}
        onValueChange={(next) => {
          onChange(next as T);
        }}
      />
    </FormGroup>
  );
}

/** What {@link MixedSelect} needs. */
export interface MixedSelectProps<T extends string> {
  /** The option picked, undefined while the objects differ on it. */
  value: T | undefined;
  /** The options, in the order they are listed. */
  options: ReadonlyArray<{ value: T; label: string }>;
  /** The select's name, for a screen reader. */
  ariaLabel: string;
  /** Called with the option picked. */
  onChange: (value: T) => void;
  /**
   * The select's `id`, for a label pointing at it.
   * @default undefined
   */
  id?: string;
  /**
   * A class of the select's own.
   * @default undefined
   */
  className?: string;
  /**
   * Whether the select takes the whole width of its row.
   * @default false
   */
  fill?: boolean;
}

/**
 * A drop-down of the editor under a single caret, led by a greyed "Mixed"
 * nobody can pick while `value` is undefined, the objects differing on it.
 * @param props - See {@link MixedSelectProps}.
 * @returns The select.
 */
export function MixedSelect<T extends string>(
  props: MixedSelectProps<T>,
): ReactElement {
  const { value, options, ariaLabel, onChange, id, className, fill } = props;
  const mixed = value === undefined;
  return (
    <HTMLSelect
      iconName="caret-down"
      id={id}
      fill={fill}
      className={
        mixed ? `${className ?? ''} ${MIXED_SELECT}`.trim() : className
      }
      value={value ?? ''}
      aria-label={ariaLabel}
      options={
        mixed
          ? [{ value: '', label: MIXED, disabled: true }, ...options]
          : options
      }
      onChange={(event) => {
        onChange(event.currentTarget.value as T);
      }}
    />
  );
}

/** What {@link FontSelect} needs. */
export interface FontSelectProps {
  /** The CSS font family in use, undefined while the objects differ on it. */
  value: string | undefined;
  /** The select's name, for a screen reader. */
  label: string;
  /**
   * The fonts offered.
   * @default FONTS — the label fonts
   */
  fonts?: readonly FontChoice[];
  /** Called with the CSS font family picked. */
  onChange: (family: string) => void;
}

/**
 * The font something is written in, picked by its name among `fonts`, the
 * label fonts unless told otherwise.
 * @param props - See {@link FontSelectProps}.
 * @returns The select.
 */
export function FontSelect(props: FontSelectProps): ReactElement {
  const { value, label, fonts = FONTS, onChange } = props;
  return (
    <MixedSelect
      fill
      value={value}
      ariaLabel={label}
      options={fonts.map((font) => ({ value: font.family, label: font.name }))}
      onChange={onChange}
    />
  );
}
