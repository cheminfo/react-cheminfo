import type { RgbColor } from './hex.ts';

const TURN = 360;
const SECTOR = 60;
const MAXIMUM_CHANNEL = 255;

/**
 * A colour in the HSV model — HSB in a drawing program, the same three numbers.
 *
 * It is the model a scale is customised in: hue says which colour, and the two
 * others say how strong and how bright it is, so an author moves along the
 * wheel without having to think in red, green and blue at once.
 */
export interface HsvColor {
  /** Where it sits on the wheel, in degrees from 0 to 360. Zero on a grey. */
  hue: number;
  /** How far it is from grey, from 0 to 1. */
  saturation: number;
  /** How bright it is, from 0 for black to 1. */
  value: number;
}

/**
 * Read three channels as a hue, a saturation and a value.
 * @param color - The three channels, each from 0 to 255.
 * @returns The same colour in the HSV model.
 */
export function rgbToHsv(color: RgbColor): HsvColor {
  const red = channel(color.red);
  const green = channel(color.green);
  const blue = channel(color.blue);
  const value = Math.max(red, green, blue);
  const chroma = value - Math.min(red, green, blue);
  return {
    hue: hueOf(red, green, blue, value, chroma),
    saturation: value === 0 ? 0 : chroma / value,
    value,
  };
}

/**
 * Write a hue, a saturation and a value back as three channels.
 *
 * The hue is wrapped rather than clamped, so a scale may run past 360 or below
 * zero and still land on the colour that turn of the wheel names.
 * @param color - The colour in the HSV model.
 * @returns The three channels, each from 0 to 255.
 */
export function hsvToRgb(color: HsvColor): RgbColor {
  const hue = wrapHue(color.hue) / SECTOR;
  const saturation = unit(color.saturation);
  const value = unit(color.value);
  const sector = Math.floor(hue) % 6;
  const offset = hue - Math.floor(hue);
  const low = value * (1 - saturation);
  const falling = value * (1 - saturation * offset);
  const rising = value * (1 - saturation * (1 - offset));

  if (sector === 0) return scale(value, rising, low);
  if (sector === 1) return scale(falling, value, low);
  if (sector === 2) return scale(low, value, rising);
  if (sector === 3) return scale(low, falling, value);
  if (sector === 4) return scale(rising, low, value);
  return scale(value, low, falling);
}

/**
 * A hue brought inside one turn of the wheel.
 * @param hue - Any angle in degrees, negative or past 360.
 * @returns The same angle, from 0 up to but not including 360.
 */
export function wrapHue(hue: number): number {
  if (!Number.isFinite(hue)) return 0;
  return ((hue % TURN) + TURN) % TURN;
}

function hueOf(
  red: number,
  green: number,
  blue: number,
  value: number,
  chroma: number,
): number {
  if (chroma === 0) return 0;
  let hue: number;
  if (value === red) {
    hue = (green - blue) / chroma;
  } else if (value === green) {
    hue = 2 + (blue - red) / chroma;
  } else {
    hue = 4 + (red - green) / chroma;
  }
  return wrapHue(hue * SECTOR);
}

function scale(red: number, green: number, blue: number): RgbColor {
  return {
    red: red * MAXIMUM_CHANNEL,
    green: green * MAXIMUM_CHANNEL,
    blue: blue * MAXIMUM_CHANNEL,
  };
}

function channel(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value / MAXIMUM_CHANNEL));
}

function unit(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}
