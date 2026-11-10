/**
 * The one door to the three backgrounds, and the window they are drawn under.
 *
 * Which background is subtracted is a setting the reader changes while looking
 * at the spectrum, so every caller holds the name rather than the function and
 * asks here. `none` is a real answer and not a missing one: a survey scan is
 * read as measured, and a caller that had to special-case it would have to
 * special-case it in the chart, in the integration and in the composition
 * separately.
 *
 * `sliceWindow` is beside them because every one of them is applied to a window
 * rather than to a whole spectrum, and cutting the window is where an ascending
 * axis is either used properly or scanned linearly on every zoom.
 */

import { xGetFromToIndex } from 'ml-spectra-processing';

import type { BackgroundResult } from './backgroundResult.ts';
import { linearBackground } from './linearBackground.ts';
import type { ShirleyBackgroundOptions } from './shirleyBackground.ts';
import { shirleyBackground } from './shirleyBackground.ts';
import type { TougaardBackgroundOptions } from './tougaardBackground.ts';
import { tougaardBackground } from './tougaardBackground.ts';
import type { XpsTrace } from './xpsSpectrum.ts';

/**
 * The backgrounds a window can be read under.
 *
 * A superset of what the workspace offers: `XpsSettings` lets a reader pick
 * between the first three, while a region read out of a file may name Tougaard
 * because that is what it was quantified with.
 */
export type BackgroundKind = 'none' | 'linear' | 'shirley' | 'tougaard';

/** Which background to draw, and everything any of them takes. */
export interface ApplyBackgroundOptions
  extends ShirleyBackgroundOptions, TougaardBackgroundOptions {
  /**
   * Which background to draw. `none` leaves the window as measured.
   * @default 'none'
   */
  kind?: BackgroundKind;
}

/**
 * Draw the named background under a window.
 *
 * Under `none` the corrected trace *is* the window's own `y` rather than a copy
 * of it: nothing subtracts anything, and a survey scan of a hundred thousand
 * points is redrawn on every pointer move. It is shared, so it is read and
 * never written into — a caller that means to rescale counts clones first.
 * @param trace - The window, x ascending in binding energy.
 * @param options - Which background, and what that background takes.
 * @returns The background, and the window with it taken off.
 */
export function applyBackground(
  trace: XpsTrace,
  options: ApplyBackgroundOptions = {},
): BackgroundResult {
  const { kind = 'none' } = options;
  switch (kind) {
    case 'linear':
      return linearBackground(trace, options);
    case 'shirley':
      return shirleyBackground(trace, options);
    case 'tougaard':
      return tougaardBackground(trace, options);
    case 'none':
      return {
        background: new Float64Array(trace.y.length),
        corrected: trace.y,
      };
    // The union has four members and all four are above, so one that is not
    // handled is a compile error rather than a run-time fallback.
    // no default
  }
}

/**
 * Cut an ascending trace down to a binding-energy window.
 *
 * The two columns come back as views onto the ones handed in, so a region
 * redrawn on every frame costs the two binary searches and nothing else. They
 * are views, so they are read and never written into, and they keep the whole
 * trace alive as long as they are held — which is what is wanted, since the
 * window belongs to the spectrum it was cut from.
 *
 * The bounds are inclusive and are taken literally: a window is a claim about
 * which points are inside it, so a point sitting just outside is left out even
 * though it is the closest one to the bound. Bounds given the wrong way round
 * are read as the window they describe rather than refused, since a drag runs
 * whichever way the pointer went.
 * @param trace - The trace, x ascending in binding energy.
 * @param from - Lower bound in eV, the start of the trace when left out.
 * @param to - Upper bound in eV, the end of the trace when left out.
 * @returns The points inside the window, empty when none are.
 */
export function sliceWindow(
  trace: XpsTrace,
  from?: number,
  to?: number,
): XpsTrace {
  const { x, y } = trace;
  const length = x.length;
  if (length === 0) return trace;

  let lower = from;
  let upper = to;
  if (lower !== undefined && upper !== undefined && lower > upper) {
    [lower, upper] = [upper, lower];
  }

  const { fromIndex, toIndex } = xGetFromToIndex(x, { from: lower, to: upper });
  let first = fromIndex;
  let last = toIndex;
  // Both bounds resolve to the closest point, which for an explicit bound can
  // sit outside the window; each is walked back in by at most one.
  if (lower !== undefined && (x[first] as number) < lower) first++;
  if (upper !== undefined && (x[last] as number) > upper) last--;
  if (first > last) return { x: new Float64Array(0), y: new Float64Array(0) };
  if (first === 0 && last === length - 1) return trace;

  return { x: x.subarray(first, last + 1), y: y.subarray(first, last + 1) };
}
