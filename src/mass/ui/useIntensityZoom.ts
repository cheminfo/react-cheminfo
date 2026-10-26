/**
 * The zoom in and zoom out commands, which scale the intensity axis alone.
 *
 * They scale it about zero, the baseline every stick stands on, so a small peak
 * comes up out of the baseline rather than the whole spectrum drifting off the
 * plot — what a turn of the wheel does, at the speed of a key press.
 */

import { useMemo } from 'react';

import { fullDomain } from '../core/massDomain.ts';

import { useMassActions, useMassEditorState } from './massStateContext.ts';

/** The two commands, ready to hand to a button or a key. */
export interface IntensityZoom {
  /** Bring the peaks up by one step. */
  zoomIn: () => void;
  /** Put the axis back out by one step. */
  zoomOut: () => void;
}

/**
 * Zoom the intensity axis of the viewer this is called inside.
 * @returns The two commands.
 */
export function useIntensityZoom(): IntensityZoom {
  const { state, visibleSpectra } = useMassEditorState();
  const actions = useMassActions();
  const { domain } = state.view;

  return useMemo(() => {
    /**
     * Scale the intensity axis by a factor, about zero.
     * @param factor - Above one to zoom out.
     */
    function scale(factor: number): void {
      const shown = domain ?? fullDomain(visibleSpectra);
      actions.setDomain({
        x: shown.x,
        y: [shown.y[0] * factor, shown.y[1] * factor],
      });
    }
    return {
      zoomIn: () => scale(1 / ZOOM_STEP),
      zoomOut: () => scale(ZOOM_STEP),
    };
  }, [actions, domain, visibleSpectra]);
}

/**
 * What one press of zoom in or out is worth: about what one notch of a mouse
 * wheel does, so the button and the wheel feel like one gesture at two speeds.
 */
const ZOOM_STEP = 1.2;
