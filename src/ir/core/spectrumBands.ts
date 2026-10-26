/**
 * The bands a spectrum carries.
 *
 * A spectrum arriving without bands is picked once, with the picking settings
 * in force, and from then on its bands are part of it: they travel to a host
 * with it, and a host's own reach the chart. Bands found automatically follow
 * the settings — moving the threshold picks them again — while bands picked by
 * hand, or handed over, are left as they are.
 */

import type { IrBand } from './irBand.ts';
import type { IrSpectrum } from './irSpectrum.ts';
import type { PickBandsOptions } from './pickBands.ts';
import { pickBands } from './pickBands.ts';

/**
 * A spectrum carrying its bands: picked now when it has none, its own kept and
 * put in order otherwise.
 * @param spectrum - The spectrum, as it arrived.
 * @param picking - How to pick it, if it has to be.
 * @returns The spectrum with its bands; the same object when it had them, in
 * order.
 */
export function withBands(
  spectrum: IrSpectrum,
  picking: PickBandsOptions,
): IrSpectrum {
  const { id, bands } = spectrum;
  if (bands === undefined) {
    return {
      ...spectrum,
      bands: pickBands(spectrum, picking),
      bandsByHand: false,
    };
  }
  const ordered = orderedBands(id, bands);
  return ordered === bands ? spectrum : { ...spectrum, bands: ordered };
}

/**
 * A spectrum's bands picked again with other settings, unless they were picked
 * by hand.
 * @param spectrum - The spectrum.
 * @param picking - The settings now in force.
 * @returns The spectrum re-picked, or the same object when its bands are its
 * own.
 */
export function repickBands(
  spectrum: IrSpectrum,
  picking: PickBandsOptions,
): IrSpectrum {
  if (spectrum.bandsByHand) return spectrum;
  return {
    ...spectrum,
    bands: pickBands(spectrum, picking),
    bandsByHand: false,
  };
}

/**
 * Bands as a spectrum holds them: ascending, one per wavenumber, each naming
 * the spectrum, and none at a wavenumber that is not a number.
 * @param spectrumId - The spectrum they belong to.
 * @param bands - The bands, in any order.
 * @returns The bands in order; the same array when they already were.
 */
export function orderedBands(spectrumId: string, bands: IrBand[]): IrBand[] {
  if (isOrdered(spectrumId, bands)) return bands;
  const kept: IrBand[] = [];
  for (const band of bands.toSorted(byWavenumber)) {
    if (!Number.isFinite(band.wavenumber)) continue;
    if (kept.at(-1)?.wavenumber === band.wavenumber) continue;
    kept.push(band.spectrumId === spectrumId ? band : { ...band, spectrumId });
  }
  return kept;
}

/**
 * Whether two picking settings pick the same bands.
 * @param first - One.
 * @param second - The other.
 * @returns Whether every option agrees.
 */
export function samePicking(
  first: PickBandsOptions,
  second: PickBandsOptions,
): boolean {
  return (
    first === second ||
    (first.from === second.from &&
      first.to === second.to &&
      first.minRelativeHeight === second.minRelativeHeight &&
      first.minPeakWidth === second.minPeakWidth &&
      first.limit === second.limit)
  );
}

function isOrdered(spectrumId: string, bands: readonly IrBand[]): boolean {
  let previous = Number.NEGATIVE_INFINITY;
  for (const band of bands) {
    const { wavenumber } = band;
    if (band.spectrumId !== spectrumId || !Number.isFinite(wavenumber)) {
      return false;
    }
    if (wavenumber <= previous) return false;
    previous = wavenumber;
  }
  return true;
}

function byWavenumber(first: IrBand, second: IrBand): number {
  return first.wavenumber - second.wavenumber;
}
