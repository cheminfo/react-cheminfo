import type { ColorScale } from './interpolate.ts';
import { sampleScale } from './interpolate.ts';

const PERCENT = 100;
const DECIMALS = 2;

/**
 * A colour scale written as the CSS gradient that draws it.
 *
 * The scale is sampled rather than handed over as its anchors, because a
 * browser only interpolates the straight line between two colours: a scale
 * that turns around the colour wheel would otherwise be drawn as the grey
 * shortcut across it.
 * @param scale - The scale to draw, from its low end at the left.
 * @param samples - How many colours to write out; more of them for a scale that turns.
 * @returns The `linear-gradient(…)` value.
 * @throws {Error} When the scale has no anchor, or one of them is not a hex colour.
 */
export function colorScaleGradient(scale: ColorScale, samples: number): string {
  const colors = sampleScale(scale, samples);
  const last = colors.length - 1;
  const stops: string[] = [];
  for (let index = 0; index < colors.length; index++) {
    const color = colors[index];
    if (color === undefined) continue;
    stops.push(`${color} ${((index / last) * PERCENT).toFixed(DECIMALS)}%`);
  }
  return `linear-gradient(to right, ${stops.join(', ')})`;
}
