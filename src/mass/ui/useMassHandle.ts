/**
 * The handle a host drives the viewer through, filled in from its state.
 *
 * A hook of its own beside the shell, because every gesture on the handle reads
 * the state the shell already reads — and the shell is long enough without it.
 */

import type { Ref } from 'react';
import { useImperativeHandle } from 'react';

import { mzFrame } from '../core/massDomain.ts';
import type {
  MassEditorHandle,
  ZoomToMzOptions,
} from '../core/massEditorApi.ts';

import { useMassActions, useMassEditorState } from './massStateContext.ts';

/**
 * Fill in a host's handle on the viewer this is called inside.
 * @param handle - The handle to fill in, if the host asked for one.
 * @param readFiles - How a file is read into the viewer, as a drop reads it.
 */
export function useMassHandle(
  handle: Ref<MassEditorHandle> | undefined,
  readFiles: (files: readonly File[]) => Promise<void>,
): void {
  const { state, visibleSpectra } = useMassEditorState();
  const actions = useMassActions();
  const { domain } = state.view;

  useImperativeHandle(
    handle,
    (): MassEditorHandle => ({
      getSpectra: () => state.data.spectra,
      setSpectra: (spectra) => actions.setSpectra(spectra),
      addSpectra: (spectra) => actions.addSpectra(spectra),
      openFiles: (files) => readFiles(files),
      clear: () => actions.clear(),
      setDomain: (next) => actions.setDomain(next),
      resetDomain: () => actions.resetDomain(),
      zoomToMz: (mz, options: ZoomToMzOptions = {}) => {
        actions.setDomain(
          mzFrame(
            mz,
            visibleSpectra,
            domain,
            options.halfWidth === undefined
              ? {}
              : { halfWidth: options.halfWidth },
          ),
        );
      },
      selectSpectrum: (id) => actions.selectSpectrum(id),
    }),
    [state.data.spectra, actions, readFiles, domain, visibleSpectra],
  );
}
