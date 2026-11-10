/**
 * A viewer driven the way a component drives it, without a React tree.
 *
 * The reducer and the actions are plain data and a dispatch, so everything the
 * state does can be tested without mounting anything — which is the point of
 * keeping React out of this half in the first place.
 */

import type { XpsAction } from '../xpsAction.ts';
import type { XpsEditorActions } from '../xpsActions.ts';
import { createXpsActions } from '../xpsActions.ts';
import { createXpsState, xpsReducer } from '../xpsReducer.ts';
import type { XpsSpectrum } from '../xpsSpectrum.ts';
import type { XpsState } from '../xpsState.ts';

/** A viewer whose dispatch runs the reducer in place. */
export interface OpenViewer {
  /** The state as it stands after every action fired so far. */
  state: XpsState;
  /** Everything to do. */
  actions: XpsEditorActions;
}

/**
 * Open a viewer on some spectra.
 * @param spectra - The spectra it opens on.
 * @returns The viewer, its `state` replaced by every action fired.
 */
export function openViewer(spectra: XpsSpectrum[]): OpenViewer {
  const viewer: OpenViewer = {
    state: createXpsState({ spectra }),
    actions: createXpsActions((action) => {
      viewer.state = xpsReducer(viewer.state, action);
    }),
  };
  return viewer;
}

/**
 * Run several actions in a row.
 * @param state - The state to start from.
 * @param actions - What to do, in order.
 * @returns The state afterwards.
 */
export function apply(state: XpsState, ...actions: XpsAction[]): XpsState {
  let next = state;
  for (const action of actions) {
    next = xpsReducer(next, action);
  }
  return next;
}

/**
 * A three-point C 1s scan, enough for the reducer to have something to move.
 * @param id - Its identity.
 * @param name - What the list calls it.
 * @param color - The colour it is drawn in.
 * @returns The spectrum.
 */
export function testSpectrum(
  id: string,
  name: string,
  color: string,
): XpsSpectrum {
  return {
    id,
    name,
    color,
    energy: {
      x: Float64Array.from([282, 284.8, 288.5]),
      y: Float64Array.from([1200, 18400, 4300]),
    },
    // Kinetic energy is the source energy less the binding energy, which turns
    // the order round, so the same three points are written the other way up.
    kinetic: {
      x: Float64Array.from([1198.1, 1201.8, 1204.6]),
      y: Float64Array.from([4300, 18400, 1200]),
    },
    sourceEnergy: 1486.6,
    transition: {
      name: 'C 1s',
      element: 'C',
      shell: 1,
      angularMomentum: 's',
      augerElement: null,
      augerTransition: null,
    },
    peaks: [
      { id: `${id}-1`, bindingEnergy: 284.8, intensity: 18400, width: 1.2 },
    ],
    components: [],
    regions: [],
    meta: null,
    origin: { format: 'vamas', fileName: 'sample.vms', blockIndex: 0 },
    visible: true,
  };
}

/**
 * The identities of the spectra that are open, in order.
 * @param state - The state to read.
 * @returns One identity per open spectrum.
 */
export function identities(state: XpsState): string[] {
  return state.data.spectra.map((held) => held.id);
}

/**
 * Which of the spectra are drawn, in order.
 * @param state - The state to read.
 * @returns One flag per open spectrum.
 */
export function drawn(state: XpsState): boolean[] {
  return state.data.spectra.map((held) => held.visible);
}
