import type { CSSProperties, ReactElement } from 'react';

import { colorScaleGradient } from '../core/gradient.ts';
import type { ColorScale } from '../core/interpolate.ts';

const DEFAULT_HEIGHT = 10;
const DEFAULT_SAMPLES = 24;

/** What {@link ColorScaleBar} draws. */
export interface ColorScaleBarProps {
  /** The scale to draw, from its low end at the left. */
  scale: ColorScale;
  /**
   * How tall the strip is, in pixels.
   * @default 10
   */
  height?: number;
  /**
   * How many colours the gradient is written from. A scale that turns around
   * the colour wheel needs more of them than one that mixes three channels,
   * because the browser can only interpolate the straight line between two.
   * @default 24
   */
  samples?: number;
  /**
   * What a screen reader is told the strip shows.
   * @default '' — the strip is decoration, and is hidden from the reader
   */
  label?: string;
  /**
   * Anything the caller has to set on the strip itself, a width above all.
   * @default {}
   */
  style?: CSSProperties;
}

/**
 * A colour scale as one strip of colour.
 *
 * The picker, the editor and any caller who has to show a ramp without its end
 * values draw the same strip, so a scale looks the same wherever it is offered.
 * @param props - See {@link ColorScaleBarProps}.
 * @returns The strip.
 */
export function ColorScaleBar(props: ColorScaleBarProps): ReactElement {
  const {
    scale,
    height = DEFAULT_HEIGHT,
    samples = DEFAULT_SAMPLES,
    label = '',
    style = {},
  } = props;

  return (
    <span
      role={label === '' ? undefined : 'img'}
      aria-label={label === '' ? undefined : label}
      aria-hidden={label === '' ? true : undefined}
      style={{
        ...BAR_STYLE,
        height,
        backgroundImage: colorScaleGradient(scale, samples),
        ...style,
      }}
    />
  );
}

const BAR_STYLE = {
  display: 'block',
  width: '100%',
  borderRadius: 3,
} as const satisfies CSSProperties;
