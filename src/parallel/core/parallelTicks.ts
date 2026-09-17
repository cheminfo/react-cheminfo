/**
 * How one axis is graduated.
 *
 * Five evenly spaced marks across the raw extent, not `chartAxisScale`'s nice
 * ones: nicing moves the ends of the axis, and a figure whose whole job is to
 * compare rows against each other must end exactly where the data does. A
 * caller who wants round numbers asks for them with `nice`, per axis.
 */

import {
  chartAxisScale,
  chartTickDecimals,
  chartTickLabel,
} from '../../chart/core/chartAxisScale.ts';
import { formatDecimal } from '../../format/core/numbers.ts';
import { roundTo } from '../../format/core/roundTo.ts';

import type { ParallelAxis, ParallelTick } from './parallelTypes.ts';

/** How many graduations an axis carries when the caller asks for no number. */
export const PARALLEL_TICK_COUNT = 5;

/** The most decimals a graduation is ever written with. */
const MOST_TICK_DECIMALS = 6;

/** How far a label may sit from its own value: a tenth of the spacing. */
const LABEL_TOLERANCE = 10;

/** An axis's ends and the graduations written along it. */
export interface ParallelGraduation {
  /** The two ends of the axis, low first, after any nicing. */
  domain: readonly [number, number];
  /** The graduations, from the bottom of the axis to the top. */
  ticks: readonly ParallelTick[];
}

/**
 * The graduations of one axis, and the ends they are spread between.
 *
 * Three ways, in order: the caller's own list wins outright — a coded quantity
 * reading `none`, `low`, `high` is nobody else's to invent; `nice` hands the
 * axis to `chartAxisScale`, which rounds both ends outward to whole steps; and
 * otherwise the extent is divided evenly and a mark whose label repeats the
 * one below it is dropped, so an axis of whole numbers from 0 to 2 reads
 * `0 1 2` rather than writing `1` twice.
 * @param axis - The axis, for its formatting and how many marks it wants.
 * @param min - The value at the bottom of the axis.
 * @param max - The value at its top.
 * @returns The ends and the graduations. See {@link ParallelGraduation}.
 */
export function parallelTicks(
  axis: ParallelAxis,
  min: number,
  max: number,
): ParallelGraduation {
  const domain = [min, max] as const;
  if (axis.ticks !== undefined) return { domain, ticks: axis.ticks };

  const wanted = Math.max(2, Math.trunc(axis.tickCount ?? PARALLEL_TICK_COUNT));
  if (axis.nice === true && axis.scale !== 'log') {
    return nicedGraduation(axis, min, max, wanted);
  }

  const values = evenValues(min, max, wanted, axis.scale === 'log');
  return { domain, ticks: labelled(values, axis.format) };
}

function nicedGraduation(
  axis: ParallelAxis,
  min: number,
  max: number,
  wanted: number,
): ParallelGraduation {
  const scale = chartAxisScale(min, max, { count: wanted, nice: true });
  // Not `scale.labels`: those have a common power of ten lifted out of them,
  // on the understanding that the caller writes it beside the axis name, and
  // this figure writes only the name. Each graduation carries its own value.
  const decimals = chartTickDecimals(scale.step);
  const ticks: ParallelTick[] = [];
  for (const value of scale.values) {
    const label =
      axis.format === undefined
        ? chartTickLabel(value, decimals)
        : axis.format(value);
    if (ticks.at(-1)?.label === label) continue;
    ticks.push({ value, label });
  }
  return { domain: scale.domain, ticks };
}

function evenValues(
  min: number,
  max: number,
  wanted: number,
  logarithmic: boolean,
): number[] {
  const values: number[] = [];
  const low = logarithmic ? Math.log10(Math.max(min, smallestStep(max))) : min;
  const high = logarithmic ? Math.log10(Math.max(max, smallestStep(max))) : max;
  const span = high - low;
  for (let index = 0; index < wanted; index++) {
    const placed = low + (span * index) / (wanted - 1);
    values.push(logarithmic ? 10 ** placed : placed);
  }
  return values;
}

function labelled(
  values: readonly number[],
  format: ((value: number) => string) | undefined,
): ParallelTick[] {
  const decimals = format === undefined ? tickDecimals(values) : 0;
  const ticks: ParallelTick[] = [];
  for (const value of values) {
    const label =
      format === undefined ? formatDecimal(value, decimals) : format(value);
    if (ticks.at(-1)?.label === label) continue;
    ticks.push({ value, label });
  }
  return ticks;
}

/**
 * As many decimals as the spacing needs, and one more whenever rounding would
 * move a mark by more than a tenth of that spacing — which is what keeps an
 * axis from 12.3 to 157 reading `12 48 85 121 157` while one from −1.5 to 2.5
 * still reads `−1.5 −0.5 0.5 1.5 2.5` rather than rounding both away.
 * @param values - The graduations, in the axis's own units.
 * @returns How many decimals each of their labels carries.
 */
function tickDecimals(values: readonly number[]): number {
  const step = smallestGap(values);
  const tolerance = step / LABEL_TOLERANCE;
  let decimals = chartTickDecimals(step);
  while (
    decimals < MOST_TICK_DECIMALS &&
    !faithful(values, decimals, tolerance)
  ) {
    decimals++;
  }
  return decimals;
}

function faithful(
  values: readonly number[],
  decimals: number,
  tolerance: number,
): boolean {
  for (const value of values) {
    if (Math.abs(value - roundTo(value, decimals)) > tolerance) return false;
  }
  return true;
}

function smallestGap(values: readonly number[]): number {
  let smallest = Number.POSITIVE_INFINITY;
  for (let index = 1; index < values.length; index++) {
    const gap = Math.abs(
      (values[index] as number) - (values[index - 1] as number),
    );
    if (gap > 0 && gap < smallest) smallest = gap;
  }
  return Number.isFinite(smallest) ? smallest : 1;
}

function smallestStep(max: number): number {
  return max > 0 ? max * 1e-12 : 1;
}
