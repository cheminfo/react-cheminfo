import type { Intent } from '@blueprintjs/core';
import type { CSSProperties, ReactElement } from 'react';

/** What every number box takes, whether or not it can be left empty. */
export interface NumberInputBaseProps {
  /**
   * Smallest accepted value, applied when the box is left rather than while it
   * is typed in.
   * @default undefined — unbounded below
   */
  min?: number;
  /**
   * Largest accepted value, applied when the box is left.
   * @default undefined — unbounded above
   */
  max?: number;
  /**
   * What one press of an arrow key or a stepper button adds; Shift multiplies
   * it by ten and Alt divides it by ten.
   * @default 1
   */
  step?: number;
  /**
   * Whether only whole numbers are wanted. A typed decimal is rounded when the
   * box is left.
   * @default false
   */
  integer?: boolean;
  /**
   * Whether the up and down buttons are drawn beside the box.
   * @default true
   */
  buttons?: boolean;
  /**
   * Grey text shown while the box is empty.
   * @default undefined — the box carries no placeholder
   */
  placeholder?: string;
  /** @default false */
  disabled?: boolean;
  /**
   * Whether the control takes the whole width it is given.
   * @default false
   */
  fill?: boolean;
  /**
   * The box as wide as this many digits, its padding included, rather than
   * stretched across its group: a width of a few digits beside a label.
   * @default undefined — the width its group gives it
   */
  digits?: number;
  /** @default 'medium' */
  size?: 'small' | 'medium' | 'large';
  /**
   * Accessible name, for a box no `<label>` points at.
   * @default undefined — the box is named by its label
   */
  ariaLabel?: string;
  /**
   * The box's id, for a `<label htmlFor>` elsewhere in the form.
   * @default undefined
   */
  id?: string;
  /**
   * A name a test finds the box by, written as `data-testid`.
   * @default undefined
   */
  testId?: string;
  /**
   * Drawn inside the box at its left — a unit, a prefix such as `10⁻`.
   * @default undefined
   */
  leftElement?: ReactElement;
  /**
   * Drawn inside the box at its right — a unit, a small button.
   * @default undefined
   */
  rightElement?: ReactElement;
  /**
   * The box's intent while its text reads as a number: `danger` for a number
   * the page refuses and says why beside it. Text that does not read as a
   * number is drawn as `danger` whatever this says.
   * @default 'none'
   */
  intent?: Intent;
  /**
   * Told once the box is left, after its number settled: a form that ends an
   * edit when its field is left.
   * @default undefined
   */
  onBlur?: () => void;
  /** @default undefined */
  className?: string;
  /** @default undefined */
  style?: CSSProperties;
}

/** A box that always holds a number. */
export interface RequiredNumberInputProps extends NumberInputBaseProps {
  /** The number the box shows. */
  value: number;
  /**
   * Whether an emptied box hands up nothing. A required box keeps the number
   * it had and shows it again when the box is left.
   * @default false
   */
  allowEmpty?: false;
  /** Called with the new number, never while the text is half-typed. */
  onChange: (value: number) => void;
}

/** A box that may be left empty, which hands up `undefined`. */
export interface OptionalNumberInputProps extends NumberInputBaseProps {
  /** The number the box shows, or nothing when it is empty. */
  value: number | undefined;
  allowEmpty: true;
  /**
   * Where an arrow key or a stepper button starts from while the box is
   * empty. A box standing for several values that differ — the sizes of the
   * objects selected together — steps from one of them rather than from zero,
   * which would bring every one of them down to the bottom of the range.
   * @default undefined — an empty box steps from zero
   */
  stepFrom?: number;
  /** Called with the new number, or with `undefined` when the box is emptied. */
  onChange: (value: number | undefined) => void;
}

/** What `NumberInput` takes: a required number, or one that may be left empty. */
export type NumberInputProps =
  RequiredNumberInputProps | OptionalNumberInputProps;
