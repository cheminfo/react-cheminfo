import type { RgbColor } from './hex.ts';
import { parseHexColor } from './hex.ts';
import type { HsvColor } from './hsv.ts';
import { hsvToRgb, rgbToHsv, wrapHue } from './hsv.ts';
import type { ColorInterpolation } from './interpolate.ts';

const HALF_TURN = 180;
const TURN = 360;
const PAIR = 2;

/** How a scale moves from one anchor to the next, read once from its two ends. */
export interface HuePath {
  /** How it moves between its anchors. */
  interpolation: ColorInterpolation;
  /** The way the long path turns: 1 up the wheel, -1 down it. */
  turn: number;
  /** Whether the two anchors are the whole scale, so one hue on both is a full turn. */
  whole: boolean;
}

/**
 * The path a scale takes between its anchors.
 * @param first - The colour of its first anchor.
 * @param last - The colour of its last anchor.
 * @param interpolation - How it moves between anchors.
 * @param count - How many anchors it has.
 * @returns The path.
 */
export function huePath(
  first: string,
  last: string,
  interpolation: ColorInterpolation,
  count: number,
): HuePath {
  return { interpolation, turn: longTurn(first, last), whole: count === PAIR };
}

/**
 * The colour a ratio of the way from one anchor to the next, along the wheel,
 * before its channels are rounded.
 * @param one - The anchor it starts from, in the HSV model.
 * @param other - The anchor it goes to.
 * @param ratio - How far along, from 0 to 1.
 * @param path - The scale's path.
 * @returns The three channels, from 0 to 255.
 */
export function mixTones(
  one: HsvColor,
  other: HsvColor,
  ratio: number,
  path: HuePath,
): RgbColor {
  const [fromHue, toHue] = pairHues(one, other);
  const hue = fromHue + hueStep(fromHue, toHue, path) * ratio;
  return hsvToRgb({
    hue: wrapHue(hue),
    saturation: lerp(one.saturation, other.saturation, ratio),
    value: lerp(one.value, other.value, ratio),
  });
}

/**
 * The number a ratio of the way from one value to another.
 * @param from - Where it starts.
 * @param to - Where it ends.
 * @param ratio - How far along, from 0 to 1.
 * @returns The value there.
 */
export function lerp(from: number, to: number, ratio: number): number {
  return from + (to - from) * ratio;
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
