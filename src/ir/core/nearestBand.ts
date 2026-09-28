/**
 * Which band the pointer is asking about.
 *
 * Found in pixels rather than in wavenumbers, because what a user means by
 * "that band" is what is under the pointer on screen: at a full-scan zoom two
 * bands thirty wavenumbers apart are three pixels apart and either will do,
 * while at a deep zoom the same thirty wavenumbers is half the plot and only one
 * of them is being pointed at.
 */

import type { ChartScale } from '../../chart/core/chartScale.ts';
import { chartPixel } from '../../chart/core/chartScale.ts';

import type { IrBand } from './irBand.ts';

/**
 * How close the pointer has to be to a band, in pixels.
 *
 * Eight is about a fingertip's worth of aim on a trackpad. Wider and the readout
 * claims a band while the pointer is plainly on the baseline beside it; narrower
 * and a band has to be hit exactly, which on a dense fingerprint region is not
 * a gesture anyone can make.
 */
export const BAND_HIT_RADIUS = 8;

/**
 * The band nearest a place on the axis, when one is within reach.
 *
 * A plain scan rather than a binary search: a spectrum is picked down to a few
 * dozen bands, so the whole list is shorter than the setup a search would need,
 * and it stays correct if the bands ever arrive in another order.
 * @param bands - The bands of every spectrum currently drawn.
 * @param xScale - The wavenumber axis as it is currently zoomed, which may run
 * either way round.
 * @param pixelX - Where the pointer is, in user units of the SVG.
 * @param radius - How close it has to be. Defaults to `BAND_HIT_RADIUS`.
 * @returns The band, or `null` when none is within reach.
 */
export function nearestBandAt(
  bands: readonly IrBand[],
  xScale: ChartScale,
  pixelX: number,
  radius = BAND_HIT_RADIUS,
): IrBand | null {
  let found: IrBand | null = null;
  let bestDistance = radius;
  for (const band of bands) {
    const distance = Math.abs(chartPixel(xScale, band.wavenumber) - pixelX);
    // Strictly nearer, so the first of two bands at one wavenumber wins and the
    // answer does not flicker between them as the pointer rests still.
    if (distance < bestDistance) {
      bestDistance = distance;
      found = band;
    }
  }
  return found;
}
