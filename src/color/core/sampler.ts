import { clamp } from '../../format/core/clamp.ts';

import type { RgbColor } from './hex.ts';
import { parseHexColor, roundChannel } from './hex.ts';
import type { HsvColor } from './hsv.ts';
import { rgbToHsv } from './hsv.ts';
import { huePath, lerp, mixTones } from './huePath.ts';
import type { ColorScale, ColorStop } from './interpolate.ts';

/**
 * Writes the colour a scale takes at a position into `out` from `offset`: red,
 * green and blue, each a whole number from 0 to 255.
 */
export type ScaleSampler = (
  position: number,
  out: Uint8Array | Uint8ClampedArray,
  offset: number,
) => void;

/**
 * A scale read as numbers, for a lookup table filled at many positions. Its
 * anchors are read once, and each call writes the channels `colorAt` gives at
 * that position without building a string: the 65 536 entries of a 16-bit
 * table in about a millisecond, where `colorAt` takes some fifty.
 * @param scale - The scale to read, its anchors in ascending position order.
 * @returns The reader. A position outside 0..1 is clamped, and one that is not a number reads as 0.
 * @throws {Error} When the scale has no anchor, or one of them is not a hex colour.
 */
export function scaleSampler(scale: ColorScale): ScaleSampler {
  const { stops, interpolation } = scale;
  const first = stops[0];
  const last = stops.at(-1);
  if (first === undefined || last === undefined) {
    throw new Error('a colour scale needs at least one stop');
  }
  const count = stops.length;
  const positions = new Float64Array(count);
  const colors: RgbColor[] = [];
  const tones: HsvColor[] = [];
  for (let index = 0; index < count; index++) {
    const stop = stops[index] as ColorStop;
    const color = parseHexColor(stop.color);
    positions[index] = stop.position;
    colors.push(color);
    if (interpolation !== 'rgb') tones.push(rgbToHsv(color));
  }
  const path = huePath(first.color, last.color, interpolation, count);
  const lowest = positions[0] as number;
  const highest = positions[count - 1] as number;

  return (position, out, offset) => {
    const at = clamp(position, 0, 1);
    if (at <= lowest) {
      writeChannels(out, offset, colors[0] as RgbColor);
    } else if (at >= highest) {
      writeChannels(out, offset, colors[count - 1] as RgbColor);
    } else {
      const end = segmentEnd(positions, at);
      const start = positions[end - 1] as number;
      const span = (positions[end] as number) - start;
      const ratio = span <= 0 ? 0 : (at - start) / span;
      if (interpolation === 'rgb') {
        const from = colors[end - 1] as RgbColor;
        const to = colors[end] as RgbColor;
        out[offset] = roundChannel(lerp(from.red, to.red, ratio));
        out[offset + 1] = roundChannel(lerp(from.green, to.green, ratio));
        out[offset + 2] = roundChannel(lerp(from.blue, to.blue, ratio));
      } else {
        const one = tones[end - 1] as HsvColor;
        const other = tones[end] as HsvColor;
        writeChannels(out, offset, mixTones(one, other, ratio, path));
      }
    }
  };
}

// The anchor `colorAt`'s scan stops at: the first one, past the first anchor,
// at or above a position that lies strictly inside the scale.
function segmentEnd(positions: Float64Array, at: number): number {
  let low = 1;
  let high = positions.length - 1;
  while (low < high) {
    const middle = (low + high) >> 1;
    if (at > (positions[middle] as number)) low = middle + 1;
    else high = middle;
  }
  return low;
}

function writeChannels(
  out: Uint8Array | Uint8ClampedArray,
  offset: number,
  color: RgbColor,
): void {
  out[offset] = roundChannel(color.red);
  out[offset + 1] = roundChannel(color.green);
  out[offset + 2] = roundChannel(color.blue);
}
