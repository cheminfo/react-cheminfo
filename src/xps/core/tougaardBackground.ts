/**
 * The Tougaard background: the inelastic tail computed, not interpolated.
 *
 * Shirley distributes the step between the two ends of the window and says
 * nothing about where the scattered electrons went; Tougaard convolves the
 * measured spectrum with a loss cross-section and lets the tail fall where the
 * physics puts it. That makes it the honest background over a wide window — an
 * oxide film, a survey region several hundred eV across — where the Shirley
 * step has long since stopped resembling the real baseline.
 *
 * The price is that the cross-section is a property of the sample and this uses
 * the universal one, which was fitted once across a set of metals and their
 * oxides and is then applied to anything. It is a good approximation for solids
 * and a poor one for adsorbates and polymers.
 */

import type {
  BackgroundOptions,
  BackgroundResult,
} from './backgroundResult.ts';
import { endpointLevels } from './backgroundResult.ts';
import { linearBackground } from './linearBackground.ts';
import type { XpsTrace } from './xpsSpectrum.ts';

/**
 * Numerator of Tougaard's universal cross-section, in eV².
 *
 * From S. Tougaard, *Surface and Interface Analysis* 11 (1988) 453: the loss
 * function `B·T/(C + T²)²` fitted once to a set of metals and oxides and used
 * since for any solid whose own loss function is not separately known.
 */
export const TOUGAARD_B = 2866;

/** Denominator constant of the same universal cross-section, in eV². */
export const TOUGAARD_C = 1643;

/** The cross-section the loss tail is computed with. */
export interface TougaardBackgroundOptions extends BackgroundOptions {
  /**
   * Numerator of the loss cross-section, in eV².
   * @default TOUGAARD_B
   */
  crossSectionB?: number;
  /**
   * Denominator constant of the loss cross-section, in eV².
   * @default TOUGAARD_C
   */
  crossSectionC?: number;
}

/**
 * The Tougaard background under a window.
 *
 * `B(E) = ∫ K(T)·I(E') dE'` with `K(T) = B·T/(C + T²)²` and `T` the energy the
 * electron lost. A loss moves an electron up in binding energy, so the point at
 * `x[index]` is fed by everything below it in the array and `T` is
 * `x[index] − x[other]`: the same `T = E' − E` as the kinetic-energy form the
 * cross-section is published in, read on the axis this package holds.
 *
 * The intensity convolved is what stands above the level at the low-binding-
 * energy end rather than the raw counts, so the background leaves that end at
 * the measured level instead of at zero, and a window whose baseline is a
 * thousand counts does not get a tail a thousand counts tall out of the offset
 * alone.
 *
 * Every point reads every point below it, so the cost is quadratic in the
 * window — which is what it is meant for: a region of a few hundred points, not
 * a whole survey scan at full resolution.
 * @param trace - The window, x ascending in binding energy.
 * @param options - The cross-section, and how many points fix the level.
 * @returns The background, and the window with it taken off.
 */
export function tougaardBackground(
  trace: XpsTrace,
  options: TougaardBackgroundOptions = {},
): BackgroundResult {
  const {
    crossSectionB = TOUGAARD_B,
    crossSectionC = TOUGAARD_C,
    averageWidth = 1,
  } = options;
  const { x, y } = trace;
  const length = x.length;
  if (length < 2) return linearBackground(trace, options);

  const { low } = endpointLevels(trace, averageWidth);
  const background = new Float64Array(length);
  const corrected = new Float64Array(length);

  for (let index = 0; index < length; index++) {
    const energy = x[index] as number;
    const firstTransfer = energy - (x[0] as number);
    let previous =
      crossSection(firstTransfer, crossSectionB, crossSectionC) *
      ((y[0] as number) - low);
    let loss = 0;
    for (let other = 1; other <= index; other++) {
      const transfer = energy - (x[other] as number);
      const current =
        crossSection(transfer, crossSectionB, crossSectionC) *
        ((y[other] as number) - low);
      const width = (x[other] as number) - (x[other - 1] as number);
      loss += (width * (previous + current)) / 2;
      previous = current;
    }
    const level = low + loss;
    background[index] = level;
    corrected[index] = (y[index] as number) - level;
  }
  return { background, corrected };
}

/**
 * The universal loss cross-section at one energy transfer.
 * @param transfer - The energy the electron lost, in eV; zero at the point.
 * @param numerator - The `B` of the cross-section, in eV².
 * @param constant - The `C` of the cross-section, in eV².
 * @returns The cross-section, in reciprocal eV.
 */
function crossSection(
  transfer: number,
  numerator: number,
  constant: number,
): number {
  const denominator = constant + transfer * transfer;
  return (numerator * transfer) / (denominator * denominator);
}
