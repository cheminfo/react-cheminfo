/**
 * What the molstar canvas of one atomic orbital is told.
 */

import type { AtomicOrbitalViewerProps } from './AtomicOrbitalViewer.tsx';

/** Props of `AtomicOrbitalCanvas`: the viewer's, less what surrounds the canvas. */
export interface AtomicOrbitalCanvasProps extends Omit<
  AtomicOrbitalViewerProps,
  'fallback' | 'renderUnsupported' | 'className'
> {
  /**
   * Called with the reason when an orbital cannot be drawn, and with `null`
   * once one has been drawn again.
   * @default undefined
   */
  onFailureChange?: (message: string | null) => void;
}
