import type { RefObject } from 'react';
import { useLayoutEffect, useRef } from 'react';

import { toolbarFloorHeight } from '../core/toolbarFloor.ts';

export interface ToolbarFloorOptions {
  /**
   * Smallest height of the drawing area, in pixels. Raised to whatever the
   * toolbar needs, which is usually more.
   * @default 320
   */
  minHeight?: number;
  /**
   * Bumped to look for the toolbar again, which a caller does after the editor
   * has been remounted and the previous toolbar element has gone.
   * @default 0
   */
  revision?: number;
}

/**
 * Give an editor's container a minimum height that shows the whole toolbar.
 *
 * The height is measured rather than written down, so a different button count
 * — a fragment editor, a reaction editor, a future release — keeps working
 * instead of clipping its last buttons behind whatever follows the editor.
 * @param options - The height the caller asked for, and when to look again.
 * @returns The ref to put on the element wrapping the editor.
 */
export function useToolbarFloor(
  options: ToolbarFloorOptions = {},
): RefObject<HTMLDivElement | null> {
  const { minHeight = 320, revision = 0 } = options;
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (container === null) return;

    let observer: ResizeObserver | null = null;
    let frame = 0;
    let attempts = 0;

    // The editor builds itself asynchronously, so the toolbar is usually not
    // there yet on the first look; watching for it is what keeps a slow first
    // paint from leaving the container at its unmeasured height for good.
    const attach = (): void => {
      const toolbar = findToolbar(container);
      if (toolbar === null) {
        attempts++;
        if (attempts > MAX_ATTEMPTS) return;
        frame = globalThis.requestAnimationFrame(attach);
        return;
      }
      observer = new ResizeObserver(() => {
        // offsetHeight, because a dialog opens under a scaling transform and a
        // measured rectangle would be that of the half drawn toolbar.
        const floor = toolbarFloorHeight(toolbar.offsetHeight, minHeight);
        container.style.minHeight = `${floor}px`;
      });
      observer.observe(toolbar);
    };

    attach();

    return () => {
      if (frame !== 0) globalThis.cancelAnimationFrame(frame);
      observer?.disconnect();
    };
  }, [minHeight, revision]);

  return containerRef;
}

/** Roughly two seconds of frames, after which the editor is not coming. */
const MAX_ATTEMPTS = 120;

/**
 * Find the toolbar canvas of the editor.
 *
 * The editor builds itself inside a shadow root and puts the toolbar there as
 * a direct child, the drawing canvas being nested deeper.
 * @param container - The element wrapping the editor.
 * @returns The toolbar canvas, or null while the editor has not drawn one.
 */
function findToolbar(container: HTMLElement): HTMLCanvasElement | null {
  for (const element of container.querySelectorAll('*')) {
    for (const child of element.shadowRoot?.children ?? []) {
      if (child instanceof HTMLCanvasElement) return child;
    }
  }
  return null;
}
