import type { ReadableInkOptions } from './contrast.ts';
import { readableInk } from './contrast.ts';
import { parseHexColor, toHexColor } from './hex.ts';

/**
 * Viridis, sampled at nine stops.
 *
 * It stays readable under the common colour deficiencies and is monotone in
 * lightness, so a greyscale print of the same figure still orders the values.
 */
export const VIRIDIS_SCALE: readonly string[] = [
  '#440154',
  '#482878',
  '#3e4a89',
  '#31688e',
  '#26828e',
  '#1f9e89',
  '#35b779',
  '#6dcd59',
  '#b4de2c',
];

/** A colour, and the ink that stays readable on it. */
export interface Swatch {
  /** The colour behind the value. */
  background: string;
  /** The ink to write the value in. */
  foreground: string;
}

/** How {@link positionInRange} places a value. */
export interface PositionInRangeOptions {
  /**
   * Whether to place the value on a base-10 logarithmic scale, for a quantity
   * — an abundance, a density, a concentration — spread over so many decades
   * that a linear placement gives all but a couple of values the same colour.
   * @default false
   */
  logarithmic?: boolean;
}

/**
 * Where a value sits between two bounds.
 * @param value - The value to place.
 * @param min - The smallest value the range holds.
 * @param max - The largest value it holds.
 * @param options - See {@link PositionInRangeOptions}.
 * @returns A fraction clamped to 0..1; the middle when the range holds a single value, and 0 when any of the three numbers is not finite.
 */
export function positionInRange(
  value: number,
  min: number,
  max: number,
  options: PositionInRangeOptions = {},
): number {
  const { logarithmic = false } = options;
  if (
    !Number.isFinite(value) ||
    !Number.isFinite(min) ||
    !Number.isFinite(max)
  ) {
    return 0;
  }
  if (max === min) return 0.5;
  if (!logarithmic) return clampUnit((value - min) / (max - min));

  const floor = Math.max(min, smallestPositive(min, max));
  const span = Math.log10(max) - Math.log10(floor);
  if (span === 0) return 0.5;
  return clampUnit(
    (Math.log10(Math.max(value, floor)) - Math.log10(floor)) / span,
  );
}

/**
 * The colour a scale takes at a position, interpolated between its stops.
 * @param stops - The scale's colours, from its low end to its high end, as `#rgb` or `#rrggbb`.
 * @param position - Where on the scale to read, from 0 to 1; anything outside is clamped.
 * @returns The colour at that position, as `#rrggbb`.
 * @throws {Error} When the scale has no stops, or a stop is not a hex colour.
 */
export function colorFromScale(
  stops: readonly string[],
  position: number,
): string {
  if (stops.length === 0) {
    throw new Error('a colour scale needs at least one stop');
  }
  const scaled = clampUnit(position) * (stops.length - 1);
  const lowerIndex = Math.floor(scaled);
  const start = stops[lowerIndex];
  const end = stops[Math.min(lowerIndex + 1, stops.length - 1)];
  if (start === undefined || end === undefined) {
    throw new Error(`no colour at position ${String(position)}`);
  }
  const from = parseHexColor(start);
  const to = parseHexColor(end);
  const ratio = scaled - lowerIndex;
  return toHexColor({
    red: from.red + (to.red - from.red) * ratio,
    green: from.green + (to.green - from.green) * ratio,
    blue: from.blue + (to.blue - from.blue) * ratio,
  });
}

/**
 * The colour a scale takes at a position, together with the ink to write on it.
 * @param stops - The scale's colours, from its low end to its high end.
 * @param position - Where on the scale to read, from 0 to 1; anything outside is clamped.
 * @param options - See {@link ReadableInkOptions}.
 * @returns The background and the readable ink.
 * @throws {Error} When the scale has no stops, or a stop is not a hex colour.
 */
export function swatchFromScale(
  stops: readonly string[],
  position: number,
  options: ReadableInkOptions = {},
): Swatch {
  const background = colorFromScale(stops, position);
  return { background, foreground: readableInk(background, options) };
}

function clampUnit(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

function smallestPositive(min: number, max: number): number {
  if (min > 0) return min;
  if (max <= 0) return 1;
  return max * 1e-12;
}
