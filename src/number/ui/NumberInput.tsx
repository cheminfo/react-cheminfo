import {
  Button,
  ButtonGroup,
  Classes,
  ControlGroup,
  InputGroup,
} from '@blueprintjs/core';
import type { CSSProperties, KeyboardEvent, ReactElement } from 'react';
import { useState } from 'react';

import { clamp } from '../../format/core/clamp.ts';
import { useChromeT } from '../../i18n/ui/useT.ts';
import {
  isPartialNumber,
  numberText,
  readNumber,
  stepNumber,
} from '../core/numberText.ts';

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
  /** Called with the new number, or with `undefined` when the box is emptied. */
  onChange: (value: number | undefined) => void;
}

/** See {@link NumberInput}. */
export type NumberInputProps =
  RequiredNumberInputProps | OptionalNumberInputProps;

/**
 * A number typed into a box.
 *
 * The box keeps what was typed rather than what parsed. A reader halfway
 * through `0.2` has typed `0.`, which reads as zero, and a box rendered from
 * that number would write `0` back over the dot before the `2` arrives —
 * which is why Blueprint's `NumericInput` cannot be given a number to show and
 * is never used directly on our sites. Nothing is handed up until the text
 * reads as a number, so a calculation never sees a half-typed value, and the
 * bounds are applied when the box is left rather than under the caret.
 * @param props - See {@link NumberInputProps}.
 * @returns The box, with its stepper buttons unless they are turned off.
 */
export function NumberInput(props: NumberInputProps): ReactElement {
  const {
    value,
    min,
    max,
    step = 1,
    integer = false,
    allowEmpty = false,
    buttons = true,
    placeholder,
    disabled = false,
    fill = false,
    size = 'medium',
    ariaLabel,
    id,
    testId,
    leftElement,
    rightElement,
    className,
    style,
  } = props;
  const t = useChromeT();
  const onChange = props.onChange as (next: number | undefined) => void;
  const [draft, setDraft] = useState(() => ({
    text: numberText(value),
    held: value,
  }));

  // The number changed elsewhere — a preset, a reset, a link — so the box has
  // to follow. `held` is what this box last handed up, not the prop it was
  // rendered with: comparing against the prop would make the box's own edit
  // look external and rewrite `-0.` as `0` under the caret.
  if (draft.held !== value) setDraft({ text: numberText(value), held: value });

  function hold(text: string, held: number | undefined) {
    setDraft({ text, held });
  }

  function commit(next: number) {
    hold(numberText(next), next);
    onChange(next);
  }

  function type(text: string) {
    const emptied = text.trim() === '';
    const parsed = readNumber(text, integer);
    hold(text, emptied && allowEmpty ? undefined : (parsed ?? value));
    if (emptied) {
      if (allowEmpty) onChange(undefined);
    } else if (parsed !== undefined) {
      onChange(parsed);
    }
  }

  function leave() {
    if (draft.text.trim() === '') {
      if (!allowEmpty) hold(numberText(value), value);
      return;
    }
    const parsed = readNumber(draft.text);
    if (parsed === undefined) {
      hold(numberText(value), value);
      return;
    }
    const settled = settle(parsed, integer, min, max);
    if (settled !== parsed || !Object.is(settled, value)) commit(settled);
  }

  function press(event: KeyboardEvent<HTMLInputElement>) {
    const direction =
      event.key === 'ArrowUp' ? 1 : event.key === 'ArrowDown' ? -1 : 0;
    if (direction === 0 || disabled) return;
    event.preventDefault();
    const scale = event.shiftKey ? 10 : event.altKey ? 0.1 : 1;
    move(direction * scale);
  }

  function move(scale: number) {
    const from = readNumber(draft.text) ?? value ?? 0;
    commit(settle(stepNumber(from, step * scale), integer, min, max));
  }

  const box = (
    <InputGroup
      id={id}
      size={size}
      fill={fill}
      disabled={disabled}
      placeholder={placeholder}
      value={draft.text}
      intent={isPartialNumber(draft.text) ? 'none' : 'danger'}
      inputMode={integer ? 'numeric' : 'decimal'}
      spellCheck={false}
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="off"
      aria-label={ariaLabel}
      data-testid={testId}
      leftElement={leftElement}
      rightElement={rightElement}
      className={buttons ? undefined : className}
      style={buttons ? undefined : style}
      onValueChange={type}
      onKeyDown={press}
      onBlur={leave}
    />
  );

  if (!buttons) return box;

  const shown = readNumber(draft.text) ?? value;
  return (
    <ControlGroup
      fill={fill}
      style={style}
      className={[Classes.NUMERIC_INPUT, className].filter(Boolean).join(' ')}
    >
      {box}
      <ButtonGroup className={`${Classes.FIXED} no-print`} vertical>
        <Button
          icon="chevron-up"
          size={size}
          aria-label={t('number.increment')}
          disabled={
            disabled ||
            (max !== undefined && shown !== undefined && shown >= max)
          }
          onClick={() => move(1)}
        />
        <Button
          icon="chevron-down"
          size={size}
          aria-label={t('number.decrement')}
          disabled={
            disabled ||
            (min !== undefined && shown !== undefined && shown <= min)
          }
          onClick={() => move(-1)}
        />
      </ButtonGroup>
    </ControlGroup>
  );
}

/**
 * The number a box settles on once it is left or stepped.
 * @param value - What the text read as.
 * @param integer - Whether only whole numbers are wanted.
 * @param min - Smallest accepted value, when there is one.
 * @param max - Largest accepted value, when there is one.
 * @returns The rounded, bounded number.
 */
function settle(
  value: number,
  integer: boolean,
  min: number | undefined,
  max: number | undefined,
): number {
  const rounded = integer ? Math.round(value) : value;
  return clamp(
    rounded,
    min ?? Number.NEGATIVE_INFINITY,
    max ?? Number.POSITIVE_INFINITY,
    rounded,
  );
}
