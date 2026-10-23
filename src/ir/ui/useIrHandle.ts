/**
 * The handle a host drives the viewer through, filled in from its state.
 *
 * A hook of its own beside the shell, because every gesture on the handle reads
 * the state the shell already reads — and the shell is long enough without it.
 */

import type { Ref } from 'react';
import { useImperativeHandle } from 'react';

import { fullDomain } from '../core/irDomain.ts';
import type { IrEditorHandle, ZoomToBandOptions } from '../core/irEditorApi.ts';
import type { IrDomain } from '../core/irSpectrum.ts';

import { useIrActions, useIrEditorState } from './irStateContext.ts';

/**
 * Fill in a host's handle on the viewer this is called inside.
 * @param handle - The handle to fill in, if the host asked for one.
 */
export function useIrHandle(handle: Ref<IrEditorHandle> | undefined): void {
  const { state, visibleSpectra } = useIrEditorState();
  const actions = useIrActions();
  const { domain } = state.view;
  const { mode } = state.settings;

  useImperativeHandle(
    handle,
    (): IrEditorHandle => ({
      getSpectra: () => state.data.spectra,
      setSpectra: (spectra) => actions.setSpectra(spectra),
      addSpectra: (spectra) => actions.addSpectra(spectra),
      clear: () => actions.clear(),
      setDomain: (next) => actions.setDomain(next),
      resetDomain: () => actions.resetDomain(),
      zoomToWavenumber: (wavenumber, options: ZoomToBandOptions = {}) => {
        const { width = DEFAULT_FRAME_WIDTH } = options;
        const shown: IrDomain = domain ?? fullDomain(visibleSpectra, mode);
        actions.setDomain({
          x: [wavenumber - width / 2, wavenumber + width / 2],
          y: shown.y,
        });
      },
      selectSpectrum: (id) => actions.selectSpectrum(id),
    }),
    [state.data.spectra, actions, domain, visibleSpectra, mode],
  );
}

/** How wide a window a host gets when it asks to frame a band without saying. */
const DEFAULT_FRAME_WIDTH = 200;
