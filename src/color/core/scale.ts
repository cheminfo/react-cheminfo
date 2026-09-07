import type { ReadableInkOptions } from './contrast.ts';
import type { Swatch } from './interpolate.ts';
import { colorAt, evenScale, swatchAt } from './interpolate.ts';
import { VIRIDIS_COLORS } from './scaleData.ts';

export type { Swatch } from './interpolate.ts';

/**
 * Viridis, sampled at nine stops.
 *
 * It stays readable under the common colour deficiencies and is monotone in
 * lightness, so a greyscale print of the same figure still orders the values.
 * It is the default of `COLOR_SCALES`, which is where the others are.
 */
export const VIRIDIS_SCALE: readonly string[] = VIRIDIS_COLORS;

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
 * The colour a list of evenly spread colours takes at a position.
 * @param stops - The colours, from the low end to the high end, as `#rgb` or `#rrggbb`.
 * @param position - Where to read, from 0 to 1; anything outside is clamped.
 * @returns The colour at that position, as `#rrggbb`.
 * @throws {Error} When the list is empty, or a colour is not a hex colour.
 */
export function colorFromScale(
  stops: readonly string[],
  position: number,
): string {
  return colorAt(evenScale(stops), position);
}

/**
 * The colour a list of evenly spread colours takes, with the ink to write on it.
 * @param stops - The colours, from the low end to the high end.
 * @param position - Where to read, from 0 to 1; anything outside is clamped.
 * @param options - See {@link ReadableInkOptions}.
 * @returns The background and the readable ink.
 * @throws {Error} When the list is empty, or a colour is not a hex colour.
 */
export function swatchFromScale(
  stops: readonly string[],
  position: number,
  options: ReadableInkOptions = {},
): Swatch {
  return swatchAt(evenScale(stops), position, options);
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
