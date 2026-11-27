/**
 * The zoom in and zoom out commands, which scale the value axis alone.
 *
 * They scale it about the baseline the mode hangs from — 100 for percent
 * transmittance, zero for absorbance and intensity — so a weak band comes up
 * out of its baseline rather than the whole trace drifting off the plot.
 */

import { useCallback } from 'react';

import type { ValueZoom } from '../../chart/ui/useValueZoom.ts';
import { useValueZoom } from '../../chart/ui/useValueZoom.ts';
import { fullDomain } from '../core/irDomain.ts';
import { yAxisRules } from '../core/irMode.ts';

import { useIrActions, useIrEditorState } from './irStateContext.ts';

/** The two commands, ready to hand to a button or a key. */
export type ValueAxisZoom = ValueZoom;

/**
 * Zoom the value axis of the viewer this is called inside.
 * @returns The two commands.
 */
export function useValueAxisZoom(): ValueAxisZoom {
  const { state, visibleSpectra } = useIrEditorState();
  const actions = useIrActions();
  const { mode } = state.settings;
  const fitted = useCallback(
    () => fullDomain(visibleSpectra, mode),
    [visibleSpectra, mode],
  );
  // Asked of the mode rather than written out again here: the baseline a value
  // axis is scaled about is `irMode`'s to know.
  const { baseline = 0 } = yAxisRules(mode);
  return useValueZoom({
    domain: state.view.domain,
    fitted,
    baseline,
    setDomain: actions.setDomain,
  });
}
