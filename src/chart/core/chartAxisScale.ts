import { clamp } from '../../format/core/clamp.ts';
import { formatDecimal } from '../../format/core/numbers.ts';
import { formatSuperscript } from '../../format/core/superscript.ts';

const DEFAULT_COUNT = 5;
const MAXIMUM_COUNT = 100;
const MAXIMUM_TICKS = 1000;
const NICE_PASSES = 8;
const ZERO_WIDTH_SHARE = 0.05;
const ZERO_WIDTH_FALLBACK = 1;
const COMFORTABLE_LABEL = 6;
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

/** A niced axis: its domain, its ticks, and the labels they are written with. */
export interface ChartAxisScale {
  /** The domain the ticks span, widened outward to whole steps when asked. */
  readonly domain: readonly [number, number];
  /** The tick values, ascending. */
  readonly values: readonly number[];
  /** The spacing: always 1, 2 or 5 times a power of ten. */
  readonly step: number;
  /** Decimals every label on this axis carries, so a column of them lines up. */
  readonly decimals: number;
  /** A power of ten lifted out of every label, or `0` when none was. */
  readonly exponent: number;
  /** One label per value, already written out. */
  readonly labels: readonly string[];
}

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

/** How an axis is divided. */
export interface ChartAxisScaleOptions {
  /**
   * Roughly how many ticks to aim for; the real count lands near it.
   * @default 5
   */
  count?: number;
  /**
   * Whether to widen the domain outward to whole steps, so the axis ends on a
   * labelled tick. Turn it off when the domain is already exact — a share that
   * must end at 100%, or a window a reader dragged out for themselves.
   * @default true
   */
  nice?: boolean;
  /**
   * How the step is chosen. See {@link ChartAxisStep}.
   * @default 'nearest'
   */
  step?: ChartAxisStep;
}

/**
 * The ticks an axis over `min`..`max` should carry.
 *
 * The step follows the standard 1/2/5 progression. Below one, the algorithm
 * divides by an integer rather than multiplying by a power of ten, which is
 * what makes a tenth come out as exactly `0.1` instead of
 * `0.30000000000000004` three ticks later. A domain far from unity has a
 * common power of ten lifted into {@link ChartAxisScale.exponent} so the
 * labels stay two or three characters wide and the axis title carries the
 * factor; it is lifted only where that actually shortens them, so a million
 * and a hundredth keeps its digits rather than trading them for longer ones.
 * @param min - One end of the data range, in either order.
 * @param max - The other end.
 * @param options - See {@link ChartAxisScaleOptions}.
 * @returns The niced axis. A range holding a value that is not finite falls
 * back to 0..1, and a zero-width one is opened by 5% either side so that a
 * constant column still draws an axis.
 */
export function chartAxisScale(
  min: number,
  max: number,
  options: ChartAxisScaleOptions = {},
): ChartAxisScale {
  const { count = DEFAULT_COUNT, nice = true, step: rounding } = options;
  const wanted = tickCount(count);
  // A window of one point is not a window: there is no step to read a
  // precision off, so the single label is written at the precision its own
  // magnitude asks for. Only when the domain is taken as given — a domain that
  // is to be niced is opened instead, so that a constant column still draws an
  // axis to stand on.
  if (!nice && min === max && Number.isFinite(min)) {
    const decimals = chartTickDecimals(Math.abs(min));
    return {
      domain: [min, min],
      values: [min],
      step: 0,
      decimals,
      exponent: 0,
      labels: [chartTickLabel(min, decimals)],
    };
  }
  const opened = openDomain(min, max);
  const domain = nice
    ? chartNiceDomain(opened[0], opened[1], wanted, rounding)
    : opened;
  const [first, last, increment] = tickSpec(
    domain[0],
    domain[1],
    wanted,
    rounding,
  );
  const spacing = increment < 0 ? -1 / increment : increment;
  const step = Number.isFinite(spacing) && spacing > 0 ? spacing : 0;
  const values = step === 0 ? [] : tickValues(first, last, increment);
  const exponent = liftedExponent(values, step);
  const decimals = Math.max(0, exponent - decimalExponent(step));
  const labels: string[] = [];
  for (const value of values) {
    labels.push(chartTickLabel(value, decimals, exponent));
  }
  return { domain, values, step, decimals, exponent, labels };
}

/**
 * The domain rounded outward until both ends land on a whole tick step.
 *
 * It iterates, because widening changes the span, which can change the step,
 * which can widen it again; it settles in one or two passes.
 * @param min - One end, in either order.
 * @param max - The other end.
 * @param count - Roughly how many ticks the domain will carry. Defaults to `5`.
 * @param rounding - How the step is chosen. See {@link ChartAxisStep}.
 * @returns The widened domain, ascending.
 */
export function chartNiceDomain(
  min: number,
  max: number,
  count = DEFAULT_COUNT,
  rounding: ChartAxisStep = 'nearest',
): [number, number] {
  const wanted = tickCount(count);
  let [start, stop] = openDomain(min, max);
  let previous = 0;
  for (let pass = 0; pass < NICE_PASSES; pass++) {
    const [, , increment] = tickSpec(start, stop, wanted, rounding);
    if (increment === previous || !Number.isFinite(increment)) break;
    const low = wholeStep(start, increment, true);
    const high = wholeStep(stop, increment, false);
    if (!Number.isFinite(low) || !Number.isFinite(high)) break;
    start = low;
    stop = high;
    previous = increment;
  }
  return [start, stop];
}

/**
 * How many decimals a label needs so that every tick on one axis is written
 * the same width.
 *
 * A step is always 1, 2 or 5 times a power of ten, so the answer is the step's
 * decimal exponent and nothing more.
 * @param step - The tick spacing.
 * @returns The decimals; `0` for a step of one or more.
 */
export function chartTickDecimals(step: number): number {
  return Math.max(0, -decimalExponent(step));
}

/**
 * One tick written out, through `formatDecimal` so an axis reads like the rest
 * of the family's numbers.
 * @param value - The tick value.
 * @param decimals - Decimals to keep, from {@link chartTickDecimals}.
 * @param exponent - A power of ten already lifted into the axis title. Defaults to `0`.
 * @returns The label. A negative zero is written as zero, which is what a
 * reader expects to find at an origin.
 */
export function chartTickLabel(
  value: number,
  decimals: number,
  exponent = 0,
): string {
  const lift = Number.isFinite(exponent) ? Math.trunc(exponent) : 0;
  const scaled = lift === 0 ? value : value / 10 ** lift;
  return formatDecimal(scaled === 0 ? 0 : scaled, decimals);
}

/**
 * The factor an axis title carries when its labels were divided down, written
 * as ` (×10⁻⁹)` with real superscript digits.
 * @param exponent - The power of ten lifted out; `0` for none.
 * @returns The suffix, or an empty string when there is nothing to say.
 */
export function chartExponentSuffix(exponent: number): string {
  if (!Number.isFinite(exponent)) return '';
  const whole = Math.trunc(exponent);
  if (whole === 0) return '';
  return ` (×10${formatSuperscript(whole)})`;
}

type TickSpec = [first: number, last: number, increment: number];

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

function tickSpec(
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

function tickValues(first: number, last: number, increment: number): number[] {
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

function wholeStep(value: number, increment: number, down: boolean): number {
  // A negative increment is a divisor; dividing turns the rounding round.
  const flips = increment < 0;
  const scaled = flips ? value * increment : value / increment;
  const whole = down === flips ? Math.ceil(scaled) : Math.floor(scaled);
  return flips ? whole / increment : whole * increment;
}

function liftedExponent(values: readonly number[], step: number): number {
  const low = Math.abs(values[0] ?? 0);
  const largest = Math.max(low, Math.abs(values.at(-1) ?? 0));
  if (largest === 0 || !Number.isFinite(largest) || step <= 0) return 0;
  const top = decimalExponent(largest);
  const fine = decimalExponent(step);
  const plain = labelWidth(Math.max(1, top + 1), -fine);
  if (plain <= COMFORTABLE_LABEL) return 0;
  return labelWidth(1, top - fine) < plain ? top : 0;
}

function labelWidth(digits: number, decimals: number): number {
  return decimals > 0 ? digits + decimals + 1 : digits;
}

function decimalExponent(value: number): number {
  const exponent = Number(Math.abs(value).toExponential().split('e', 2)[1]);
  return Number.isFinite(exponent) ? exponent : 0;
}

function tickCount(count: number): number {
  return Math.floor(clamp(count, 1, MAXIMUM_COUNT, DEFAULT_COUNT));
}

function openDomain(min: number, max: number): [number, number] {
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
