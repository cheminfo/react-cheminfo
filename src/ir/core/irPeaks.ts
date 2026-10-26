/**
 * The bands of an infrared spectrum as a notebook writes them, and back: the
 * peaks of the host protocol's `spectra.ir.jdx` and `spectra.ir.peaks`.
 *
 * The two differ in two ways only: a notebook's transmittance is a fraction
 * where the viewer holds a percentage, and it calls a band's strength `kind`.
 */

import { xFindClosestIndex } from 'ml-spectra-processing';

import type { IrPeakValue } from '../../host/core/irKinds.ts';

import { bandAtIndex } from './handPicking.ts';
import type { IrBand, IrBandStrength } from './irBand.ts';
import type { IrSpectrum } from './irSpectrum.ts';
import { orderedBands } from './spectrumBands.ts';

/**
 * The bands a notebook handed over with a spectrum.
 *
 * Each stays where the notebook put it, with the values it gave; a value it
 * left out is read off the spectrum at the nearest sample, and a strength
 * letter that is not one of `w`, `m` and `S` is worked out again.
 * @param spectrum - The spectrum they were picked on.
 * @param peaks - The peaks, in any order.
 * @returns The bands, ascending, one per wavenumber.
 */
export function bandsFromPeaks(
  spectrum: IrSpectrum,
  peaks: readonly IrPeakValue[],
): IrBand[] {
  const bands: IrBand[] = [];
  for (const peak of peaks) {
    const { wavenumber, absorbance, transmittance, kind } = peak;
    if (!Number.isFinite(wavenumber)) continue;
    const read = bandAtIndex(
      spectrum,
      xFindClosestIndex(spectrum.wavenumber, wavenumber),
    );
    if (read === null) continue;
    bands.push({
      ...read,
      wavenumber,
      ...(absorbance === undefined ? {} : { absorbance }),
      ...(transmittance === undefined
        ? {}
        : { transmittance: transmittance * 100 }),
      strength: isStrength(kind) ? kind : read.strength,
    });
  }
  return orderedBands(spectrum.id, bands);
}

/**
 * Bands as a notebook keeps them.
 * @param bands - The bands, as the viewer holds them.
 * @returns The peaks, in the same order.
 */
export function peaksFromBands(bands: readonly IrBand[]): IrPeakValue[] {
  const peaks: IrPeakValue[] = [];
  for (const band of bands) {
    const { wavenumber, absorbance, transmittance, strength } = band;
    peaks.push({
      wavenumber,
      ...(absorbance === undefined ? {} : { absorbance }),
      ...(transmittance === undefined
        ? {}
        : { transmittance: transmittance / 100 }),
      kind: strength,
    });
  }
  return peaks;
}

function isStrength(kind: string | undefined): kind is IrBandStrength {
  return kind !== undefined && STRENGTHS.includes(kind);
}

const STRENGTHS: readonly string[] = ['w', 'm', 'S'] satisfies IrBandStrength[];
