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

import type { XpsSettings } from './xpsSettings.ts';
import type { XpsPanelId, XpsSidePanelId } from './xpsSidePanels.ts';
import type { XpsDomain, XpsSpectrum } from './xpsSpectrum.ts';

// The workspace lives beside the state rather than in it, and is reached from
// here as well, where every reader of the three buckets already looks.
export type { EnergyAxis, XpsSettings } from './xpsSettings.ts';
export {
  DEFAULT_LABEL_LIMIT,
  DEFAULT_SETTINGS,
  MAXIMUM_LABEL_LIMIT,
  MAXIMUM_REFERENCE_TOLERANCE,
  isUsableTolerance,
  mergeXpsSettings,
  sameXpsSettings,
} from './xpsSettings.ts';

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
