import type { RefObject } from 'react';
import { useEffect, useState } from 'react';

import type { EditorToolbarButtonBox } from '../core/editorToolbarGeometry.ts';
import {
  editorToolbarButtonAt,
  editorToolbarButtonBox,
} from '../core/editorToolbarGeometry.ts';

import { watchToolbar } from './watchToolbar.ts';

/** The toolbar button the pointer rests on, or last rested on. */
export interface ToolbarHover {
  /** The button's index in `EDITOR_TOOLBAR_BUTTONS`. */
  button: number;
  /** Where the button is drawn, relative to the container's padding box. */
  box: EditorToolbarButtonBox;
  /**
   * Whether its tooltip is showing. The last button is kept after the pointer
   * leaves, so a closing tooltip fades out with its text rather than empty.
   */
  open: boolean;
}

/**
 * Follow the pointer over the editor's toolbar.
 *
 * The first button waits for the pointer to rest, so crossing the toolbar on
 * the way to the drawing opens nothing; once one is showing, the next follows
 * at once. Pressing a button hides its tooltip until the pointer moves on,
 * since whoever pressed it no longer needs telling. Touch is ignored: a finger
 * has no hover, and a tooltip opened by a tap would cover the canvas.
 * @param containerRef - The element wrapping the editor, positioned so the
 * returned box can be laid over the button.
 * @returns The button under the pointer, or null before any has been hovered.
 */
export function useToolbarHover(
  containerRef: RefObject<HTMLElement | null>,
): ToolbarHover | null {
  const [hover, setHover] = useState<ToolbarHover | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (container === null) return;

    let timer: ReturnType<typeof setTimeout> | undefined;
    let current = -1;
    let pressed = -1;
    let open = false;

    const show = (toolbar: HTMLCanvasElement, button: number): void => {
      open = true;
      setHover({ button, box: boxIn(container, toolbar, button), open });
    };
    const hide = (): void => {
      clearTimeout(timer);
      if (!open) return;
      open = false;
      setHover((previous) =>
        previous === null ? null : { ...previous, open: false },
      );
    };

    const onLeave = (): void => {
      current = -1;
      pressed = -1;
      hide();
    };
    const onDown = (): void => {
      pressed = current;
      hide();
    };

    const stop = watchToolbar(container, (toolbar) => {
      const onMove = (event: PointerEvent): void => {
        if (event.pointerType === 'touch') return;
        const button = editorToolbarButtonAt(
          event.offsetX,
          event.offsetY,
          toolbar.offsetHeight,
        );
        if (button === current) return;
        current = button;
        if (button !== pressed) pressed = -1;
        if (button === -1 || button === pressed) {
          hide();
          return;
        }
        clearTimeout(timer);
        if (open) {
          show(toolbar, button);
          return;
        }
        timer = setTimeout(() => show(toolbar, button), OPEN_DELAY);
      };

      toolbar.addEventListener('pointermove', onMove);
      toolbar.addEventListener('pointerleave', onLeave);
      toolbar.addEventListener('pointerdown', onDown);
      return () => {
        toolbar.removeEventListener('pointermove', onMove);
        toolbar.removeEventListener('pointerleave', onLeave);
        toolbar.removeEventListener('pointerdown', onDown);
        onLeave();
      };
    });

    return () => {
      stop();
      clearTimeout(timer);
    };
  }, [containerRef]);

  return hover;
}

// Long enough that sweeping the pointer across the toolbar opens nothing.
const OPEN_DELAY = 250;

function boxIn(
  container: HTMLElement,
  toolbar: HTMLCanvasElement,
  button: number,
): EditorToolbarButtonBox {
  const box = editorToolbarButtonBox(button, toolbar.offsetHeight);
  const toolbarRect = toolbar.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();
  return {
    ...box,
    left:
      toolbarRect.left - containerRect.left - container.clientLeft + box.left,
    top: toolbarRect.top - containerRect.top - container.clientTop + box.top,
  };
}
