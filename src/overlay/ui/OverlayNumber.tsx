import type { KeyboardEvent, ReactElement } from 'react';

import type { OverlayControlProps } from './OverlayRow.tsx';
import { OverlayRow } from './OverlayRow.tsx';
import {
  overlayNumberValueStyle,
  overlayStepperButtonStyle,
  overlayStepperStyle,
} from './overlayStepperStyles.ts';
import { useOverlaySurface } from './overlaySurface.ts';

/** What {@link OverlayNumber} needs. */
export interface OverlayNumberProps extends OverlayControlProps {
  /** The current value. */
  value: number;
  /** The smallest it may be. */
  min: number;
  /** The largest it may be. */
  max: number;
  /** Called with the new value, already held inside the range. */
  onChange: (value: number) => void;
  /**
   * How much one press, or one arrow key, moves it.
   * @default 1
   */
  step?: number;
  /**
   * Decimals the value is written with, so the control does not resize as the
   * reader steps through it.
   * @default 0
   */
  digits?: number;
  /**
   * Written after the value, e.g. `px`.
   * @default '' — no unit is written
   */
  unit?: string;
}

/**
 * A value the reader nudges up and down.
 *
 * It is two buttons around a number rather than a field, because over a figure
 * the reader is not typing a value, they are hunting for the one that makes
 * the picture read — and on a phone a text field raises a keyboard that covers
 * the very picture the value is being chosen against. The end of the range is
 * shown by the button going dead rather than by a value that refuses to move,
 * so the reader can see where the limit is before pressing into it.
 * @param props - See {@link OverlayNumberProps}.
 * @returns The stepper.
 */
export function OverlayNumber(props: OverlayNumberProps): ReactElement {
  const {
    value,
    min,
    max,
    onChange,
    label,
    help,
    hideLabel = false,
    disabled = false,
    testId,
    step = 1,
    digits = 0,
    unit = '',
  } = props;
  const { metrics } = useOverlaySurface();

  function move(steps: number): void {
    const next = clamp(value + steps * step, min, max);
    if (next !== value) onChange(next);
  }

  function onKeyDown(event: KeyboardEvent<HTMLElement>): void {
    const steps = STEPS_BY_KEY.get(event.key);
    if (steps === undefined || disabled) return;
    event.preventDefault();
    move(steps);
  }

  return (
    <OverlayRow
      label={label}
      help={help}
      hideLabel={hideLabel}
      disabled={disabled}
    >
      <span style={overlayStepperStyle(metrics)} data-testid={testId}>
        <button
          type="button"
          style={overlayStepperButtonStyle(metrics, disabled || value <= min)}
          disabled={disabled || value <= min}
          aria-label={`Decrease ${label}`}
          onClick={() => move(-1)}
          onKeyDown={onKeyDown}
        >
          −
        </button>
        <span
          style={overlayNumberValueStyle(metrics, widestValue(props))}
          aria-live="polite"
        >
          {`${value.toFixed(digits)}${unit}`}
        </span>
        <button
          type="button"
          style={overlayStepperButtonStyle(metrics, disabled || value >= max)}
          disabled={disabled || value >= max}
          aria-label={`Increase ${label}`}
          onClick={() => move(1)}
          onKeyDown={onKeyDown}
        >
          +
        </button>
      </span>
    </OverlayRow>
  );
}

/**
 * How long the longest value of a stepper is, in characters.
 *
 * Both ends of the range are measured rather than the value in hand: reserving
 * room for what is currently written is reserving the wrong room the moment
 * the reader presses a button.
 * @param props - See {@link OverlayNumberProps}.
 * @returns The character count.
 */
function widestValue(props: OverlayNumberProps): number {
  const { min, max, digits = 0, unit = '' } = props;
  const ends = Math.max(min.toFixed(digits).length, max.toFixed(digits).length);
  return ends + unit.length;
}

/**
 * Where a step lands, held inside the range and rounded back onto the grid.
 *
 * Adding a fractional step to a float drifts — ten presses of `0.1` land on
 * `0.9999999999999999` — and a value that arrives at the caller one part in a
 * quadrillion off its own limit is a value the caller's own clamp rejects.
 * @param value - Where the step landed.
 * @param min - The smallest it may be.
 * @param max - The largest it may be.
 * @returns The value the caller is handed.
 */
function clamp(value: number, min: number, max: number): number {
  const rounded = Math.round(value * FLOAT_GRID) / FLOAT_GRID;
  if (rounded < min) return min;
  if (rounded > max) return max;
  return rounded;
}

const FLOAT_GRID = 1e10;

const STEPS_BY_KEY = new Map([
  ['ArrowUp', 1],
  ['ArrowRight', 1],
  ['ArrowDown', -1],
  ['ArrowLeft', -1],
]);
