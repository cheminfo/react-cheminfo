import type { ReactElement } from 'react';

import { NumberInput } from '../../number/ui/NumberInput.tsx';
import { PAGE_LIMITS, POINTS_PER_CM } from '../core/pages.ts';

const MIN_SIDE = PAGE_LIMITS.min / POINTS_PER_CM;
const MAX_SIDE = PAGE_LIMITS.max / POINTS_PER_CM;

/**
 * A side of a sheet of paper, in centimetres.
 * @param props - The side.
 * @param props.label - Its name.
 * @param props.value - Its length in points.
 * @param props.onChange - Called with the length in points.
 * @returns The field.
 */
export function PageSideInput(props: {
  label: string;
  value: number;
  onChange: (side: number) => void;
}): ReactElement {
  const { label, value, onChange } = props;
  return (
    <NumberInput
      size="small"
      buttons={false}
      ariaLabel={`${label}, in centimetres`}
      value={round(value / POINTS_PER_CM)}
      min={MIN_SIDE}
      max={MAX_SIDE}
      step={0.1}
      onChange={(centimetres: number) => {
        if (fits(centimetres)) onChange(centimetres * POINTS_PER_CM);
      }}
    />
  );
}

/**
 * A side of a figure in centimetres; emptied, it fits the drawing.
 * @param props - The side.
 * @param props.label - Its name.
 * @param props.value - Its length in points, when it is set.
 * @param props.onChange - Called with the length in points, or undefined.
 * @returns The field.
 */
export function FigureSideInput(props: {
  label: string;
  value: number | undefined;
  onChange: (side: number | undefined) => void;
}): ReactElement {
  const { label, value, onChange } = props;
  return (
    <NumberInput
      size="small"
      buttons={false}
      allowEmpty
      ariaLabel={`${label}, in centimetres; empty fits the drawing`}
      placeholder="fits"
      value={value === undefined ? undefined : round(value / POINTS_PER_CM)}
      min={MIN_SIDE}
      max={MAX_SIDE}
      step={0.1}
      onChange={(centimetres: number | undefined) => {
        if (centimetres === undefined) onChange(undefined);
        else if (fits(centimetres)) onChange(centimetres * POINTS_PER_CM);
      }}
    />
  );
}

// A side typed halfway (the 2 of 21) waits for the next digit rather than being
// raised to the smallest side under the caret.
function fits(centimetres: number): boolean {
  return centimetres >= MIN_SIDE && centimetres <= MAX_SIDE;
}

// To the hundredth, so a side typed to the millimetre reads back as typed.
function round(value: number): number {
  return Math.round(value * 100) / 100;
}
