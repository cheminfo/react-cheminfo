/**
 * The workspace: how every spectrum is drawn and quantified, whichever spectra
 * are open, and the bounds a setting is kept within.
 *
 * Every route into the settings goes through `mergeXpsSettings` — the viewer
 * opening, a gesture, a workspace read back from a file — because several of
 * them carry a value a caller can get wrong in a way nothing downstream
 * reports.
 */

import type { SurveyBackground } from './quantifySurvey.ts';
import type { XpsInstrument } from './xpsInstrument.ts';
import { DEFAULT_INSTRUMENT_ID, readInstruments } from './xpsInstrument.ts';

/** Which of the two axes the chart is drawn against. */
export type EnergyAxis = 'binding' | 'kinetic';

/** The workspace: how every spectrum is drawn, whichever ones are open. */
export interface XpsSettings {
  /**
   * Which axis the chart is drawn against. Binding energy unless somebody asks
   * otherwise: it is what an XPS spectrum is published in, and the only axis
   * two instruments with different sources agree on. A spectrum whose file
   * states no source energy stays on kinetic whatever this says, since there is
   * nothing to convert it with.
   */
  energyAxis: EnergyAxis;
  /**
   * The background subtracted under each region before an area is taken.
   * `none` leaves the trace as measured and is what a survey scan is read on;
   * `shirley` is what a fitted narrow scan was quantified with.
   */
  background: 'none' | 'linear' | 'shirley';
  /** Whether the chart shades the regions the file defines. */
  showRegions: boolean;
  /** Whether the chart draws the components the file was fitted with. */
  showComponents: boolean;
  /** Whether the chart writes the energy of its tallest peaks beside them. */
  showLabels: boolean;
  /**
   * How many labels the chart writes at most, the most intense first. A survey
   * scan has far more peaks than a chart has room for names, so this is what
   * keeps a zoomed-out spectrum from being written over entirely.
   */
  labelLimit: number;
  /**
   * How far in eV a reference binding energy may sit from a peak and still be
   * offered as what that peak is. Half an eV is a charge correction; two is a
   * chemical shift; past about three the answer stops being one element.
   */
  referenceTolerance: number;
  /**
   * Whether counts are drawn on the 0–100 scale rather than as they were
   * measured. Two spectra acquired with different dwell times are compared by
   * shape and never by counts, which is why this is on unless somebody turns it
   * off.
   */
  normalise: boolean;
  /**
   * The instrument whose sensitivity factors a survey is quantified with: one
   * the viewer ships, or one of `instruments`. An identity nothing answers to
   * quantifies with the default one rather than with nothing.
   */
  instrumentId: string;
  /**
   * The instruments the reader entered, each with its own factors. The ones
   * the viewer ships are not kept here: nobody edits them, and a workspace
   * holding a copy would keep the copy after the table was corrected.
   */
  instruments: XpsInstrument[];
  /**
   * The background a survey's areas are taken over before they are divided.
   * Never `none`: an area that keeps the inelastic tail under it counts the
   * electrons of every line at higher kinetic energy as well.
   */
  surveyBackground: SurveyBackground;
}

/**
 * How many peaks a chart names before it stops.
 *
 * Fifteen is about as many energies as fit across a chart of any usual width
 * without one label sitting on the next; past that the labels stop being read
 * and start being scenery.
 */
export const DEFAULT_LABEL_LIMIT = 15;

/** The largest number of labels a gesture may ask for. */
export const MAXIMUM_LABEL_LIMIT = 500;

/** The widest window in eV a gesture may ask a reference to be found in. */
export const MAXIMUM_REFERENCE_TOLERANCE = 20;

/** The workspace a fresh viewer starts from. */
export const DEFAULT_SETTINGS: XpsSettings = {
  energyAxis: 'binding',
  background: 'none',
  showRegions: true,
  showComponents: true,
  showLabels: true,
  labelLimit: DEFAULT_LABEL_LIMIT,
  referenceTolerance: 2,
  normalise: false,
  instrumentId: DEFAULT_INSTRUMENT_ID,
  instruments: [],
  surveyBackground: 'shirley',
};

/**
 * The workspace once a change has been folded into it, within what a chart can
 * carry.
 *
 * Every route into `settings` goes through here — the viewer opening, a
 * gesture, a state read back from a file — because two of these carry a number
 * a caller can get wrong in a way nothing downstream reports. A reference
 * tolerance of zero is not a narrow window but one no peak can fall in, so
 * every peak quietly stops being identified; a label limit of a million is a
 * spectrum written over entirely. A value the viewer cannot show is left as it
 * stands rather than refused, since a file written by another viewer is
 * nobody's gesture to be told off for.
 * @param current - The workspace in force.
 * @param change - The settings that change, each of them optional.
 * @returns The workspace, its bounded numbers within bounds.
 */
export function mergeXpsSettings(
  current: XpsSettings,
  change: Partial<XpsSettings> = {},
): XpsSettings {
  const askedLimit = change.labelLimit ?? current.labelLimit;
  const askedTolerance =
    change.referenceTolerance ?? current.referenceTolerance;
  return {
    ...current,
    ...change,
    labelLimit: Number.isFinite(askedLimit)
      ? Math.min(MAXIMUM_LABEL_LIMIT, Math.max(0, Math.round(askedLimit)))
      : current.labelLimit,
    referenceTolerance: isUsableTolerance(askedTolerance)
      ? Math.min(MAXIMUM_REFERENCE_TOLERANCE, askedTolerance)
      : current.referenceTolerance,
    instrumentId:
      typeof change.instrumentId === 'string' && change.instrumentId !== ''
        ? change.instrumentId
        : current.instrumentId,
    instruments:
      change.instruments === undefined
        ? current.instruments
        : readInstruments(change.instruments),
    surveyBackground: isSurveyBackground(change.surveyBackground)
      ? change.surveyBackground
      : current.surveyBackground,
  };
}

/**
 * Whether a value names a background a survey can be quantified over.
 * @param value - What a gesture or a file asked for.
 * @returns Whether it is `linear` or `shirley`.
 */
function isSurveyBackground(value: unknown): value is SurveyBackground {
  return value === 'linear' || value === 'shirley';
}

/**
 * Whether a tolerance is a window a peak can fall in.
 *
 * Zero and below are the values worth catching: a lookup through them answers
 * nothing while looking exactly like a lookup that found nothing.
 * @param tolerance - The window asked for, in eV.
 * @returns Whether it has a width a measurement could sit inside.
 */
export function isUsableTolerance(tolerance: number): boolean {
  return Number.isFinite(tolerance) && tolerance > 0;
}

/**
 * Whether two workspaces say the same thing.
 * @param current - The workspace in force.
 * @param next - The workspace asked for.
 * @returns Whether every setting already holds that value.
 */
export function sameXpsSettings(
  current: XpsSettings,
  next: XpsSettings,
): boolean {
  return (
    current.energyAxis === next.energyAxis &&
    current.background === next.background &&
    current.showRegions === next.showRegions &&
    current.showComponents === next.showComponents &&
    current.showLabels === next.showLabels &&
    current.labelLimit === next.labelLimit &&
    current.referenceTolerance === next.referenceTolerance &&
    current.normalise === next.normalise &&
    current.instrumentId === next.instrumentId &&
    current.instruments === next.instruments &&
    current.surveyBackground === next.surveyBackground
  );
}
