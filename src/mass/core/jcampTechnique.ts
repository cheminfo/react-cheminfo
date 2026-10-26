/**
 * Which blocks of a JCAMP a mass viewer has any business reading.
 *
 * JCAMP-DX is a container for whatever an instrument wanted to export, and the
 * file says nothing about which viewer opened it: a file of five infrared
 * spectra, one of UV/VIS ones and a gas-chromatography export writing a whole
 * chromatogram under `##XUNITS= TIME` are all valid JCAMPs. Read as mass
 * spectra they draw a wavenumber, a wavelength or a minute on an m/z axis, and
 * every mass read off them afterwards is a mass of something never measured.
 *
 * So the technique the file states is believed, and only a block that states
 * another one is refused. A block that states none is kept: plenty of
 * instruments write no `##DATA TYPE` at all, and the file was handed to a mass
 * viewer, so mass spectrometry is the right assumption where the file is silent.
 */

import { recordText } from './massMeta.ts';

/** What `jcampconverter` says about one block, as far as this is concerned. */
export interface JcampBlockHeader {
  /**
   * The `##DATA TYPE=` record.
   * @default undefined
   */
  dataType?: string;
  /** The standard records, where `##XUNITS=` is. */
  info: Record<string, unknown>;
}

/**
 * What a block says it is, when what it says is not mass spectrometry.
 *
 * Both halves of the answer are read: the technique names it, and the axis unit
 * is what a chemist looking at a refusal can check against the file in front of
 * them — `INFRARED SPECTRUM in 1/CM` is a sentence they can act on where
 * `unsupported data type` is not.
 * @param entry - The block, as `jcampconverter` read it.
 * @returns The phrase naming it, or `null` when the block may be read as a mass
 * spectrum.
 */
export function otherTechnique(entry: JcampBlockHeader): string | null {
  const dataType = (entry.dataType ?? '').toUpperCase();
  const units = recordText(entry.info.XUNITS).toUpperCase();

  if (MASS_SPECTROMETRY.test(dataType)) return null;
  if (OTHER_TECHNIQUE.test(dataType)) {
    return units === '' ? dataType : `${dataType} in ${units}`;
  }
  // A block naming no technique is still refused when it names an axis no mass
  // spectrum has: `##XUNITS= 1/CM` is a wavenumber whoever wrote the file was
  // measuring, whatever the header left out.
  if (OTHER_AXIS.test(units)) {
    return dataType === '' ? `an axis in ${units}` : `${dataType} in ${units}`;
  }
  return null;
}

/**
 * The techniques that are a mass spectrum however the file spells them.
 *
 * Read before the refusals below, so that `GC-MS` and `LC-MS` — both of which
 * name a separation this reader would otherwise refuse — are kept: what came
 * off the column is still measured by mass.
 */
const MASS_SPECTROMETRY = /\bMASS\b|\bMS\b/;

/**
 * The techniques that are certainly not a mass spectrum.
 *
 * Named rather than matching `MASS SPECTRUM` positively, so that a file typed
 * `CONTINUOUS MASS SPECTRUM`, `GC-MS` or nothing at all is read without this
 * list having to anticipate every spelling an exporter might choose.
 */
const OTHER_TECHNIQUE =
  /\b(?:RAMAN|NMR|INFRARED|FTIR|IR|UV|VIS|VISIBLE|FLUORESCENCE|XRD|EPR|ESR|CHROMATOGRAM|CHROMATOGRAPH)\b/;

/**
 * The axis units that are certainly not an m/z.
 *
 * A wavenumber, a wavelength, a frequency, a chemical shift and a retention
 * time each name an axis some other instrument sweeps; `ARBITRARY`, `M/Z`,
 * `MASS UNITS` and `DALTONS` are all left out, since a mass spectrum is written
 * with every one of them. The unit is looked for as a word inside the record,
 * because a file that states no technique spells it as `Wavenumber (1/cm)`.
 */
const OTHER_AXIS =
  /\b(?:1\/CM|CM-1|WAVENUMBERS?|NM|NANOMETERS?|MICROMETERS?|MICRONS?|HZ|PPM|SECONDS?|MINUTES?|TIME)\b/;
