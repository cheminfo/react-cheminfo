import type { ChartAxisStep } from './chartAxisSteps.ts';
import {
  DEFAULT_TICK_COUNT,
  openDomain,
  tickCount,
  tickSpec,
  tickValues,
  wholeStep,
} from './chartAxisSteps.ts';
import {
  chartTickDecimals,
  chartTickLabel,
  decimalExponent,
  liftedExponent,
} from './chartTickLabels.ts';

export type { ChartAxisStep } from './chartAxisSteps.ts';
export {
  chartExponentSuffix,
  chartTickDecimals,
  chartTickLabel,
} from './chartTickLabels.ts';

const NICE_PASSES = 8;

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
  /**
   * How a tick is written, handed the value divided by any power of ten the
   * axis lifted and the decimals every label of the axis keeps: a site's own
   * numbers, `60 000`, where the family writes `60,000`.
   * @default formatDecimal
   */
  format?: (value: number, decimals: number) => string;
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
  const {
    count = DEFAULT_TICK_COUNT,
    nice = true,
    step: rounding,
    format,
  } = options;
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
      labels: [chartTickLabel(min, decimals, 0, format)],
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
    labels.push(chartTickLabel(value, decimals, exponent, format));
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
  count = DEFAULT_TICK_COUNT,
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
