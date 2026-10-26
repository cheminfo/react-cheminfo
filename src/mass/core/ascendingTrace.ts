/**
 * The one thing both readers have to do to the points a parser hands back.
 *
 * Every peak lookup, crosshair and label here finds its point by bisection, and
 * bisection over a descending axis does not fail — it answers confidently and
 * wrongly. A JCAMP keeps the order the file wrote, and a peak table pasted out
 * of a report may be sorted by intensity, so the order is checked and mended
 * here, once, rather than trusted downstream.
 */

import type { NumberArray } from 'cheminfo-types';
import { xyEnsureFloat64, xySortX, xyUniqueX } from 'ml-spectra-processing';

import type { MassTrace } from './massSpectrum.ts';

/**
 * The points, typed, in increasing m/z, each m/z once.
 *
 * A mass written twice is summed into one point rather than kept as two: a
 * peak list exported from two overlapping scan ranges repeats the masses where
 * they meet, and two sticks at one m/z are one ion measured twice.
 * @param x - The masses, in the order the parser read them.
 * @param y - The intensities, in the same order.
 * @returns The trace; the arrays handed in themselves when they were already
 * typed, ascending and free of repeats.
 */
export function ascendingTrace(x: NumberArray, y: NumberArray): MassTrace {
  const typed = xyEnsureFloat64({ x, y });
  const sorted = isAscending(typed.x) ? typed : xySortX(typed);
  if (!repeatsMass(sorted.x)) return sorted;
  return xyEnsureFloat64(
    xyUniqueX(sorted, { algorithm: 'sum', isSorted: true }),
  );
}

/**
 * Whether an axis never steps backwards.
 *
 * Checked rather than sorted unconditionally, because a mass spectrum is
 * written ascending nearly always and the common case then costs one
 * comparison per point and no allocation at all.
 * @param values - The axis.
 * @returns `true` when each point is at least as far along as the one before.
 */
function isAscending(values: Float64Array): boolean {
  for (let index = 1; index < values.length; index++) {
    if ((values[index] as number) < (values[index - 1] as number)) return false;
  }
  return true;
}

/**
 * Whether an ascending axis holds the same mass twice.
 * @param values - The axis, ascending.
 * @returns `true` when two neighbours are equal.
 */
function repeatsMass(values: Float64Array): boolean {
  for (let index = 1; index < values.length; index++) {
    if (values[index] === values[index - 1]) return true;
  }
  return false;
}
