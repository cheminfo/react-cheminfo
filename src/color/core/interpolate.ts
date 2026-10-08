import { clamp } from '../../format/core/clamp.ts';

import type { ReadableInkOptions } from './contrast.ts';
import { readableInk } from './contrast.ts';
import { parseHexColor, toHexColor } from './hex.ts';
import type { HsvColor } from './hsv.ts';
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
 * - `hsv-long` turns the whole scale one way round the wheel: the long way
 *   between its two ends, which is how two anchors draw a rainbow. Each anchor
 *   in between is reached by turning that same way, never by a turn of its own,
 *   so adding one where the scale already has its colour changes nothing.
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
  const at = clamp(position, 0, 1);
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
    return mix(start.color, end.color, ratio, {
      interpolation,
      turn: longTurn(first.color, last.color),
      whole: stops.length === MINIMUM_SAMPLES,
    });
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

interface HuePath {
  interpolation: ColorInterpolation;
  /** The way the long path turns: 1 up the wheel, -1 down it. */
  turn: number;
  /** Whether the two anchors are the whole scale, so one hue on both is a full turn. */
  whole: boolean;
}

function mix(start: string, end: string, ratio: number, path: HuePath): string {
  const from = parseHexColor(start);
  const to = parseHexColor(end);
  if (path.interpolation === 'rgb') {
    return toHexColor({
      red: from.red + (to.red - from.red) * ratio,
      green: from.green + (to.green - from.green) * ratio,
      blue: from.blue + (to.blue - from.blue) * ratio,
    });
  }

  const one = rgbToHsv(from);
  const other = rgbToHsv(to);
  const [fromHue, toHue] = pairHues(one, other);
  const hue = fromHue + hueStep(fromHue, toHue, path) * ratio;
  return toHexColor(
    hsvToRgb({
      hue: wrapHue(hue),
      saturation: one.saturation + (other.saturation - one.saturation) * ratio,
      value: one.value + (other.value - one.value) * ratio,
    }),
  );
}

// A grey, black or white has no hue of its own, so it takes the other one's:
// the path then fades to it instead of sweeping through red on the way.
function pairHues(one: HsvColor, other: HsvColor): [number, number] {
  if (one.saturation === 0) return [other.hue, other.hue];
  if (other.saturation === 0) return [one.hue, one.hue];
  return [one.hue, other.hue];
}

function hueStep(from: number, to: number, path: HuePath): number {
  if (path.interpolation !== 'hsv-long') return shortestStep(from, to);
  const step = path.turn > 0 ? upStep(from, to) : -upStep(to, from);
  return step === 0 && path.whole ? path.turn * TURN : step;
}

function longTurn(first: string, last: string): number {
  const [from, to] = pairHues(
    rgbToHsv(parseHexColor(first)),
    rgbToHsv(parseHexColor(last)),
  );
  // Two ends of one hue are a full turn apart, taken up the wheel.
  return shortestStep(from, to) > 0 ? -1 : 1;
}

function shortestStep(from: number, to: number): number {
  return ((((to - from) % TURN) + TURN + HALF_TURN) % TURN) - HALF_TURN;
}

function upStep(from: number, to: number): number {
  return (((to - from) % TURN) + TURN) % TURN;
}
