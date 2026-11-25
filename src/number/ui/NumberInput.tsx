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
import { joinClassNames } from '../../shared/ui/joinClassNames.ts';
import {
  isPartialNumber,
  numberText,
  readNumber,
  stepNumber,
} from '../core/numberText.ts';

import type { NumberInputProps } from './NumberInputProps.ts';

export type {
  NumberInputBaseProps,
  NumberInputProps,
  OptionalNumberInputProps,
  RequiredNumberInputProps,
} from './NumberInputProps.ts';

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
    digits,
    size = 'medium',
    ariaLabel,
    id,
    testId,
    leftElement,
    rightElement,
    intent = 'none',
    onBlur,
    className,
    style,
  } = props;
  const t = useChromeT();
  const onChange = props.onChange as (next: number | undefined) => void;
  const stepFrom = props.allowEmpty ? props.stepFrom : undefined;
  const [draft, setDraft] = useState(() => ({
    text: numberText(value),
    held: value,
    given: value,
  }));

  // The number changed elsewhere — a preset, a reset, a link — so the box has
  // to follow. Only a change of the prop counts: a parent that ignores a typed
  // number, the `1` of `15` below its minimum, leaves the prop where it was
  // and the `1` stays typed. A change to what the box itself handed up is not
  // followed either, or `-0.` would be rewritten as `0` under the caret.
  if (value !== draft.given) {
    setDraft(
      value === draft.held
        ? { ...draft, given: value }
        : { text: numberText(value), held: value, given: value },
    );
  }

  function hold(text: string, held: number | undefined, given = draft.given) {
    setDraft({ text, held, given });
  }

  function commit(next: number) {
    // A settled number is final, so one the parent refuses is not left shown.
    hold(numberText(next), next, Number.NaN);
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
    const from = readNumber(draft.text) ?? value ?? stepFrom ?? 0;
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
      intent={isPartialNumber(draft.text) ? intent : 'danger'}
      inputMode={integer ? 'numeric' : 'decimal'}
      spellCheck={false}
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="off"
      aria-label={ariaLabel}
      data-testid={testId}
      leftElement={leftElement}
      rightElement={rightElement}
      className={
        joinClassNames(
          (leftElement !== undefined || rightElement !== undefined) &&
            'input-affix',
          buttons ? undefined : className,
        ) || undefined
      }
      style={
        buttons ? digitsWidth(digits) : { ...style, ...digitsWidth(digits) }
      }
      onValueChange={type}
      onKeyDown={press}
      onBlur={() => {
        leave();
        onBlur?.();
      }}
    />
  );

  if (!buttons) return box;

  const shown = readNumber(draft.text) ?? value ?? stepFrom;
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
 * The width of a box holding some digits: a character each, and two more for
 * the box's padding either side.
 * @param digits - How many digits it holds, if it is sized by them.
 * @returns The style, or nothing for a box its group sizes.
 */
function digitsWidth(digits: number | undefined): CSSProperties | undefined {
  return digits === undefined ? undefined : { width: `${digits + 2}ch` };
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
