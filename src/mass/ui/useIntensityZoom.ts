/**
 * The zoom in and zoom out commands, which scale the intensity axis alone.
 *
 * They scale it about zero, the baseline every stick stands on, so a small peak
 * comes up out of the baseline rather than the whole spectrum drifting off the
 * plot — what a turn of the wheel does, at the speed of a key press.
 */

import { useCallback } from 'react';

import type { ValueZoom } from '../../chart/ui/useValueZoom.ts';
import { useValueZoom } from '../../chart/ui/useValueZoom.ts';
import { fullDomain } from '../core/massDomain.ts';

import { useMassActions, useMassEditorState } from './massStateContext.ts';

/** The two commands, ready to hand to a button or a key. */
export type IntensityZoom = ValueZoom;

/**
 * Zoom the intensity axis of the viewer this is called inside.
 * @returns The two commands.
 */
export function useIntensityZoom(): IntensityZoom {
  const { state, visibleSpectra } = useMassEditorState();
  const actions = useMassActions();
  const fitted = useCallback(
    () => fullDomain(visibleSpectra),
    [visibleSpectra],
  );
  return useValueZoom({
    domain: state.view.domain,
    fitted,
    setDomain: actions.setDomain,
  });
}
