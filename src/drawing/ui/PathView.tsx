import type { ReactElement } from 'react';

import type { PathPrimitive } from '../render/primitives.ts';

import type { LineWidthStyle } from './pathProps.ts';
import { fillProps, strokeProps } from './pathProps.ts';

/**
 * A path primitive as live SVG: its stroke, its dashes and its fill, the
 * stroke's colour and width left to the group around it when they are the
 * drawing's. A gradient fill names its `<defs>`, which `<GradientDefs>`
 * writes.
 * @param props - The path and the drawing style.
 * @param props.primitive - The path.
 * @param props.style - The drawing style, for the width its strokes start from.
 * @returns The `<path>`.
 */
export function PathView(props: {
  primitive: PathPrimitive;
  style: LineWidthStyle;
}): ReactElement {
  const { primitive, style } = props;
  return (
    <path
      d={primitive.d}
      {...strokeProps(primitive, style)}
      {...fillProps(primitive)}
    />
  );
}
