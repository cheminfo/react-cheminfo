/**
 * What a mass spectrum is once it has been read, whatever it was read from.
 *
 * A file gives one or more acquisitions; each becomes one `MassSpectrum` with
 * two traces of the same measurement — the continuous `profile` as the
 * instrument recorded it, and the `centroid` the peak picking reduced it to.
 * Both are kept because they answer different questions: the profile is what a
 * chemist recognises as a spectrum, and the centroid is what every number
 * downstream is computed from. A centroided file has no profile, and that is
 * the normal case for a peak table pasted out of an instrument report.
 *
 * The arrays are `Float64Array` throughout and are never converted to
 * `number[]`: a profile scan runs to hundreds of thousands of points, a plain
 * array costs two to three times the memory, and any structural freeze or
 * spread walks it element by element while treating a typed array as atomic.
 * They are replaced on a change, never written into, since every consumer holds
 * the same object by reference.
 *
 * The shape is the one the glycan site's mass viewer holds, field for field
 * where the two overlap, so a spectrum that viewer built can be handed to
 * anything here: whatever it carries beyond these fields is simply not read.
 */

import type { DataXY } from 'cheminfo-types';

import type { ChartDomain } from '../../chart/core/chartDomain.ts';

import type { MassResolution } from './massResolution.ts';

/**
 * One trace of a measurement: m/z against intensity, x strictly increasing.
 *
 * `DataXY` is the shape every package in this pipeline speaks — `xy-parser`,
 * `ms-spectrum` and `ml-spectra-processing` all take and return it — so
 * declaring a parallel type of our own would buy nothing and cost an adapter at
 * each boundary.
 */
export type MassTrace = DataXY<Float64Array>;

/**
 * The picked peaks of a spectrum, with the charge of each.
 *
 * `charge` is a dense column rather than an array of optional numbers so it
 * costs two bytes a peak and needs no per-peak object: `0` means no charge was
 * established, which is an answer rather than a missing value — a peak belongs
 * to no isotopologue cluster and to no charge ladder. A charge is never read
 * off a single peak, only off the series it belongs to.
 */
export interface MassPeaks extends MassTrace {
  /** Charge of each peak, `0` where none was established. Signed. */
  charge: Int16Array;
}

/**
 * The formats a spectrum can have been read from.
 *
 * The two this package reads, and `calculated` for a trace nobody measured. Any
 * other name is accepted as well, because a host that read an mzML with a
 * reader of its own hands the spectrum over still knowing what it was read
 * from, and the acquisition table should say so rather than call it text.
 */
export type MassFormat =
  'jcamp' | 'text' | 'calculated' | (string & Record<never, never>);

/**
 * Where a spectrum came from, and what the file said about the acquisition.
 *
 * Kept apart from `meta` because these are the facts other code branches on —
 * a calculated trace is never reduced for drawing, an MS2 scan carries a
 * precursor worth showing beside its name — while `meta` is a table to read.
 * The readers of this package leave the acquisition facts out; a host whose
 * reader states them, an mzML's, hands them over here.
 */
export interface MassOrigin {
  /** The format it was read from. */
  format: MassFormat;
  /**
   * Name of the file it came from, absent for a paste.
   * @default undefined
   */
  fileName?: string;
  /**
   * Which acquisition of that file, counted from zero — the block of a JCAMP,
   * or the page of a GC/MS one — absent when the file held only one.
   * @default undefined
   */
  scanIndex?: number;
  /**
   * MS level: 1 for a survey scan, 2 for a fragmentation scan.
   * @default undefined
   */
  msLevel?: number;
  /**
   * Polarity the scan was acquired in.
   * @default undefined
   */
  polarity?: 'positive' | 'negative';
  /**
   * The m/z that was isolated and fragmented, on an MS2 scan.
   * @default undefined
   */
  precursorMz?: number;
  /**
   * The monoisotopic m/z the instrument named for that precursor, where it
   * named one.
   *
   * Carried beside the precursor rather than instead of it because the two are
   * the same number on nearly every scan that has both, and a different one on
   * a scan whose method offset its isolation window: the precursor is then the
   * centre of the window, since that is what the quadrupole transmitted, and
   * this is the molecule the method was after.
   * @default undefined
   */
  precursorMonoisotopicMz?: number;
  /**
   * Retention time in minutes, on a scan out of a chromatographic run.
   * @default undefined
   */
  retentionTime?: number;
}

/** One row of the acquisition table. */
export interface MassMetaField {
  /** How the row is named, in the display order the table fixes. */
  label: string;
  /** The value as the file states it. */
  value: string;
}

/**
 * What the file says about how the spectrum was acquired.
 *
 * Only ever what it actually says: a field the file leaves blank is left out
 * rather than shown empty, so the table is short and every line in it is a
 * fact. A plain two-column paste carries none of this, which is most pastes,
 * and the panel then shows the file name alone.
 */
export interface MassMeta {
  /** The title record, `null` when the file carries none. */
  title: string | null;
  /** The molecular formula the file claims, `null` when it claims none. */
  molecularFormula: string | null;
  /** The fields that are populated, in display order. */
  fields: MassMetaField[];
  /**
   * The instrument's own scan description, kept verbatim. Real instruments
   * leave the structured records empty and put the answer only here, so it is
   * both the fallback the fields are mined from and worth showing as written.
   */
  conditions: string | null;
}

/** One spectrum as the viewer holds it. */
export interface MassSpectrum {
  /** Identity, stable across edits so a selection survives a rename. */
  id: string;
  /** What the list calls it; editable, and never used as identity. */
  name: string;
  /** The colour both its traces are drawn in. */
  color: string;
  /** The continuous trace, `null` when the file was already centroided. */
  profile: MassTrace | null;
  /** The picked peaks, which every number downstream is computed from. */
  centroid: MassPeaks;
  /** What the file said about the acquisition, `null` when it said nothing. */
  meta: MassMeta | null;
  /** Where it came from. */
  origin: MassOrigin;
  /**
   * Whether the profile is drawn. The viewer draws one trace or the other and
   * never both; `isSpectrumDrawn` is the question to ask about the pair.
   */
  showProfile: boolean;
  /** Whether the centroid sticks are drawn, under the same rule. */
  showCentroid: boolean;
  /**
   * Whether the trace is left out of the automatic domain. A predicted
   * distribution previewed under the pointer must not move the axes, or hovering
   * a candidate would throw away the zoom the user set.
   * @default false
   */
  excludeFromDomain?: boolean;
  /**
   * How finely the spectrum resolves masses, as it was decided when it was read.
   *
   * Left out by a host that built the spectrum itself, and then worked out from
   * the masses as written — see `resolutionOf`.
   * @default undefined
   */
  resolution?: MassResolution;
}

/**
 * The window the chart is showing, in data units.
 *
 * `ChartDomain` itself, not a type of our own: the arithmetic that moves a
 * window is the shared chart's and speaks that type, and an alias here that
 * merely renamed it would need converting at every call. `x` is in m/z and `y`
 * in intensity.
 */
export type MassDomain = ChartDomain;

/**
 * Whether a spectrum is on the chart at all, by whichever of its traces.
 *
 * A spectrum is drawn as its profile *or* as its sticks and never as both — a
 * centroid standing inside the peak shapes it was picked from reads as a second
 * spectrum laid over the first — so whether it is on screen is a question about
 * the pair and not about either one.
 *
 * This is what everything that *uses* the picked peaks asks: pointing at a peak,
 * labelling one, listing them. All of them read the centroid whether or not the
 * sticks are the trace being drawn, so asking `showCentroid` there would make a
 * spectrum shown as its profile quietly stop answering anything.
 * @param spectrum - The spectrum.
 * @returns Whether either of its traces is drawn.
 */
export function isSpectrumDrawn(spectrum: MassSpectrum): boolean {
  return spectrum.showProfile || spectrum.showCentroid;
}
