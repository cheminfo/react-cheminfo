import type { ReactNode } from 'react';
import { useEffect } from 'react';

import { registerDocumentFigure } from '../core/documentFigure.ts';

import type { FigureRenderer } from './useFigureRedraw.tsx';
import { useFigureRedraw } from './useFigureRedraw.tsx';

/**
 * Let a host take the figure in a box drawn again at the size a document
 * places it at, through `documentFigureSvg`.
 *
 * The copy is drawn through a portal the caller renders anywhere in its tree,
 * so it sees every provider the figure on the page sees.
 * @param targetId - The `id` of the box the figure is mounted in.
 * @param render - Draws the figure at a size.
 * @returns The copy being drawn, to render beside the figure.
 */
export function useDocumentFigure(
  targetId: string,
  render: FigureRenderer,
): ReactNode {
  const { redraw, portal } = useFigureRedraw(render);
  useEffect(
    () =>
      registerDocumentFigure(targetId, (size, save) =>
        redraw(targetId, size, save),
      ),
    [targetId, redraw],
  );
  return portal;
}
