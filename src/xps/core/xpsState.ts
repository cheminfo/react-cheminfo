/**
 * The viewer's whole state, in the three buckets NMRium splits its own into.
 *
 * `data` is the document — the spectra that are open, which is what a saved
 * file holds. `view` is where you are in the viewer: which spectrum the panels
 * act on, what window the chart is showing, which panels are open. `settings`
 * is the workspace — how spectra are drawn, what background is subtracted, how
 * near a reference has to be before a peak is called an element — whichever
 * spectra are open.
 *
 * The guards that keep a bucket within what the viewer can show live here too,
 * beside the bounds they enforce, because a state is built in three places — a
 * viewer opening, a gesture, a file read back — and a bound checked in only one
 * of them is a bound a file walks straight past.
 *
 * Nothing here touches React or the DOM: the chart turns a gesture into an
 * action, the reducer turns an action into a new state, and each half is
 * testable without the other.
 */

import type { XpsPanelId, XpsSidePanelId } from './xpsSidePanels.ts';
import type { XpsDomain, XpsSpectrum } from './xpsSpectrum.ts';

/**
 * The spectra that are open: what a saved file holds.
 *
 * A list rather than a map, because the order is the order they were loaded in
 * and that is the order the list and the legend read. Every action addresses a
 * spectrum by its `id` and never by its place in this array: a position means
 * something different the moment a file is dropped or a spectrum is closed, so
 * an index-based action repaints the wrong trace as soon as two are open.
 */
export interface XpsData {
  /** The spectra, in the order they were loaded. */
  spectra: XpsSpectrum[];
}

/** Which of the two axes the chart is drawn against. */
export type EnergyAxis = 'binding' | 'kinetic';

/**
 * Where you are in the viewer: the temporary preferences of the session.
 *
 * `error` belongs to the run rather than to the view — it is why the last
 * gesture was refused, and it is gone as soon as one succeeds — so it is left
 * out of anything written to a file.
 */
export interface XpsView {
  /** Identity of the spectrum the panels act on, `null` for none. */
  selectedId: string | null;
  /**
   * The window the chart is showing, `null` to let it fit what is drawn.
   *
   * `null` is not "no window": it is the window being the chart's to work out,
   * which is what makes a spectrum loaded into a fresh viewer visible without
   * anybody having asked for a zoom. A number is only stored here once a
   * gesture has set one, and `resetDomain` puts the answer back in the chart's
   * hands.
   */
  domain: XpsDomain | null;
  /** The side panels that are open, in the order their icons are stacked. */
  openPanelIds: XpsPanelId[];
  /** Why the last action was refused, `null` as soon as one succeeds. */
  error: string | null;
}

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
}

/** Everything the viewer knows. */
export interface XpsState {
  /** The spectra that are open. */
  data: XpsData;
  /** Where you are in the viewer. */
  view: XpsView;
  /** How spectra are drawn. */
  settings: XpsSettings;
}

/**
 * A state as a file carries it: every bucket optional, and every setting within
 * them, because a file is written by a viewer that may not be this one.
 */
export interface PartialXpsState {
  /** The spectra that were open. */
  data?: XpsData;
  /** Where the viewer was left. */
  view?: Partial<XpsView>;
  /** The workspace they were drawn in. */
  settings?: Partial<XpsSettings>;
}

/** The panel the splitter brings back when it is dragged open on nothing. */
export const DEFAULT_SIDE_PANEL: XpsSidePanelId = 'spectra';

/**
 * The panels a fresh viewer opens on.
 *
 * The spectra and their peaks together, because those are the two halves of the
 * one question a viewer is opened to answer — what is loaded, and what is in
 * it.
 */
export const DEFAULT_SIDE_PANELS: XpsSidePanelId[] = ['spectra', 'peaks'];

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
  };
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
    current.normalise === next.normalise
  );
}

/**
 * Whether a window is one the chart can show.
 *
 * Both axes are checked, and both bounds of each. A window running backwards,
 * or carrying the `NaN` an empty spectrum's extent computes to, draws an empty
 * chart rather than raising anything, so it is caught on the way in rather than
 * puzzled over from the far end.
 * @param domain - The window asked for.
 * @returns Whether both axes run from a finite lower bound to a higher one.
 */
export function isXpsWindow(domain: XpsDomain): boolean {
  return isWindow(domain.x) && isWindow(domain.y);
}

/**
 * Whether a pair of bounds runs from a lower one to a higher one.
 * @param bounds - The lower and the upper bound.
 * @returns Whether both are finite and the first is below the second.
 */
function isWindow(bounds: [number, number]): boolean {
  const [from, to] = bounds;
  return Number.isFinite(from) && Number.isFinite(to) && from < to;
}
