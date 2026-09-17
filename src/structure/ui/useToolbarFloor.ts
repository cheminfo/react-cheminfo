import type { RefObject } from 'react';
import { useLayoutEffect, useRef } from 'react';

import { toolbarFloorHeight } from '../core/toolbarFloor.ts';

/** What {@link useToolbarFloor} needs. */
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

    let toolbar: HTMLCanvasElement | null = null;
    let size: ResizeObserver | null = null;

    const attach = (): void => {
      const found = findToolbar(container);
      if (found === null) return;
      size?.disconnect();
      toolbar = found;
      size = new ResizeObserver(() => {
        // offsetHeight, because a dialog opens under a scaling transform and a
        // measured rectangle would be that of the half drawn toolbar.
        const height = found.offsetHeight;
        // Zero is a toolbar being torn down or not yet laid out, never a
        // toolbar that needs no room: writing the fallback for it would undo a
        // correct floor and leave the palette cut off.
        if (height === 0) return;
        container.style.minHeight = `${toolbarFloorHeight(height, minHeight)}px`;
      });
      size.observe(found);
    };

    // The editor is imported lazily and builds itself asynchronously, so it is
    // almost never there on the first look, and how long it takes is a cold
    // module graph and a network away from anything this code can predict. So
    // the arrival is watched for rather than waited out: a deadline that
    // expires leaves the toolbar cut off for the life of the page, with
    // nothing on screen to say why.
    const arrivals = new MutationObserver(() => {
      if (toolbar?.isConnected === true) return;
      attach();
    });
    arrivals.observe(container, { childList: true, subtree: true });
    attach();

    return () => {
      arrivals.disconnect();
      size?.disconnect();
    };
  }, [minHeight, revision]);

  return containerRef;
}

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
