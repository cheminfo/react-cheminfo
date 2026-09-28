import { useCallback, useRef } from 'react';

import { drawingIn } from '../core/stackedDrawing.ts';

/** The box a picture is taken out of. */
export interface DrawingBox {
  /** Put on the box the drawing sits in, so it can be found again. */
  attach: (element: HTMLElement | null) => void;
  /**
   * The drawing a picture is taken of, `null` when the box holds none — which
   * is what an editor showing nothing yet, or one whose box has not been
   * mounted, hands the export dialog.
   */
  getDrawing: () => SVGSVGElement | null;
}

/**
 * Find the drawing a picture is to be taken of, when it is asked for.
 *
 * A drawing is laid out again on every resize, so the element itself is never
 * held onto: what is kept is the box it sits in, and the drawing is read out of
 * it at the moment a button is pressed. What counts as the drawing in there —
 * the one element for an editor showing one, the panes composed for an editor
 * showing a stack of charts — is `drawingIn`.
 * @returns The box to attach, and the drawing inside it.
 */
export function useDrawingBox(): DrawingBox {
  const box = useRef<HTMLElement | null>(null);

  const attach = useCallback((element: HTMLElement | null) => {
    box.current = element;
  }, []);

  const getDrawing = useCallback(() => drawingIn(box.current), []);

  return { attach, getDrawing };
}
