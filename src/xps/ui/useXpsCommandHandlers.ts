/**
 * What each command actually does, in one place rather than one per button.
 *
 * The rail, the header and the keyboard all ask for the same ten things, and
 * the arithmetic behind them — what a press of the zoom is worth, which window
 * it is measured from — belongs to the viewer rather than to whichever toolbar
 * happens to offer it today.
 */

import { useFullscreen } from 'react-science/ui';

import { fullDomain } from '../core/xpsDomain.ts';

import type { XpsCommandHandlers } from './xpsCommandContext.tsx';
import { useXpsActions, useXpsEditorState } from './xpsStateContext.ts';

export interface UseXpsCommandHandlersOptions {
  /** Called when the mark in the header is asked about. */
  onAbout: () => void;
  /** Called when the help in the header, or the key that does the same, asks. */
  onDocumentation: () => void;
  /**
   * What the figure command opens and closes.
   * @default undefined — the command has no handler, and its key stays with the page
   */
  onExportImage?: () => void;
}

/**
 * Bind every command to what the viewer does about it.
 * @param options - What the shell, rather than the state, answers for.
 * @returns One handler per command, rebuilt on every render.
 */
export function useXpsCommandHandlers(
  options: UseXpsCommandHandlersOptions,
): XpsCommandHandlers {
  const { onAbout, onDocumentation, onExportImage } = options;
  const { state } = useXpsEditorState();
  const actions = useXpsActions();
  const { toggle: toggleFullScreen } = useFullscreen();
  const { spectra } = state.data;
  const { settings } = state;

  /**
   * Stretch the counts axis about its baseline, from whatever is on screen now.
   * @param factor - Above one to bring the weak lines up.
   */
  function zoom(factor: number): void {
    // The window the chart is showing may be the one it worked out for itself,
    // which is the case a first press of the button lands in — and only the
    // chart's own fit knows what that is.
    actions.zoomY(factor, fullDomain(spectra, settings) ?? undefined);
  }

  return {
    about: onAbout,
    documentation: onDocumentation,
    fullScreen: toggleFullScreen,
    zoomIn: () => zoom(COUNTS_ZOOM_STEP),
    zoomOut: () => zoom(1 / COUNTS_ZOOM_STEP),
    resetZoom: actions.resetDomain,
    toggleAxis: () =>
      actions.setSettings({
        energyAxis: settings.energyAxis === 'binding' ? 'kinetic' : 'binding',
      }),
    toggleNormalise: () =>
      actions.setSettings({ normalise: !settings.normalise }),
    showRegions: () =>
      actions.setSettings({ showRegions: !settings.showRegions }),
    showComponents: () =>
      actions.setSettings({ showComponents: !settings.showComponents }),
    showLabels: () => actions.setSettings({ showLabels: !settings.showLabels }),
    exportImage: onExportImage,
    clear: actions.clear,
  };
}

/**
 * What one press of a zoom button is worth.
 *
 * A quarter, which is about a notch of a mouse wheel: small enough that a press
 * made by mistake is undone by the other button, large enough that four presses
 * take a satellite at one percent of the main line up to a readable height.
 */
const COUNTS_ZOOM_STEP = 1.25;
