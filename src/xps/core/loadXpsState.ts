/**
 * Opening a state that was written out, which may not have been written by this
 * viewer.
 *
 * Everything a file leaves out comes back as the viewer's default rather than
 * as whatever stood before it was opened: this is opening a document, not
 * merging one, and a file that carried no workspace would otherwise be read in
 * the workspace of the file before it and look different every time.
 *
 * Nothing the file says is taken at its word. The view is the part that cannot
 * be: it names a spectrum by identity, and a file written before that spectrum
 * was closed leaves the viewer selecting something nobody is holding. The
 * window may run backwards or carry the `NaN` an empty spectrum's extent
 * computes to, the panels may be ones this viewer does not offer, and the
 * settings may come from a viewer that allowed a thousand labels or a tolerance
 * of zero. Each of them is brought within what can be shown on the way in,
 * because a file is nobody's gesture to be told off for.
 */

import { indexOfXpsSpectrum } from './changeXpsSpectrum.ts';
import type { XpsPanelId } from './xpsSidePanels.ts';
import { xpsSidePanels } from './xpsSidePanels.ts';
import type { XpsDomain, XpsSpectrum } from './xpsSpectrum.ts';
import type { PartialXpsState, XpsState } from './xpsState.ts';
import {
  DEFAULT_SETTINGS,
  DEFAULT_SIDE_PANELS,
  isXpsWindow,
  mergeXpsSettings,
} from './xpsState.ts';

/**
 * The state a file describes, folded onto the viewer's defaults.
 * @param loaded - What the file held; every bucket of it optional.
 * @returns The state to show it in, each part of it within bounds.
 */
export function loadXpsState(loaded: PartialXpsState): XpsState {
  const { data = { spectra: [] }, view, settings } = loaded;
  const { spectra } = data;
  return {
    data,
    view: {
      selectedId: heldOrFirst(spectra, view?.selectedId ?? null),
      domain: showableWindow(view?.domain),
      openPanelIds: offeredPanels(view?.openPanelIds),
      error: null,
    },
    settings: mergeXpsSettings(DEFAULT_SETTINGS, settings),
  };
}

/**
 * The spectrum the panels act on, once it is known to be one the file carried.
 *
 * A file naming a spectrum it did not carry falls to the first one it did
 * rather than to nothing: a document is opened in order to be looked at, and
 * every panel is empty until something is selected.
 * @param spectra - The spectra the file carried.
 * @param id - The identity it pointed at, `null` when it named none.
 * @returns That identity, the first spectrum's, or `null` when it carried none.
 */
function heldOrFirst(
  spectra: readonly XpsSpectrum[],
  id: string | null,
): string | null {
  if (id !== null && indexOfXpsSpectrum(spectra, id) !== -1) return id;
  return spectra[0]?.id ?? null;
}

/**
 * The window the file left the chart on, once it is known to be one.
 * @param domain - The window the file carried, `null` or absent for none.
 * @returns The window, or `null` for the chart to work one out for itself.
 */
function showableWindow(
  domain: XpsDomain | null | undefined,
): XpsDomain | null {
  if (!domain || !isXpsWindow(domain)) return null;
  return domain;
}

/**
 * The panels the file left open, keeping only the ones this viewer offers.
 *
 * A panel identity this viewer does not know draws nothing and has no icon to
 * close it with, so it would sit in the stack for the rest of the session.
 * @param panelIds - The panels the file carried, absent when it named none.
 * @returns The panels to open, defaulted when the file named none.
 */
function offeredPanels(
  panelIds: readonly XpsPanelId[] | undefined,
): XpsPanelId[] {
  if (panelIds === undefined) return [...DEFAULT_SIDE_PANELS];
  const open: XpsPanelId[] = [];
  for (const panelId of panelIds) {
    if (open.includes(panelId)) continue;
    for (const panel of xpsSidePanels) {
      if (panel.id === panelId) {
        open.push(panelId);
        break;
      }
    }
  }
  return open;
}
