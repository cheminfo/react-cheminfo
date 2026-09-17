/**
 * The colour each line is drawn in, as a step into a sampled ramp.
 *
 * A canvas reassigns `strokeStyle` once per line, and a thousand different
 * colours is a thousand style writes. Quantising the ramp to 121 steps and
 * keeping the rows in the order they came means the style is written about
 * 121 times for the whole figure — while no reader can tell a hundred-and-
 * twenty-first of a ramp apart from its neighbour.
 */

import type { ColorScale } from '../../color/core/interpolate.ts';
import { evenScale, sampleScale } from '../../color/core/interpolate.ts';
import { positionInRange } from '../../color/core/scale.ts';
import { resolveColorScale } from '../../color/core/scaleText.ts';
import { DEFAULT_COLOR_SCALE_ID } from '../../color/core/scales.ts';

import { parallelExtent } from './parallelExtent.ts';
import type { ParallelColorBy } from './parallelTypes.ts';

/** How many steps the ramp is quantised into; there is one more colour than steps. */
export const PARALLEL_PALETTE_STEPS = 120;

/**
 * The ramp, sampled into the steps a line's colour is looked up by.
 * @param scale - The ramp, as the registry hands it over or as a plain list of colours. Defaults to viridis.
 * @returns `PARALLEL_PALETTE_STEPS + 1` colours, from the low end to the high end.
 */
export function parallelPalette(
  scale?: ColorScale | readonly string[],
): readonly string[] {
  return sampleScale(resolveRamp(scale), PARALLEL_PALETTE_STEPS + 1);
}

/**
 * Which step of the ramp each row takes.
 *
 * Worked out once per data change rather than per repaint, and held as bytes:
 * a library of ten thousand rows costs ten kilobytes and the painter's inner
 * loop reads an integer instead of placing a value on a ramp.
 * @param color - The quantity the lines are coloured by.
 * @param count - How many rows there are.
 * @returns One step per row, from `0` to {@link PARALLEL_PALETTE_STEPS}.
 */
export function parallelColorSteps(
  color: ParallelColorBy,
  count: number,
): Uint8Array {
  const steps = new Uint8Array(count);
  const extent = parallelExtent(color.values, count);
  const min = color.min ?? extent.min;
  const max = color.max ?? extent.max;
  const logarithmic = color.logarithmic ?? false;
  const span = max - min;
  const rows = Math.min(count, color.values.length);
  for (let row = 0; row < rows; row++) {
    const value = color.values[row] as number;
    steps[row] = logarithmic
      ? Math.round(
          positionInRange(value, min, max, { logarithmic: true }) *
            PARALLEL_PALETTE_STEPS,
        )
      : colorStep(value, min, span);
  }
  return steps;
}

function resolveRamp(scale?: ColorScale | readonly string[]): ColorScale {
  if (scale === undefined) {
    return resolveColorScale(DEFAULT_COLOR_SCALE_ID).scale;
  }
  return 'stops' in scale ? scale : evenScale(scale);
}

function colorStep(value: number, min: number, span: number): number {
  if (span <= 0) return 0;
  const ratio = (value - min) / span;
  if (Number.isNaN(ratio) || ratio < 0) return 0;
  if (ratio > 1) return PARALLEL_PALETTE_STEPS;
  return Math.round(ratio * PARALLEL_PALETTE_STEPS);
}
