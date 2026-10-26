/**
 * Picking bands by hand.
 *
 * Where a click lands is not where the band is: it is taken to the top of the
 * band it was aimed at, and the band is read off the spectrum there exactly as
 * automatic picking reads one — the same values, and the same strength letter.
 */

import { peakPicking } from 'ir-spectrum';
import {
  xMinMaxValues,
  xyMaxClosestYPoint,
  xyMaxYPoint,
  xyMinYPoint,
} from 'ml-spectra-processing';

import type { IrBand, IrBandStrength } from './irBand.ts';
import type { IrSpectrum } from './irSpectrum.ts';
import { infraredMeasurement } from './pickBands.ts';
import { intensityStrength } from './ramanBands.ts';

/**
 * What a click while picking by hand makes of a spectrum's bands: the band it
 * landed on taken away, or else the band under it added.
 * @param spectrum - The spectrum picked on.
 * @param wavenumber - Where the click landed, in cm⁻¹.
 * @param reach - How close to a band counts as on it, and how far either side
 * to look for one, in cm⁻¹: a few pixels' worth at the zoom of the chart.
 * @returns The new bands, or the spectrum's own list when nothing changed.
 */
export function editBandsAt(
  spectrum: IrSpectrum,
  wavenumber: number,
  reach: number,
): IrBand[] {
  const bands = spectrum.bands ?? [];
  let hit: IrBand | null = null;
  let nearest = Math.abs(reach);
  for (const band of bands) {
    const distance = Math.abs(band.wavenumber - wavenumber);
    if (distance <= nearest) {
      nearest = distance;
      hit = band;
    }
  }
  if (hit !== null) return removeBand(bands, hit.wavenumber);
  const band = pickBandAt(spectrum, wavenumber, reach);
  return band === null ? bands : addBand(bands, band);
}

/**
 * The band a click asks for: the top of the band under it.
 *
 * The highest point within reach of the click first, then uphill from there to
 * the top: a click lands on a band's flank as often as on its top, and a flank
 * carries bumps of noise that a climb from the click alone would stop at. A
 * band is a maximum of absorbance, or of intensity for a Raman spectrum,
 * whichever way up the chart is drawn.
 * @param spectrum - The spectrum picked on.
 * @param wavenumber - Where the click landed, in cm⁻¹.
 * @param reach - How far either side of it to look, in cm⁻¹.
 * @returns The band, or `null` when the spectrum carries no axis a band is a
 * maximum of, or is flat within reach.
 */
export function pickBandAt(
  spectrum: IrSpectrum,
  wavenumber: number,
  reach: number,
): IrBand | null {
  const { wavenumber: x, intensity, absorbance } = spectrum;
  const y = intensity ?? absorbance;
  if (y === undefined || x.length < 2 || !Number.isFinite(wavenumber)) {
    return null;
  }
  const around = Number.isFinite(reach) ? Math.abs(reach) : 0;
  const within = { from: wavenumber - around, to: wavenumber + around };
  const near = xyMaxYPoint({ x, y }, within);
  // A stretch that does not rise at all has no band to climb to.
  if (around > 0 && near.y <= xyMinYPoint({ x, y }, within).y) return null;
  const top = xyMaxClosestYPoint({ x, y }, { targetIndex: near.index });
  return bandAtIndex(spectrum, top.index);
}

/**
 * The band at one sample of a spectrum, read the way automatic picking reads
 * one.
 * @param spectrum - The spectrum.
 * @param index - The sample.
 * @returns The band, or `null` when there is no such sample or no axis to read
 * it on.
 */
export function bandAtIndex(
  spectrum: IrSpectrum,
  index: number,
): IrBand | null {
  const { id, wavenumber, absorbance, transmittance, intensity } = spectrum;
  const at = wavenumber[index];
  if (at === undefined) return null;
  if (intensity !== undefined) {
    const value = intensity[index] ?? Number.NaN;
    const { min, max } = xMinMaxValues(intensity);
    return {
      spectrumId: id,
      wavenumber: at,
      intensity: value,
      strength: intensityStrength(value, min, max),
    };
  }
  if (absorbance === undefined || transmittance === undefined) return null;
  // `ir-spectrum` reads the sample and works out the letter, as it does for
  // every band it picks itself.
  const peak = peakPicking(
    infraredMeasurement(wavenumber, absorbance, transmittance),
    at,
    { yVariable: 'a' },
  );
  if (peak === undefined) return null;
  return {
    spectrumId: id,
    wavenumber: at,
    absorbance: peak.absorbance,
    transmittance: peak.transmittance * 100,
    strength: peak.kind as IrBandStrength,
  };
}

/**
 * The bands with one more, in its place.
 * @param bands - The bands, ascending.
 * @param band - The band to add.
 * @returns A new list, or the same one when a band already sits there.
 */
export function addBand(bands: IrBand[], band: IrBand): IrBand[] {
  let index = 0;
  while (
    index < bands.length &&
    (bands[index]?.wavenumber ?? 0) < band.wavenumber
  ) {
    index++;
  }
  if (bands[index]?.wavenumber === band.wavenumber) return bands;
  return bands.toSpliced(index, 0, band);
}

/**
 * The bands without the one at a wavenumber.
 * @param bands - The bands.
 * @param wavenumber - Where the band to take away sits, exactly.
 * @returns A new list, or the same one when no band sits there.
 */
export function removeBand(bands: IrBand[], wavenumber: number): IrBand[] {
  const index = bands.findIndex((band) => band.wavenumber === wavenumber);
  return index === -1 ? bands : bands.toSpliced(index, 1);
}
