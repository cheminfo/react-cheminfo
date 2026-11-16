import { FormGroup } from '@blueprintjs/core';
import type { ReactElement } from 'react';

import { resizedAboutCentre } from '../core/pictures.ts';
import type { Box } from '../core/types.ts';

import { SharedNumberInput } from './MixedFields.tsx';

/** The longest side the fields accept, in points: a poster's width. */
const MAX_SIDE = 5000;

type Side = 'width' | 'height';

const SIDES: readonly Side[] = ['width', 'height'];

/** What {@link BoxSizeFields} needs. */
export interface BoxSizeFieldsProps<T extends Box> {
  /** The objects selected. */
  objects: readonly T[];
  /** Changes each object by the box it is given, resized about its middle. */
  edit: (resize: (object: T) => Partial<Box>) => void;
  /** The smallest side the fields give an object, in points. */
  minSide: number;
  /** What the objects are, as the boxes name them: "Shape", "Picture". */
  label: string;
  /**
   * Whether a side typed keeps each one's proportions.
   * @default false
   */
  proportional?: boolean;
}

/**
 * The width and the height of the boxes selected, each resized about its
 * middle; objects of different sizes leave the box saying so.
 * @param props - See {@link BoxSizeFieldsProps}.
 * @returns The fields.
 */
export function BoxSizeFields<T extends Box>(
  props: BoxSizeFieldsProps<T>,
): ReactElement {
  const { objects, edit, minSide, label, proportional = false } = props;
  return (
    <div className="size-fields">
      {SIDES.map((side) => (
        <FormGroup
          key={side}
          label={side === 'width' ? 'Width' : 'Height'}
          labelInfo="pt"
        >
          <SharedNumberInput
            size="small"
            ariaLabel={`${label} ${side}, in points`}
            fill
            objects={objects}
            read={(object) => round(object[side])}
            min={minSide}
            max={MAX_SIDE}
            step={1}
            onChange={(value) => {
              edit((object) => {
                const { width, height } = typed(
                  object,
                  side,
                  value,
                  proportional,
                );
                // A side typed halfway (the 3 of 300) would be raised to the
                // smallest side and lose the proportions, so it waits for the
                // next digit.
                if (width < minSide || height < minSide) return {};
                return resizedAboutCentre(object, width, height);
              });
            }}
          />
        </FormGroup>
      ))}
    </div>
  );
}

// The sides of a box one side is typed for, the other kept or scaled.
function typed(box: Box, side: Side, value: number, proportional: boolean) {
  if (side === 'width') {
    const height = proportional ? (box.height * value) / box.width : box.height;
    return { width: value, height };
  }
  const width = proportional ? (box.width * value) / box.height : box.width;
  return { width, height: value };
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}
