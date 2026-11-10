/**
 * The viewer's state, as a reducer over plain data.
 *
 * Document edits are delegated to `applyXpsDataAction`; what is left here moves
 * the window, the selection or the workspace. Nothing throws: an action naming
 * a spectrum nobody is holding becomes `view.error`, so a stale panel cannot
 * take the chart down with it.
 */

import { applyXpsDataAction } from './applyXpsDataAction.ts';
import { indexOfXpsSpectrum, refuseXpsAction } from './changeXpsSpectrum.ts';
import { loadXpsState } from './loadXpsState.ts';
import type { XpsAction } from './xpsAction.ts';
import type { XpsPanelId } from './xpsSidePanels.ts';
import type { XpsDomain, XpsSpectrum } from './xpsSpectrum.ts';
import type { XpsSettings, XpsState, XpsView } from './xpsState.ts';
import {
  DEFAULT_SETTINGS,
  DEFAULT_SIDE_PANELS,
  isUsableTolerance,
  isXpsWindow,
  mergeXpsSettings,
  sameXpsSettings,
} from './xpsState.ts';

/** What a viewer opens on. */
export interface CreateXpsStateOptions {
  /**
   * The spectra to open on. The first of them is selected, so a viewer handed
   * a file is already looking at it.
   * @default []
   */
  spectra?: XpsSpectrum[];
  /**
   * The workspace it opens with, each setting left out being the default.
   * @default DEFAULT_SETTINGS
   */
  settings?: Partial<XpsSettings>;
  /**
   * The side panels that are open to begin with.
   * @default DEFAULT_SIDE_PANELS
   */
  panelIds?: readonly XpsPanelId[];
}

/**
 * The state a viewer starts in.
 * @param options - What it opens on.
 * @returns The state, its window the chart's to work out whatever it opened on.
 */
export function createXpsState(options: CreateXpsStateOptions = {}): XpsState {
  const { spectra = [], settings, panelIds = DEFAULT_SIDE_PANELS } = options;
  const state: XpsState = {
    data: { spectra: [] },
    view: {
      selectedId: null,
      domain: null,
      // Copied, so a caller keeping its own array of panels and pushing to it
      // later does not reach into a state nothing has dispatched against.
      openPanelIds: [...panelIds],
      error: null,
    },
    settings: mergeXpsSettings(DEFAULT_SETTINGS, settings),
  };
  if (spectra.length === 0) return state;
  return xpsReducer(state, { type: 'addSpectra', spectra });
}

/**
 * The state the viewer is in once an action has been applied.
 *
 * An action that has nothing to do — selecting what is already selected,
 * resetting a window that is already the chart's, renaming a spectrum to the
 * name it already has — hands the state back untouched, so a render is only
 * ever asked for on a real change.
 * @param state - The state to change.
 * @param action - What to do.
 * @returns The new state.
 */
export function xpsReducer(state: XpsState, action: XpsAction): XpsState {
  switch (action.type) {
    case 'selectSpectrum': {
      if (
        action.id !== null &&
        indexOfXpsSpectrum(state.data.spectra, action.id) === -1
      ) {
        return refuseXpsAction(
          state,
          `No open spectrum has the identity ${action.id}, so nothing was selected`,
        );
      }
      if (state.view.selectedId === action.id && state.view.error === null) {
        return state;
      }
      return changeView(state, { selectedId: action.id });
    }

    case 'setDomain':
      return showWindow(state, action.domain);

    case 'resetDomain':
      if (state.view.domain === null && state.view.error === null) return state;
      return changeView(state, { domain: null });

    case 'zoomY': {
      const { factor } = action;
      if (!Number.isFinite(factor) || factor <= 0) {
        return refuseXpsAction(
          state,
          `The counts axis cannot be stretched by a factor of ${factor}`,
        );
      }
      const shown = state.view.domain ?? action.from;
      if (shown === undefined) {
        return refuseXpsAction(
          state,
          'The chart is still fitting what is drawn, so there was no counts window to stretch',
        );
      }
      const [floor, ceiling] = shown.y;
      return showWindow(state, {
        x: [shown.x[0], shown.x[1]],
        y: [floor, floor + (ceiling - floor) / factor],
      });
    }

    case 'togglePanel': {
      const open = state.view.openPanelIds;
      const openPanelIds = open.includes(action.panelId)
        ? open.filter((panelId) => panelId !== action.panelId)
        : [...open, action.panelId];
      return changeView(state, { openPanelIds });
    }

    case 'setError':
      if (state.view.error === action.error) return state;
      return { ...state, view: { ...state.view, error: action.error } };

    case 'setSettings':
      return changeSettings(state, action.settings);

    case 'loadState':
      return loadXpsState(action.state);

    case 'addSpectra':
    case 'removeSpectrum':
    case 'renameSpectrum':
    case 'setSpectrumColor':
    case 'setSpectrumVisibility':
    case 'showOnly':
    case 'showEvery':
    case 'setSpectrumPeaks':
    case 'clear':
      return applyXpsDataAction(state, action);

    // no default
  }
}

/**
 * Show a window of the chart, refusing one it could not draw.
 *
 * Both gestures that set one come through here — a drag across the chart and a
 * stretch of the counts axis — so a zoom cannot store the window a drag would
 * be refused for. A window that runs backwards, or carries a `NaN`, draws an
 * empty chart rather than raising anything, which is a failure that shows up
 * three components away from what caused it.
 * @param state - The state to change.
 * @param domain - The window asked for.
 * @returns The new state, the same object when the chart already shows it.
 */
function showWindow(state: XpsState, domain: XpsDomain): XpsState {
  if (!isXpsWindow(domain)) {
    return refuseXpsAction(
      state,
      'A window runs from a lower bound to a higher one, so the chart kept the one it was showing',
    );
  }
  if (sameDomain(state.view.domain, domain) && state.view.error === null) {
    return state;
  }
  return changeView(state, { domain });
}

/**
 * Change what is looked at, clearing the reason the last action was refused.
 * @param state - The state to change.
 * @param view - The part of the view that changes.
 * @returns The new state.
 */
function changeView(state: XpsState, view: Partial<XpsView>): XpsState {
  return { ...state, view: { ...state.view, ...view, error: null } };
}

/**
 * Change the workspace, refusing a tolerance no peak could fall in.
 *
 * Widening the window an element is looked up in is a preference; closing it to
 * nothing is a lookup that answers nothing from then on while looking exactly
 * like one that found nothing, and only this sentence would say why.
 * @param state - The state to change.
 * @param change - The settings that change.
 * @returns The new state, the same object when it says nothing new.
 */
function changeSettings(
  state: XpsState,
  change: Partial<XpsSettings>,
): XpsState {
  const { referenceTolerance } = change;
  if (
    referenceTolerance !== undefined &&
    !isUsableTolerance(referenceTolerance)
  ) {
    return refuseXpsAction(
      state,
      `A tolerance of ${referenceTolerance} eV is not a window a peak can fall in`,
    );
  }
  const settings = mergeXpsSettings(state.settings, change);
  if (sameXpsSettings(state.settings, settings) && state.view.error === null) {
    return state;
  }
  return { ...state, settings, view: { ...state.view, error: null } };
}

/**
 * Whether the chart is already showing a window.
 * @param current - The window it is showing, `null` while it fits what is drawn.
 * @param next - The window asked for.
 * @returns Whether all four bounds already agree.
 */
function sameDomain(current: XpsDomain | null, next: XpsDomain): boolean {
  if (current === null) return false;
  return (
    current.x[0] === next.x[0] &&
    current.x[1] === next.x[1] &&
    current.y[0] === next.y[0] &&
    current.y[1] === next.y[1]
  );
}
