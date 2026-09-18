import type { RefObject } from 'react';
import { useLayoutEffect, useRef } from 'react';

import { toolbarFloorHeight } from '../core/toolbarFloor.ts';

import { watchToolbar } from './watchToolbar.ts';

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

    return watchToolbar(container, (toolbar) => {
      const size = new ResizeObserver(() => {
        // offsetHeight, because a dialog opens under a scaling transform and a
        // measured rectangle would be that of the half drawn toolbar.
        const height = toolbar.offsetHeight;
        // Zero is a toolbar being torn down or not yet laid out, never a
        // toolbar that needs no room: writing the fallback for it would undo a
        // correct floor and leave the palette cut off.
        if (height === 0) return;
        container.style.minHeight = `${toolbarFloorHeight(height, minHeight)}px`;
      });
      size.observe(toolbar);
      return () => size.disconnect();
    });
  }, [minHeight, revision]);

  return containerRef;
}
