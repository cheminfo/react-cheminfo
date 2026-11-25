import { clamp } from '../../format/core/clamp.ts';

/** Roughly how many ticks an axis aims for when nobody says. */
export const DEFAULT_TICK_COUNT = 5;

const MAXIMUM_COUNT = 100;
const MAXIMUM_TICKS = 1000;
const ZERO_WIDTH_SHARE = 0.05;
const ZERO_WIDTH_FALLBACK = 1;
const STEP_10 = Math.sqrt(50);
const STEP_5 = Math.sqrt(10);
const STEP_2 = Math.SQRT2;
/**
 * How far a fraction may sit above 1, 2 or 5 and still count as being on it.
 *
 * `span / count` is computed in floating point, so a window that ought to give
 * a step of exactly one lands a hair above it — `1.0000000000000002` — and an
 * exact comparison would take the next step up and halve the number of ticks
 * for no visible reason.
 */
const STEP_EPSILON = 1e-9;

/**
 * How the step is chosen when an even division lands between two nice ones.
 *
 * - `nearest` — take whichever of 1, 2 or 5 the division is closest to, which
 *   puts the tick count near what was asked for from either side.
 * - `atMost` — always take the larger, so the count asked for is a budget the
 *   axis never exceeds.
 *
 * The difference is not cosmetic. A figure asking for about five ticks wants
 * them spaced as evenly as the numbers allow, and one either way costs it
 * nothing. An axis in a two-hundred-pixel panel has worked its count out from
 * the room it has and the width of a label, so one tick more than it asked for
 * is two labels touching.
 */
export type ChartAxisStep = 'nearest' | 'atMost';

/**
 * The first and last tick as whole multiples of the increment, and the
 * increment: a negative one is a divisor, so a tenth stays exactly `0.1`.
 */
export type TickSpec = [first: number, last: number, increment: number];

/**
 * The ticks a domain carries: the first and last as whole steps, and the step.
 * @param start - The low end.
 * @param stop - The high end.
 * @param count - Roughly how many ticks.
 * @param rounding - How the step is chosen. Defaults to `'nearest'`.
 * @returns The tick spec.
 */
export function tickSpec(
  start: number,
  stop: number,
  count: number,
  rounding: ChartAxisStep = 'nearest',
): TickSpec {
  const rawStep = (stop - start) / count;
  const power = Math.floor(Math.log10(rawStep));
  const error = rawStep / 10 ** power;
  const factor = rounding === 'atMost' ? stepAtMost(error) : stepNearest(error);
  if (power < 0) {
    const divisor = 10 ** -power / factor;
    let first = Math.round(start * divisor);
    let last = Math.round(stop * divisor);
    if (first / divisor < start) first += 1;
    if (last / divisor > stop) last -= 1;
    return [first, last, -divisor];
  }
  const increment = 10 ** power * factor;
  let first = Math.round(start / increment);
  let last = Math.round(stop / increment);
  if (first * increment < start) first += 1;
  if (last * increment > stop) last -= 1;
  return [first, last, increment];
}

/**
 * The tick values of a spec, none when there would be more than a thousand.
 * @param first - The first tick, in whole steps.
 * @param last - The last tick, in whole steps.
 * @param increment - The step, or a divisor when negative.
 * @returns The values, ascending.
 */
export function tickValues(
  first: number,
  last: number,
  increment: number,
): number[] {
  const total = last - first + 1;
  if (!(total > 0) || total > MAXIMUM_TICKS) return [];
  const divisor = increment < 0 ? -increment : 0;
  const values: number[] = [];
  for (let index = 0; index < total; index++) {
    const tick = first + index;
    values.push(divisor > 0 ? tick / divisor : tick * increment);
  }
  return values;
}

/**
 * A value rounded outward to a whole step.
 * @param value - The value.
 * @param increment - The step, or a divisor when negative.
 * @param down - Round towards minus infinity rather than plus.
 * @returns The rounded value.
 */
export function wholeStep(
  value: number,
  increment: number,
  down: boolean,
): number {
  // A negative increment is a divisor; dividing turns the rounding round.
  const flips = increment < 0;
  const scaled = flips ? value * increment : value / increment;
  const whole = down === flips ? Math.ceil(scaled) : Math.floor(scaled);
  return flips ? whole / increment : whole * increment;
}

/**
 * A tick count asked for, made whole and kept between 1 and 100.
 * @param count - The count asked for.
 * @returns The count used.
 */
export function tickCount(count: number): number {
  return Math.floor(clamp(count, 1, MAXIMUM_COUNT, DEFAULT_TICK_COUNT));
}

/**
 * A domain in ascending order, 0..1 when an end is not finite, and opened by
 * 5 % either side when it has no width.
 * @param min - One end.
 * @param max - The other end.
 * @returns The domain.
 */
export function openDomain(min: number, max: number): [number, number] {
  const usable = Number.isFinite(min) && Number.isFinite(max);
  let low = usable ? Math.min(min, max) : 0;
  let high = usable ? Math.max(min, max) : 1;
  if (low === high) {
    const share = Math.abs(low) * ZERO_WIDTH_SHARE;
    const padding = share > 0 ? share : ZERO_WIDTH_FALLBACK;
    low -= padding;
    high += padding;
  }
  return [low, high];
}

/**
 * The nice factor a division is closest to.
 * @param error - The division's mantissa, between 1 and 10.
 * @returns 1, 2, 5 or 10.
 */
function stepNearest(error: number): number {
  if (error >= STEP_10) return 10;
  if (error >= STEP_5) return 5;
  if (error >= STEP_2) return 2;
  return 1;
}

/**
 * The smallest nice factor at or above a division, so the ticks are never
 * closer together than asked for.
 * @param error - The division's mantissa, between 1 and 10.
 * @returns 1, 2, 5 or 10.
 */
function stepAtMost(error: number): number {
  if (error <= 1 + STEP_EPSILON) return 1;
  if (error <= 2 + STEP_EPSILON) return 2;
  if (error <= 5 + STEP_EPSILON) return 5;
  return 10;
}
