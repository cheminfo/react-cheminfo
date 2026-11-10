/**
 * The viewer as its host holds it: one object, filled in once, that never
 * changes identity.
 *
 * Everything it reads is mirrored after each render rather than closed over, so
 * a host may keep the handle in an effect's dependency list without that effect
 * re-running on every zoom — and so that a gesture made through it acts on the
 * spectra that are open now rather than on the ones that were open when the
 * viewer mounted.
 */

import type { Ref } from 'react';
import { useImperativeHandle, useLayoutEffect, useRef } from 'react';

import {
  axisEnergy,
  chartEnergyAxis,
  chartSourceEnergy,
} from '../core/energyAxis.ts';
import { fullDomain } from '../core/xpsDomain.ts';
import type { XpsEditorHandle } from '../core/xpsEditorApi.ts';
import { ENERGY_WINDOW } from '../core/xpsEditorApi.ts';

import { useXpsActions, useXpsEditorState } from './xpsStateContext.ts';

/**
 * Fill in the handle a host drives the viewer through.
 * @param handle - Where to put it, `undefined` when the host asked for none.
 */
export function useXpsEditorHandle(handle: Ref<XpsEditorHandle> | undefined) {
  const { state } = useXpsEditorState();
  const actions = useXpsActions();

  const live = useRef(state);
  useLayoutEffect(() => {
    live.current = state;
  });

  useImperativeHandle(
    handle,
    () => ({
      addSpectra: actions.addSpectra,
      setSpectra(spectra) {
        // Two gestures rather than a state read back from a file: opening a
        // state puts every setting to its default, and this replaces the
        // document alone. React commits both in one render.
        actions.clear();
        actions.addSpectra(spectra);
      },
      clear: actions.clear,
      zoomToEnergy(bindingEnergy, options) {
        const current = live.current;
        const half = options?.halfWidth ?? ENERGY_WINDOW;
        const { spectra } = current.data;
        // The window is in the units of the axis on screen, which is not always
        // the one the settings asked for: a spectrum whose file states no
        // photon energy is drawn on the kinetic axis whatever they say.
        const axis = chartEnergyAxis(spectra, current.settings);
        const centre = axisEnergy(
          bindingEnergy,
          chartSourceEnergy(spectra),
          axis,
        );
        // The counts come from the window the chart is showing, so framing a
        // line moves along the axis without rescaling every peak on the way.
        const shown =
          current.view.domain ?? fullDomain(spectra, current.settings);
        if (shown === null) return;
        actions.setDomain({ x: [centre - half, centre + half], y: shown.y });
      },
      getState: () => live.current,
    }),
    [actions],
  );
}
