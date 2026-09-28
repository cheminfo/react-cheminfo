/**
 * How a number is written wherever a chart writes one.
 *
 * The axis decides, not the number: the precision comes from the tick step, and
 * the notation from the largest tick, so every label on one axis is written the
 * same way and a reader can run an eye down a column of them. `chartAxisScale`
 * works both out; this is where they turn into text.
 *
 * It is a second way of writing the labels `chartAxisScale` already carries,
 * and it exists because the two answer different questions. A figure lifts a
 * common power of ten into its axis title and writes short labels under it — a
 * chart whose axis title is fixed by the measurement cannot, so a spectrum
 * writes the magnitude into each label instead.
 */

import type { ChartAxisScale } from './chartAxisScale.ts';

/**
 * Write a number the way an axis label or a readout wants it.
 *
 * The decimals come from the axis, so every label on it is written to the same
 * precision — but a tick that happens to land on a round number then reads
 * `500.0000` where `500` was meant, and half its width is zeros carrying
 * nothing. They are trimmed off the end only, never out of the middle, so
 * `500.0002` keeps every digit it needs.
 *
 * `toFixed` also writes `-0` for anything that rounds to zero from below, which
 * is never what an axis means and is jarring on the one tick a chemist looks at
 * most.
 * @param value - The number to write.
 * @param decimals - How many decimals to write it to, as `niceTicks` derived.
 * @returns The label.
 */
export function formatNumber(value: number, decimals: number): string {
  const text = value.toFixed(Math.min(20, Math.max(0, Math.floor(decimals))));
  const trimmed = text.includes('.') ? text.replace(/\.?0+$/, '') : text;
  return trimmed === '-0' ? '0' : trimmed;
}

/**
 * The magnitude above which a number is quicker read as a power of ten.
 *
 * An ion count is quoted in whatever the instrument counted in, so an intensity
 * axis written out in full reads `200000000` — nine digits a reader has to group
 * into threes before knowing which power of ten they are looking at, and wide
 * enough to run into the axis title printed beside them. Above this the same
 * tick is written `2e+8`, which says the magnitude first and in four characters.
 *
 * A hundred thousand rather than a million because that is where a number stops
 * being read at a glance, and because it is the threshold every intensity in the
 * mass side is already written against — a colourbar and an axis that disagreed
 * about how one count is spelled would read as two measurements.
 */
export const SCIENTIFIC_ABOVE = 1e5;

/**
 * The magnitude below which the digits that mean anything are all behind zeros.
 *
 * The mirror of `SCIENTIFIC_ABOVE`: `0.00002` is four characters of nothing
 * followed by the one digit that was measured.
 */
export const SCIENTIFIC_BELOW = 1e-4;

/**
 * Write a number as a mantissa and a power of ten.
 *
 * With no precision asked for, the mantissa keeps only the digits it needs — a
 * tick at a hundred and fifty million is `1.5e+8` and the one above it `2e+8`,
 * rather than both being padded to the same width with zeros that say nothing.
 * The value is rounded to a few significant digits first, because a tick is
 * reached by multiplying a step by an index and `3 * 0.1` is `0.30000000000000004`
 * — which the shortest form would write out in full, every digit of it noise.
 * @param value - The number to write.
 * @param digits - How many decimals the mantissa carries. Left out, it carries
 * as few as tell this number from its neighbours.
 * @returns The number in scientific notation, or `0` for zero, which has no
 * exponent and is written the same way on any axis.
 */
export function formatScientific(value: number, digits?: number): string {
  if (value === 0) return '0';
  if (digits === undefined) {
    return Number(value.toPrecision(SCIENTIFIC_DIGITS)).toExponential();
  }
  return value.toExponential(Math.min(100, Math.max(0, Math.floor(digits))));
}

/**
 * How one axis writes every one of its labels.
 *
 * The notation is chosen once, from the largest tick on the axis, and then used
 * for all of them — including the small ones and the zero. An axis is read by
 * running an eye along it, and one whose labels changed notation partway would
 * have to be read a label at a time instead.
 * @param axis - The axis, as `chartAxisScale` divided it.
 * @returns A writer for every label on that axis.
 */
export function axisLabeller(axis: ChartAxisScale): (value: number) => string {
  const { values, decimals } = axis;
  let largest = 0;
  for (const tick of values) {
    const magnitude = Math.abs(tick);
    if (magnitude > largest) largest = magnitude;
  }
  const scientific =
    largest >= SCIENTIFIC_ABOVE || (largest > 0 && largest < SCIENTIFIC_BELOW);
  return scientific
    ? (value) => formatScientific(value)
    : (value) => formatNumber(value, decimals);
}

/**
 * How many significant digits survive the rounding that sheds floating noise.
 *
 * A tick is 1, 2 or 5 times a power of ten times an index, so two digits carry
 * every one of them and six is room to spare for a readout written this way.
 */
const SCIENTIFIC_DIGITS = 6;
