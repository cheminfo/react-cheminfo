/**
 * The press that starts a stroke on the structure editor's canvas, which a
 * site's guide makes way for.
 */

import type { PointerEvent as ReactPointerEvent } from 'react';
import { useCallback, useState } from 'react';

import { EDITOR_TOOLBAR_WIDTH } from '../core/editorToolbarGeometry.ts';

/** Whether a stroke is being drawn, and how to hear the press that starts one. */
export interface CanvasPress {
  /** Whether the drawing area is held down, which the guide makes way for. */
  pressed: boolean;
  /** Put on the editor's box, in the capture phase. */
  onPointerDownCapture: (event: ReactPointerEvent<HTMLElement>) => void;
}

/**
 * Hear a press on the drawing area, so the guide goes at the press that starts
 * a stroke rather than once the stroke is reported.
 *
 * A press on the toolbar, on a corner button or on the guide's own buttons is
 * not a stroke. The guide comes back after the release only when the editor
 * has not reported a drawing by then.
 * @returns See {@link CanvasPress}.
 */
export function useCanvasPress(): CanvasPress {
  const [pressed, setPressed] = useState(false);
  const onPointerDownCapture = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (!onDrawingArea(event)) return;
      setPressed(true);
      function release(): void {
        globalThis.removeEventListener('pointerup', release, true);
        globalThis.removeEventListener('pointercancel', release, true);
        // Once the editor has handled the release too: a stroke that drew
        // something is reported by then, and the guide does not flash back.
        setTimeout(() => setPressed(false), 0);
      }
      // Heard on the way down, which no handler of the canvas can stop.
      globalThis.addEventListener('pointerup', release, true);
      globalThis.addEventListener('pointercancel', release, true);
    },
    [],
  );
  return { pressed, onPointerDownCapture };
}

/**
 * Whether a press landed on the drawing area: on the editor's canvas, and to
 * the right of its toolbar. Both live in the editor's shadow root, so the event
 * names the element holding it.
 * @param event - The press, heard on the editor's box.
 * @returns Whether it starts a stroke.
 */
function onDrawingArea(event: ReactPointerEvent<HTMLElement>): boolean {
  const { target, currentTarget, clientX } = event;
  if (!(target instanceof Element) || target.closest(CANVAS) === null) {
    return false;
  }
  return clientX - currentTarget.getBoundingClientRect().left > TOOLBAR_EDGE;
}

/** The element the openchemlib editor is drawn in. */
const CANVAS = '[data-openchemlib-canvas-editor]';

/** The toolbar's right edge, inside the editor's one-pixel border. */
const TOOLBAR_EDGE = EDITOR_TOOLBAR_WIDTH + 1;
