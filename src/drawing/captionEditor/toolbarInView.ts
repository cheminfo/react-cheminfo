/**
 * Keeping a caption's toolbar inside the area it is drawn over: the bar is
 * centred over its caption, so a caption near an edge would leave part of the
 * bar — its first buttons, or the tick that keeps the caption — outside a
 * figure that clips what overflows it.
 */

import type { RefObject } from 'react';
import { useLayoutEffect } from 'react';

/** How far the bar keeps from the area's edges, in pixels. */
const TOOLBAR_INSET = 4;

/** A box on screen, as `getBoundingClientRect` gives it. */
interface ScreenBox {
  left: number;
  right: number;
  top: number;
}

/** Where a caption's toolbar is moved to stay in view. */
export interface ToolbarFit {
  /** How far it is moved sideways, in pixels: positive to the right. */
  shift: number;
  /** Whether it goes under the caption, the area having no room above. */
  below: boolean;
}

/**
 * Where a toolbar centred over its caption goes to stay inside an area: moved
 * sideways no more than it overflows, its left edge kept in view first, and
 * under the caption when it would rise above the area.
 * @param bar - The toolbar where it is centred.
 * @param area - The area it must stay in.
 * @returns The move.
 */
export function toolbarFit(bar: ScreenBox, area: ScreenBox): ToolbarFit {
  let shift = 0;
  if (bar.right > area.right - TOOLBAR_INSET) {
    shift = area.right - TOOLBAR_INSET - bar.right;
  }
  if (bar.left + shift < area.left + TOOLBAR_INSET) {
    shift = area.left + TOOLBAR_INSET - bar.left;
  }
  return { shift, below: bar.top < area.top + TOOLBAR_INSET };
}

/**
 * Keep the toolbar of a caption being typed inside the box the caption is
 * laid over (its offset parent), after every render: moved sideways through
 * `--caption-toolbar-shift`, and under the caption with `data-below`.
 * `react-cheminfo/styles/caption-editor.css` reads both.
 * @param ref - The caption editor's frame (`.caption-editor`), or any element
 * inside it, such as the box the text is typed in.
 */
export function useToolbarInView(ref: RefObject<HTMLElement | null>): void {
  useLayoutEffect(() => {
    const frame = ref.current?.closest<HTMLElement>('.caption-editor');
    const toolbar = frame?.querySelector<HTMLElement>('.caption-toolbar');
    const area = frame?.offsetParent;
    if (!toolbar || !area) return;
    toolbar.style.removeProperty('--caption-toolbar-shift');
    delete toolbar.dataset.below;
    const { shift, below } = toolbarFit(
      withPalette(toolbar),
      area.getBoundingClientRect(),
    );
    if (shift !== 0) {
      toolbar.style.setProperty('--caption-toolbar-shift', `${shift}px`);
    }
    if (below) toolbar.dataset.below = '';
  });
}

// The bar and, while it is open, the symbol palette standing on it.
function withPalette(toolbar: HTMLElement): ScreenBox {
  const bar = toolbar.getBoundingClientRect();
  const palette = toolbar
    .querySelector('.caption-symbols')
    ?.getBoundingClientRect();
  if (!palette) return bar;
  return {
    left: Math.min(bar.left, palette.left),
    right: Math.max(bar.right, palette.right),
    top: Math.min(bar.top, palette.top),
  };
}
