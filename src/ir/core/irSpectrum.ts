/**
 * What an infrared spectrum is once it has been read, whatever it was read from.
 *
 * One acquisition becomes one `IrSpectrum` carrying **both** value axes —
 * absorbance and percent transmittance — over one shared array of wavenumbers.
 * Both are held rather than one being derived on demand because `ir-spectrum`
 * already produces both when it reads a file: it adds an `a` and a `t` variable
 * to every spectrum whichever of the two the instrument wrote, so the conversion
 * happens once, in the one place that knows what the file's y axis meant. Holding
 * the answer means switching what is drawn costs nothing, and means the two
 * axes can never drift apart through a round trip.
 *
 * The arrays are `Float64Array` and are replaced on a change, never written
 * into, since every consumer holds the same object by reference. An infrared
 * spectrum is a few thousand points rather than a mass spectrum's few hundred
 * thousand, so holding two value axes costs nothing worth counting.
 */

import type { DataXY } from 'cheminfo-types';

import type { ChartDomain } from '../../chart/core/chartDomain.ts';

/**
 * One trace of a measurement: wavenumber against whichever value axis is drawn.
 *
 * `DataXY` is the shape every package in this pipeline speaks — `ir-spectrum`,
 * `common-spectrum`, `xy-parser` and `ml-spectra-processing` all take and return
 * it — so declaring a parallel type of our own would buy nothing and cost an
 * adapter at each boundary.
 */
export type IrTrace = DataXY<Float64Array>;

/** The formats a spectrum can have been read from. */
export type IrFormat = 'jcamp' | 'spc' | 'text' | 'calculated';

/**
 * Where a spectrum came from, and what the file said about the acquisition.
 *
 * Kept apart from `meta` because these are the facts other code branches on,
 * while `meta` is a table to read.
 */
export interface IrOrigin {
  /** The format it was read from. */
  format: IrFormat;
  /**
   * Name of the file it came from, absent for a paste.
   * @default undefined
   */
  fileName?: string;
  /**
   * Which block of that file, absent when the file held only one.
   * @default undefined
   */
  blockIndex?: number;
  /**
   * Which value axis the file itself carried, absent when it said nothing.
   *
   * Worth keeping even though both axes are held: a spectrum exported as
   * transmittance and one exported as absorbance are the same measurement, but
   * only one of the two is what the instrument actually recorded, and the other
   * carries whatever the conversion did to its noise.
   * @default undefined
   */
  recorded?: IrMode;
}

/** One row of the acquisition table. */
export interface IrMetaField {
  /** How the row is named, in the display order the table fixes. */
  label: string;
  /** The value as the file states it. */
  value: string;
}

/**
 * What the file says about how the spectrum was acquired.
 *
 * Only ever what it actually says: a field the file leaves blank is left out
 * rather than shown empty, so the table is short and every line in it is a fact.
 * A plain two-column paste carries none of this, and the panel then shows the
 * file name alone.
 */
export interface IrMeta {
  /** The title record, `null` when the file carries none. */
  title: string | null;
  /** The fields that are populated, in display order. */
  fields: IrMetaField[];
}

/** Which value axis is being drawn and read. */
export type IrMode = 'absorbance' | 'transmittance';

/** One spectrum as the viewer holds it. */
export interface IrSpectrum {
  /** Identity, stable across edits so a selection survives a rename. */
  id: string;
  /** What the list calls it; editable, and never used as identity. */
  name: string;
  /** The colour it is drawn in. */
  color: string;
  /**
   * The wavenumbers in cm⁻¹, **ascending**.
   *
   * Ascending even though the axis is read from 4000 down to 400: which way the
   * numbers run on screen is the chart's business, and every binary search and
   * every extent taken off index zero downstream wants them in order. Reversing
   * the data instead would make the drawing simpler once and everything else
   * wrong.
   */
  wavenumber: Float64Array;
  /** Absorbance at each wavenumber, as `ir-spectrum` supplied it. */
  absorbance: Float64Array;
  /** Percent transmittance at each wavenumber, likewise. */
  transmittance: Float64Array;
  /** What the file said about the acquisition, `null` when it said nothing. */
  meta: IrMeta | null;
  /** Where it came from. */
  origin: IrOrigin;
  /** Whether it is drawn. */
  visible: boolean;
  /**
   * Whether the trace is left out of the automatic domain. A reference held
   * under the pointer for comparison must not move the axes, or hovering one
   * would throw away the zoom the user set.
   * @default false
   */
  excludeFromDomain?: boolean;
}

/**
 * The window the chart is showing, in data units.
 *
 * `ChartDomain` itself, not a type of our own: the arithmetic that moves a
 * window is the shared chart's and speaks that type, and an alias here
 * that merely renamed it would need converting at every call. `x` is in
 * wavenumbers and runs low to high, whichever way round the axis is drawn.
 */
export type IrDomain = ChartDomain;

/**
 * The trace to draw for a spectrum, in whichever value axis is being read.
 *
 * The arrays are handed back by reference rather than copied: nothing downstream
 * writes into a trace, and a profile of a few thousand points copied on every
 * render of every spectrum is a copy per frame for no gain.
 * @param spectrum - The spectrum.
 * @param mode - Which value axis is being drawn.
 * @returns The trace, sharing the spectrum's own arrays.
 */
export function traceOf(spectrum: IrSpectrum, mode: IrMode): IrTrace {
  return {
    x: spectrum.wavenumber,
    y: mode === 'absorbance' ? spectrum.absorbance : spectrum.transmittance,
  };
}
