/**
 * Finding the bands in a spectrum, which `ir-spectrum` does.
 *
 * Everything here is the two things that call needs and does not have: a
 * `MeasurementXY` built out of the arrays the viewer holds, and the decision to
 * pick on **absorbance** rather than on transmittance. That second one is the
 * only judgement in the file and it is not a preference — peak picking finds
 * maxima, and a band is a maximum in absorbance but a *minimum* in transmittance,
 * so picking on transmittance would return the flat baseline between the bands
 * and miss every band there is.
 */

import type { MeasurementXY } from 'cheminfo-types';
import { autoPeakPicking } from 'ir-spectrum';
import { xMaxValue, xMinValue } from 'ml-spectra-processing';

import type { IrBand, IrBandStrength } from './irBand.ts';
import type { IrSpectrum } from './irSpectrum.ts';

/** How the bands are picked. */
export interface PickBandsOptions {
  /**
   * Lowest wavenumber to pick in, in cm⁻¹.
   * @default the start of the spectrum
   */
  from?: number;
  /**
   * Highest wavenumber to pick in, in cm⁻¹.
   * @default the end of the spectrum
   */
  to?: number;
  /**
   * How tall a band must be against the tallest one to count, as a fraction.
   *
   * Two percent by default, which on a real ATR spectrum is a little above the
   * noise and a long way below any band worth naming. Lowered, the fingerprint
   * region fills with shoulders that have no assignment; raised past about a
   * tenth, weak but diagnostic bands — a nitrile, an alkyne — stop being found.
   * @default 0.02
   */
  minRelativeHeight?: number;
  /**
   * Narrowest band to keep, in cm⁻¹.
   *
   * A spike one point wide is a detector glitch rather than a vibration: real
   * infrared bands are several wavenumbers across even at their sharpest.
   * @default 4
   */
  minPeakWidth?: number;
  /**
   * At most how many bands to keep, the strongest first.
   * @default every band found
   */
  limit?: number;
}

/**
 * Pick the bands of one spectrum.
 *
 * The bands come back in ascending wavenumber, which is the order a spectrum is
 * read in rather than the order they were found — `limit` cuts by height, and
 * then what survives is put back in axis order, so a table of them reads like
 * the chart.
 *
 * **A band centre is a sampled point, not an interpolated one.** `ir-spectrum`
 * reports each picked band at the wavenumber of the sample it peaked on, so on a
 * bench instrument's 4 cm⁻¹ grid a carbonyl centred at 1710 is reported at 1708
 * or 1712. That is within the tolerance the assignment table is matched with, and
 * refining it here would mean re-deriving a peak position this package has
 * deliberately delegated — but it is why a band should never be quoted as though
 * it were measured to the wavenumber.
 * @param spectrum - The spectrum to pick from.
 * @param options - Where to pick, and what to keep.
 * @returns The bands, ascending by wavenumber.
 */
export function pickBands(
  spectrum: IrSpectrum,
  options: PickBandsOptions = {},
): IrBand[] {
  const {
    from,
    to,
    minRelativeHeight = 0.02,
    minPeakWidth = 4,
    limit,
  } = options;
  if (spectrum.wavenumber.length < 2) return [];

  const picked = autoPeakPicking(measurementOf(spectrum), {
    // Absorbance, because a band is a maximum there and a minimum in the other.
    yVariable: 'a',
    minMaxRatio: minRelativeHeight,
    minPeakWidth,
    ...(from === undefined ? {} : { from }),
    ...(to === undefined ? {} : { to }),
  });

  const bands: IrBand[] = [];
  for (const peak of picked) {
    if (!Number.isFinite(peak.wavenumber)) continue;
    bands.push({
      spectrumId: spectrum.id,
      wavenumber: peak.wavenumber,
      absorbance: peak.absorbance,
      // `ConvertedPeak.transmittance` is a fraction where the spectrum's own
      // transmittance is a percentage; brought onto the one scale here so that
      // nothing downstream has to remember which of the two it is holding.
      transmittance: peak.transmittance * 100,
      strength: peak.kind as IrBandStrength,
    });
  }

  const kept =
    limit === undefined || bands.length <= limit
      ? bands
      : bands.toSorted(byDescendingAbsorbance).slice(0, limit);
  return kept.toSorted(byAscendingWavenumber);
}

/**
 * The spectrum as `ir-spectrum` wants it.
 *
 * The `t` variable is given its extremes, because that is what the strength
 * letter is worked out from: without them the conversion assumes a spectrum
 * running the full 0 to 100 percent, and every band of a shallow ATR trace that
 * never leaves the eighties comes back weak.
 * @param spectrum - The spectrum the viewer holds.
 * @returns A measurement carrying all three variables.
 */
function measurementOf(spectrum: IrSpectrum): MeasurementXY {
  const transmittance = {
    label: 'Transmittance (%)',
    units: '%',
    symbol: 't' as const,
    data: spectrum.transmittance,
    min: xMinValue(spectrum.transmittance),
    max: xMaxValue(spectrum.transmittance),
  };
  return {
    variables: {
      x: {
        label: 'Wavenumber',
        units: '1/cm',
        symbol: 'x',
        data: spectrum.wavenumber,
      },
      // `y` is required of every measurement, and stands for whichever axis was
      // recorded. Nothing here reads it — the picking is told to use `a` and the
      // strength letter is read off `t` — so it carries the transmittance rather
      // than a third copy of anything.
      y: transmittance,
      a: {
        label: 'Absorbance',
        units: '',
        symbol: 'a',
        data: spectrum.absorbance,
      },
      t: transmittance,
    },
  };
}

/**
 * Order two bands by height, tallest first.
 * @param first - One band.
 * @param second - The other.
 * @returns The comparison.
 */
function byDescendingAbsorbance(first: IrBand, second: IrBand): number {
  return second.absorbance - first.absorbance;
}

/**
 * Order two bands along the axis, lowest wavenumber first.
 * @param first - One band.
 * @param second - The other.
 * @returns The comparison.
 */
function byAscendingWavenumber(first: IrBand, second: IrBand): number {
  return first.wavenumber - second.wavenumber;
}
