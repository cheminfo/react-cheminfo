import { useMemo } from 'react';

import type { Box, FigureSize } from '../core/types.ts';
import { unionBox } from '../render/bounds.ts';
import { enclosingBox, figureBox } from '../render/pageGrid.ts';
import type { Scene } from '../render/primitives.ts';

/** The sizes set on a drawing, as the canvas shows them. */
export interface PageOutline {
  /** The edge of a figure of a set size. */
  outline: Box | undefined;
  /** The sheets of the grid that hold something, in reading order. */
  sheets: readonly Box[];
  /** What framing the drawing takes in: it, and all of a figure of a set size. */
  drawing: Box;
  /** What framing the pages takes in. */
  pages: Box;
}

/**
 * The sheets a drawing is laid out on and the edge of its figure, when it has
 * a set size, with the boxes the view can frame.
 * @param scene - The drawing, rendered.
 * @param sheets - The sheets that hold something, in reading order.
 * @param figure - The size of its figure, when it sets a side.
 * @returns How the canvas shows them, the same object while none changes.
 */
export function usePageSheet(
  scene: Scene,
  sheets: readonly Box[],
  figure: FigureSize | undefined,
): PageOutline {
  return useMemo(() => {
    const outline = figure ? figureBox(scene, figure) : undefined;
    return {
      outline,
      sheets,
      drawing: unionBox(scene.bounds, outline) ?? scene.bounds,
      pages: enclosingBox(sheets),
    };
  }, [scene, sheets, figure]);
}
