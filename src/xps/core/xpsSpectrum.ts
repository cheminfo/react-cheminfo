/**
 * What an XPS spectrum is once it has been read, whatever it was read from.
 *
 * A VAMAS file holds one block per acquisition and each becomes one
 * `XpsSpectrum`: a survey scan over the whole binding-energy range, or a narrow
 * scan of a single transition, of a single sample. A file holding six samples
 * measured over eight transitions gives forty-eight of them, which is why
 * `origin.sampleId` is part of the model rather than something recovered later
 * — the list is read by sample first and by transition second.
 *
 * `energy` is always **binding** energy in eV, ascending in the array. Binding
 * energy is what an XPS spectrum is read and published in, and it is the only
 * axis two instruments agree on: kinetic energy depends on the photon the
 * source emits, so the same C 1s line lands 253 eV apart on an Al Kα and a Mg
 * Kα machine. The kinetic trace is kept alongside when the source energy is
 * known, because a file states its peak positions in whichever of the two it
 * was written in and the CASA block comments state theirs in kinetic.
 *
 * The array being ascending and the chart drawing it descending are not in
 * conflict: the convention is a reversed axis, not reversed data, and every
 * search, integration and peak pick below depends on x increasing.
 */

import type { DataXY } from 'cheminfo-types';

import type { XpsSurveyLine } from './surveyLines.ts';

/**
 * One trace of a measurement: energy in eV against counts, x strictly
 * increasing.
 *
 * `DataXY` is the shape every package in this pipeline speaks —
 * `ml-spectra-processing`, `ml-gsd`, `xy-parser` and `common-spectrum` all take
 * and return it — so a parallel type of our own would buy nothing and cost an
 * adapter at each boundary.
 */
export type XpsTrace = DataXY<Float64Array>;

/** The formats a spectrum can have been read from. */
export type XpsFormat = 'vamas' | 'jcamp' | 'text' | 'calculated';

/**
 * The core level a narrow scan was taken of, as the block identifier names it.
 *
 * Every field is nullable because a survey scan is of no transition in
 * particular and says so by naming itself `Survey` or `wide`. An Auger line is
 * named the other way — two or three letters rather than a shell and an orbital
 * — so both readings are kept and whichever one matched is the one that is not
 * null.
 */
export interface XpsTransition {
  /** The block identifier as written: `C 1s`, `Mo 3d`, `1: S 2p`, `Survey`. */
  name: string;
  /** Element symbol of the core level, `null` on a survey scan. */
  element: string | null;
  /** Principal quantum number, `null` when the name is not an orbital. */
  shell: number | null;
  /** Orbital letter: `s`, `p`, `d`, `f`. `null` when the name is not one. */
  angularMomentum: string | null;
  /** Element of the Auger transition, `null` when the name is not one. */
  augerElement: string | null;
  /** The Auger transition itself, `null` when the name is not one. */
  augerTransition: string | null;
}

/**
 * One peak of a fit, as CASA wrote it into the block comment.
 *
 * A component is a claim about chemistry rather than a feature of the data: the
 * two components under one C 1s envelope are a C–C and a C–O carbon, and the
 * whole point of the file having been fitted is that somebody decided which.
 * The area and the sensitivity factor beside it are what a composition is
 * computed from, and both come out of the file — never out of a table of our
 * own, which would be a different laboratory's numbers silently substituted for
 * the ones the fit was actually done with.
 */
export interface XpsComponent {
  /** Identity, and the join key everywhere. */
  id: string;
  /** What the fit calls it: `C 1s 1`, `Mo 3d MoS2 2H`, `S 2s`. */
  label: string;
  /** Where it sits, in eV of binding energy. */
  bindingEnergy: number;
  /** Where it sits in kinetic energy, `null` when the source energy is not known. */
  kineticEnergy: number | null;
  /** Area under the component, in the file's own units. */
  area: number;
  /** Full width at half maximum, in eV. */
  fwhm: number;
  /** The peak shape the fit used, as the file names it. */
  shape: string;
  /** The factor the area is divided by to get a composition, `null` when unstated. */
  relativeSensitivityFactor: number | null;
  /** Atomic mass the file states for the element, `null` when unstated. */
  atomicMass: number | null;
  /** The region it was fitted inside, `null` when the block declares none. */
  regionId: string | null;
}

/**
 * A window of the spectrum with a background under it, as CASA defined it.
 *
 * The two energies are stored low-to-high whichever way round the file wrote
 * them: CASA states a region in kinetic energy, so converting to binding energy
 * turns its start into the higher of the two, and every consumer downstream
 * would otherwise have to know that.
 */
export interface XpsRegion {
  /** Identity, and the join key everywhere. */
  id: string;
  /** What the file calls it, usually the transition: `C 1s`. */
  label: string;
  /** How the background under it was drawn: `Shirley`, `Linear`, `Tougaard`. */
  backgroundType: string;
  /** Lower bound in eV of binding energy. */
  from: number;
  /** Upper bound in eV of binding energy. */
  to: number;
  /** The factor an area inside it is divided by, `null` when unstated. */
  relativeSensitivityFactor: number | null;
  /** Atomic mass the file states for the element, `null` when unstated. */
  atomicMass: number | null;
}

/**
 * One maximum found in the trace.
 *
 * A peak is a feature of the data and says nothing about chemistry: which
 * element it belongs to is a lookup against reference binding energies, done
 * where it is shown rather than stored here, because it depends on how wide a
 * window the reader is willing to accept and that is a setting they change
 * while looking at it.
 */
export interface XpsPeak {
  /** Identity, and the join key everywhere. */
  id: string;
  /** Where the maximum sits, in eV of binding energy. */
  bindingEnergy: number;
  /** Counts at the maximum. */
  intensity: number;
  /** Width at half maximum in eV, as the detection estimated it. */
  width: number;
}

/** One row of the acquisition table. */
export interface XpsMetaField {
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
 * fact.
 */
export interface XpsMeta {
  /** The experiment or sample title, `null` when the file carries none. */
  title: string | null;
  /** The X-ray source as the file names it: `Al Ka, Monochromated`. */
  sourceLabel: string | null;
  /** The photon energy in eV, `null` when the file states none or states zero. */
  sourceEnergy: number | null;
  /** The analyser mode: `FAT`, `FRR`. */
  analyserMode: string | null;
  /** Pass energy in eV, `null` when unstated. */
  passEnergy: number | null;
  /** The fields that are populated, in display order. */
  fields: XpsMetaField[];
}

/** Where a spectrum came from. */
export interface XpsOrigin {
  /** The format it was read from. */
  format: XpsFormat;
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
   * The sample the block was measured on, as the file identifies it. A VAMAS
   * file of one experiment holds every sample of it, so this is what the list
   * groups by.
   * @default undefined
   */
  sampleId?: string;
}

/** One spectrum as the viewer holds it. */
export interface XpsSpectrum {
  /** Identity, stable across edits so a selection survives a rename. */
  id: string;
  /** What the list calls it; editable, and never used as identity. */
  name: string;
  /** The colour it is drawn in. */
  color: string;
  /**
   * Counts against binding energy in eV, x ascending.
   *
   * Kinetic energy when `sourceEnergy` is `null`, which is the one case where
   * there is no binding axis to be had: a file that states no photon energy —
   * an Auger spectrum taken without a monochromator is the usual one — cannot
   * be converted, and a viewer that pretended otherwise would put every peak
   * 1486 eV from where it belongs. `sourceEnergy === null` is therefore the
   * signal that this axis is kinetic, and the chart labels it so.
   */
  energy: XpsTrace;
  /**
   * Counts against kinetic energy in eV, `null` when the source energy is not
   * known — and then `energy` already holds it. Shares its `y` with `energy`;
   * only the axis differs.
   */
  kinetic: XpsTrace | null;
  /** The photon energy in eV, `null` when the file states none or states zero. */
  sourceEnergy: number | null;
  /** The core level the block was scanned over. */
  transition: XpsTransition;
  /**
   * The maxima found in the trace. Filled in when the spectrum is loaded and
   * replaced whenever the detection is asked for again with other settings, so
   * a table and a chart label are always reading the same peaks.
   */
  peaks: XpsPeak[];
  /** The peaks the file was fitted with, empty when it carries no fit. */
  components: XpsComponent[];
  /** The windows the file defines a background under, empty when it defines none. */
  regions: XpsRegion[];
  /** What the file said about the acquisition, `null` when it said nothing. */
  meta: XpsMeta | null;
  /** Where it came from. */
  origin: XpsOrigin;
  /** Whether the trace is drawn. */
  visible: boolean;
  /**
   * Whether the trace is left out of the automatic window. A reference line
   * previewed under the pointer must not move the axes, or hovering a table row
   * would throw away the zoom the user set.
   * @default false
   */
  excludeFromDomain?: boolean;
  /**
   * The lines a survey is quantified on and the window of each, once somebody
   * chose them. Until then the quantification panel works them out from the
   * narrow scans of the same sample, so nothing is stored that was not chosen.
   * @default undefined
   */
  surveyLines?: XpsSurveyLine[];
}

/** The window the chart is showing, in data units. */
export interface XpsDomain {
  /** `[min, max]` on binding energy in eV. The chart draws it right to left. */
  x: [number, number];
  /** `[min, max]` on counts. */
  y: [number, number];
}

/**
 * Whether a spectrum carries a fit somebody made rather than only a trace.
 *
 * Asked wherever the answer changes what is worth showing: the components table
 * has nothing to say about an unfitted survey scan, and a composition computed
 * from no components is not zero but unanswerable.
 * @param spectrum - The spectrum.
 * @returns Whether the file carried at least one fitted component.
 */
export function isFitted(spectrum: XpsSpectrum): boolean {
  return spectrum.components.length > 0;
}

/**
 * Whether a spectrum is on the chart and counts towards the window.
 *
 * The two are one question everywhere they are asked together — a trace that is
 * hidden cannot widen the axes, and one deliberately kept out of the window is
 * still drawn — so they are answered in one place rather than reasoned about at
 * each call site.
 * @param spectrum - The spectrum.
 * @returns Whether it is drawn and its extent is part of the automatic window.
 */
export function boundsDomain(spectrum: XpsSpectrum): boolean {
  return spectrum.visible && spectrum.excludeFromDomain !== true;
}
