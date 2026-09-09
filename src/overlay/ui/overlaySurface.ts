/**
 * What the floating chrome over one figure agrees on.
 *
 * Two cards over the same scatter that disagree about how tightly to pack
 * their controls, or about whether the figure is repainting, read as two
 * pieces of software sitting on one picture. So the measurements are settled
 * once by the layer, and every card reads them back from here rather than
 * deciding for itself.
 */

import { createContext, useContext, useSyncExternalStore } from 'react';

import type {
  OverlayMetrics,
  OverlayPointerKind,
} from '../core/overlayMetrics.ts';
import { overlayMetrics } from '../core/overlayMetrics.ts';

/** What every control inside an {@link OverlayLayer} reads from it. */
export interface OverlaySurface {
  /** The measurements every card and control is drawn from. */
  metrics: OverlayMetrics;
  /** Whether the cards are at full strength rather than resting. */
  awake: boolean;
  /**
   * Whether the figure is repainting. While it is, a card drops its backdrop
   * blur for a flat fill, because a blur is recomputed every time the pixels
   * behind it change — which during a lasso drag is every frame.
   */
  busy: boolean;
  /** Width of the figure, in pixels; `0` before it has been measured. */
  width: number;
  /** What the reader is pointing with. */
  pointer: OverlayPointerKind;
}

/**
 * The surface a floating control is sitting on.
 *
 * A control rendered with no {@link OverlayLayer} above it gets a comfortable,
 * awake, unmeasured surface, so every component in this domain is usable on
 * its own and renders correctly to a string.
 * @returns The surface.
 */
export function useOverlaySurface(): OverlaySurface {
  return useContext(OverlaySurfaceContext);
}

/**
 * Whether the pointer on this page is a finger.
 *
 * Returns `false` where `matchMedia` is missing, which is what keeps the
 * string-rendering tests working — the same guard `useResizeObserver` applies
 * to a missing `ResizeObserver`.
 * @returns Whether the pointer is coarse.
 */
export function useCoarsePointer(): boolean {
  return useSyncExternalStore(
    subscribeToPointerKind,
    readPointerKind,
    readFinePointer,
  );
}

/**
 * What a control gets when there is no layer above it.
 *
 * Awake rather than resting: a card with nobody watching the pointer on its
 * behalf would otherwise sit at three-quarters strength for ever, with no way
 * for the reader to bring it up.
 */
const UNWRAPPED_SURFACE: OverlaySurface = {
  metrics: overlayMetrics('comfortable', 'fine'),
  awake: true,
  busy: false,
  width: 0,
  pointer: 'fine',
};

/**
 * The surface an {@link OverlayLayer} hands down to the cards inside it.
 *
 * Published for the layer alone. A control reaches it through
 * {@link useOverlaySurface}, which is what leaves it with real measurements
 * when nobody wrapped it in a layer at all.
 */
export const OverlaySurfaceContext =
  createContext<OverlaySurface>(UNWRAPPED_SURFACE);

function subscribeToPointerKind(onChange: () => void): () => void {
  if (typeof globalThis.matchMedia !== 'function') return doNothing;
  const query = globalThis.matchMedia(COARSE_POINTER_QUERY);
  query.addEventListener('change', onChange);
  return () => {
    query.removeEventListener('change', onChange);
  };
}

function readPointerKind(): boolean {
  if (typeof globalThis.matchMedia !== 'function') return false;
  return globalThis.matchMedia(COARSE_POINTER_QUERY).matches;
}

/**
 * What a server render is told the pointer is.
 *
 * Nothing can be asked about the pointer while the markup is being written,
 * and guessing a finger would hand the largest controls to every reader whose
 * first paint comes from the server.
 * @returns Always `false`.
 */
function readFinePointer(): boolean {
  return false;
}

function doNothing(): void {
  // Nothing was subscribed to, so there is nothing to unsubscribe from.
}

const COARSE_POINTER_QUERY = '(pointer: coarse)';
