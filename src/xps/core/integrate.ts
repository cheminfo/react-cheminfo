/**
 * The area under a window, which is the number a composition is computed from.
 *
 * Two decisions are folded into one call on purpose. An area is meaningless
 * without the background it was taken over — the same C 1s region integrates to
 * half again as much under `none` as under Shirley — so the two are never asked
 * for separately, and a caller cannot integrate a window having forgotten which
 * background the reader had chosen.
 *
 * The trapezoid itself is `xyIntegration`'s, over the corrected window rather
 * than over the trace with a subtraction applied afterwards: subtracting the
 * area of the background from the area of the trace gives the same number only
 * while the two are sampled on the same points, which stops being true the
 * moment a caller passes a window the trace has no point at.
 */

import { xyIntegration } from 'ml-spectra-processing';

import type { ApplyBackgroundOptions } from './applyBackground.ts';
import { applyBackground, sliceWindow } from './applyBackground.ts';
import type { XpsTrace } from './xpsSpectrum.ts';

/** Which window to integrate, and what to take off it first. */
export interface IntegrateWindowOptions extends ApplyBackgroundOptions {
  /**
   * Lower bound of the window in eV of binding energy.
   * @default the first point of the trace
   */
  from?: number;
  /**
   * Upper bound of the window in eV of binding energy.
   * @default the last point of the trace
   */
  to?: number;
}

/**
 * The area between two binding energies, over the chosen background.
 *
 * A window holding fewer than two points has no area rather than an undefined
 * one: a bound dragged past the end of a spectrum, or onto a single point of
 * it, is a gesture and not an error.
 * @param trace - The spectrum, x ascending in binding energy.
 * @param options - The window, and the background to take off inside it.
 * @returns The area in counts·eV, `0` when the window holds nothing.
 */
export function integrateWindow(
  trace: XpsTrace,
  options: IntegrateWindowOptions = {},
): number {
  const { from, to, ...background } = options;
  const windowed = sliceWindow(trace, from, to);
  if (windowed.x.length < 2) return 0;

  const { corrected } = applyBackground(windowed, background);
  return xyIntegration({ x: windowed.x, y: corrected });
}
