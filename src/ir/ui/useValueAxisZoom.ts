/**
 * The zoom in and zoom out commands, which scale the value axis alone.
 *
 * They scale it about the baseline the mode hangs from — 100 for percent
 * transmittance, zero for absorbance and intensity — so a weak band comes up
 * out of its baseline rather than the whole trace drifting off the plot.
 */

import { useMemo } from 'react';

import { fullDomain } from '../core/irDomain.ts';
import { yAxisRules } from '../core/irMode.ts';

import { useIrActions, useIrEditorState } from './irStateContext.ts';

/** The two commands, ready to hand to a button or a key. */
export interface ValueAxisZoom {
  /** Bring the bands up by one step. */
  zoomIn: () => void;
  /** Put the axis back out by one step. */
  zoomOut: () => void;
}

/**
 * Zoom the value axis of the viewer this is called inside.
 * @returns The two commands.
 */
export function useValueAxisZoom(): ValueAxisZoom {
  const { state, visibleSpectra } = useIrEditorState();
  const actions = useIrActions();
  const { domain } = state.view;
  const { mode } = state.settings;

  return useMemo(() => {
    /**
     * Scale the value axis by a factor, about the baseline the mode hangs from.
     * @param factor - Above one to zoom out.
     */
    function scale(factor: number): void {
      const shown = domain ?? fullDomain(visibleSpectra, mode);
      // Asked of the mode rather than written out again here: the baseline a
      // value axis is scaled about is `irMode`'s to know, and a second copy of
      // it is a second thing to get wrong.
      const { baseline = 0 } = yAxisRules(mode);
      actions.setDomain({
        x: shown.x,
        y: [
          baseline + (shown.y[0] - baseline) * factor,
          baseline + (shown.y[1] - baseline) * factor,
        ],
      });
    }
    return {
      zoomIn: () => scale(1 / ZOOM_STEP),
      zoomOut: () => scale(ZOOM_STEP),
    };
  }, [actions, domain, visibleSpectra, mode]);
}

/**
 * What one press of zoom in or out is worth.
 *
 * A fifth, which is about what one notch of a mouse wheel does — so the button
 * and the wheel feel like the same gesture at two speeds rather than two
 * different ones.
 */
const ZOOM_STEP = 1.2;
