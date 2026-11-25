import type { ReactElement } from 'react';

import { roundTo } from '../../format/core/roundTo.ts';
import { NumberInput } from '../../number/ui/NumberInput.tsx';
import type { NumberInputBaseProps } from '../../number/ui/NumberInputProps.ts';

/** The props a mark's style input passes on to its number box. */
type BoxProps = Pick<
  NumberInputBaseProps,
  'id' | 'ariaLabel' | 'disabled' | 'size' | 'style' | 'testId'
>;

/** What {@link MarkOpacityInput} needs. */
export interface MarkOpacityInputProps extends BoxProps {
  /** The opacity, from 0 to 1, as a drawing stores it. */
  value: number;
  /** Called with the opacity typed, from 0 to 1. */
  onChange: (value: number) => void;
}

/** What {@link MarkSizeInput} needs. */
export interface MarkSizeInputProps extends BoxProps {
  /** The size, in pixels of the image the mark is drawn on. */
  value: number;
  /** Called with the size typed. */
  onChange: (value: number) => void;
  /**
   * The smallest it may be.
   * @default the step
   */
  min?: number;
  /**
   * The largest it may be.
   * @default undefined — no largest
   */
  max?: number;
  /**
   * What an arrow key adds.
   * @default 0.5
   */
  step?: number;
}

/**
 * A mark's opacity — an outline, a fill, a label — typed as a percentage, 0
 * to 100 % by fives on the arrow keys, while the value given and handed back
 * is the fraction a drawing stores. Every panel of a drawing writes an
 * opacity this one way, so `0.25` never reads as a fraction in one panel and
 * `25 %` in the next.
 * @param props - See {@link MarkOpacityInputProps}.
 * @returns The box.
 */
export function MarkOpacityInput(props: MarkOpacityInputProps): ReactElement {
  const { value, onChange, ...box } = props;
  return (
    <NumberInput
      {...box}
      value={roundTo(value * 100, 1)}
      min={0}
      max={100}
      step={OPACITY_STEP}
      rightElement={<span>%</span>}
      onChange={(percent) => onChange(roundTo(percent / 100, 4))}
    />
  );
}

/**
 * A mark's size in pixels of the image — a stroke's width, a label's size —,
 * a positive number typed, a step on the arrow keys: the one size box of
 * every panel of a drawing.
 * @param props - See {@link MarkSizeInputProps}.
 * @returns The box.
 */
export function MarkSizeInput(props: MarkSizeInputProps): ReactElement {
  const { value, onChange, max, step = 0.5, ...rest } = props;
  const { min = step, ...box } = rest;
  return (
    <NumberInput
      {...box}
      value={value}
      min={min}
      {...(max === undefined ? {} : { max })}
      step={step}
      rightElement={<span>px</span>}
      onChange={onChange}
    />
  );
}

/** Five percent a press: twenty to go from clear to opaque. */
const OPACITY_STEP = 5;
