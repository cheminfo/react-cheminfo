import type { ReadableInkOptions } from './contrast.ts';
import { readableInk } from './contrast.ts';
import { parseHexColor, toHexColor } from './hex.ts';
import { hsvToRgb, rgbToHsv, wrapHue } from './hsv.ts';

const HALF_TURN = 180;
const TURN = 360;
const MINIMUM_SAMPLES = 2;

/** A colour, and the ink that stays readable on it. */
export interface Swatch {
  /** The colour behind the value. */
  background: string;
  /** The ink to write the value in. */
  foreground: string;
}

/** One anchor of a colour scale: a colour, and where it sits. */
export interface ColorStop {
  /** Where it sits on the scale, from 0 for its low end to 1 for its high end. */
  position: number;
  /** The colour there, as `#rgb` or `#rrggbb`. */
  color: string;
}

/**
 * The path a scale takes from one anchor to the next.
 *
 * - `rgb` mixes the three channels, which is what a browser gradient does and
 *   what a perceptual map such as viridis is sampled for.
 * - `hsv` turns along the colour wheel the short way round, so two anchors
 *   already describe a ramp that keeps its saturation instead of fading
 *   through the grey in the middle of the straight line between them.
 * - `hsv-long` turns the other way round, which is how two anchors of the same
 *   hue draw a full rainbow.
 */
export type ColorInterpolation = 'rgb' | 'hsv' | 'hsv-long';

/** A colour scale: its anchors, and how it moves between them. */
export interface ColorScale {
  /** The anchors, in ascending position order. */
  stops: readonly ColorStop[];
  /** How it moves from one anchor to the next. */
  interpolation: ColorInterpolation;
}

/**
 * A scale whose colours are spread evenly from one end to the other.
 * @param colors - The colours, from the low end to the high end.
 * @param interpolation - The path between them.
 * @returns The scale they describe.
 */
export function evenScale(
  colors: readonly string[],
  interpolation: ColorInterpolation = 'rgb',
): ColorScale {
  const stops: ColorStop[] = [];
  const last = colors.length - 1;
  for (let index = 0; index < colors.length; index++) {
    const color = colors[index];
    if (color === undefined) continue;
    stops.push({ position: last <= 0 ? 0 : index / last, color });
  }
  return { stops, interpolation };
}

/**
 * The colour a scale takes at a position.
 * @param scale - The scale to read, its anchors in ascending position order.
 * @param position - Where to read it, from 0 to 1; anything outside is clamped.
 * @returns The colour there, as `#rrggbb`.
 * @throws {Error} When the scale has no anchor, or one of them is not a hex colour.
 */
export function colorAt(scale: ColorScale, position: number): string {
  const { stops, interpolation } = scale;
  if (stops.length === 0) {
    throw new Error('a colour scale needs at least one stop');
  }
  const at = clampUnit(position);
  const first = stops[0];
  const last = stops.at(-1);
  if (first === undefined || last === undefined) {
    throw new Error(`no colour at position ${String(position)}`);
  }
  if (at <= first.position) return toHexColor(parseHexColor(first.color));
  if (at >= last.position) return toHexColor(parseHexColor(last.color));

  for (let index = 1; index < stops.length; index++) {
    const start = stops[index - 1];
    const end = stops[index];
    if (start === undefined || end === undefined) continue;
    if (at > end.position) continue;
    const span = end.position - start.position;
    const ratio = span <= 0 ? 0 : (at - start.position) / span;
    return mix(start.color, end.color, ratio, interpolation);
  }
  return toHexColor(parseHexColor(last.color));
}

/**
 * The colour a scale takes at a position, with the ink to write on it.
 * @param scale - The scale to read.
 * @param position - Where to read it, from 0 to 1; anything outside is clamped.
 * @param options - See {@link ReadableInkOptions}.
 * @returns The background and the readable ink.
 * @throws {Error} When the scale has no anchor, or one of them is not a hex colour.
 */
export function swatchAt(
  scale: ColorScale,
  position: number,
  options: ReadableInkOptions = {},
): Swatch {
  const background = colorAt(scale, position);
  return { background, foreground: readableInk(background, options) };
}

/**
 * A scale read at evenly spaced positions, for a gradient or a legend.
 * @param scale - The scale to read.
 * @param count - How many colours to take, both ends included; fewer than two is read as two.
 * @returns The colours, from the low end to the high end.
 * @throws {Error} When the scale has no anchor, or one of them is not a hex colour.
 */
export function sampleScale(scale: ColorScale, count: number): string[] {
  const total = Number.isFinite(count)
    ? Math.max(MINIMUM_SAMPLES, Math.floor(count))
    : MINIMUM_SAMPLES;
  const colors: string[] = [];
  for (let index = 0; index < total; index++) {
    colors.push(colorAt(scale, index / (total - 1)));
  }
  return colors;
}

function mix(
  start: string,
  end: string,
  ratio: number,
  interpolation: ColorInterpolation,
): string {
  const from = parseHexColor(start);
  const to = parseHexColor(end);
  if (interpolation === 'rgb') {
    return toHexColor({
      red: from.red + (to.red - from.red) * ratio,
      green: from.green + (to.green - from.green) * ratio,
      blue: from.blue + (to.blue - from.blue) * ratio,
    });
  }

  const one = rgbToHsv(from);
  const other = rgbToHsv(to);
  const hue = one.hue + hueStep(one.hue, other.hue, interpolation) * ratio;
  return toHexColor(
    hsvToRgb({
      hue: wrapHue(hue),
      saturation: one.saturation + (other.saturation - one.saturation) * ratio,
      value: one.value + (other.value - one.value) * ratio,
    }),
  );
}

function hueStep(
  from: number,
  to: number,
  interpolation: ColorInterpolation,
): number {
  const short = (((to - from) % TURN) + TURN + HALF_TURN) % TURN;
  const shortest = short - HALF_TURN;
  if (interpolation !== 'hsv-long') return shortest;
  // Two anchors of the same hue are a full turn apart the long way round,
  // which is what draws a rainbow from one colour back to itself.
  return shortest > 0 ? shortest - TURN : shortest + TURN;
}

function clampUnit(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}
