import type { RefObject } from 'react';
import { useCallback } from 'react';

import type { FigureFormat } from '../../download/core/downloadFigure.ts';
import type { FigurePixels } from '../../download/core/figureScale.ts';

import { exportMoleculeImage } from './exportMoleculeImage.ts';
import type { Molecule3DViewer } from './viewer.ts';

/** What {@link useImageExport} hands the export panel. */
export interface ImageExport {
  /** Size of the canvas on screen, or `null` before it is laid out. */
  canvasSize: () => FigurePixels | null;
  /** Render the scene at `scale` and download it as `format`. */
  exportImage: (format: FigureFormat, scale: number) => Promise<void>;
}

/**
 * The two callbacks the export panel needs, bound to the canvas and its viewer.
 * @param container - The element molstar draws into.
 * @param viewerRef - The viewer, once created.
 * @param fileName - File name without its extension.
 * @returns See {@link ImageExport}.
 */
export function useImageExport(
  container: HTMLDivElement | null,
  viewerRef: RefObject<Molecule3DViewer | null>,
  fileName: string,
): ImageExport {
  const canvasSize = useCallback((): FigurePixels | null => {
    if (container === null) return null;
    const box = container.getBoundingClientRect();
    if (box.width <= 0 || box.height <= 0) return null;
    return { width: Math.round(box.width), height: Math.round(box.height) };
  }, [container]);

  const exportImage = useCallback(
    async (format: FigureFormat, scale: number) => {
      const viewer = viewerRef.current;
      const size = canvasSize();
      if (viewer === null || size === null) {
        throw new Error('There is no picture to export yet.');
      }
      await exportMoleculeImage(viewer, { format, scale, size, fileName });
    },
    [canvasSize, viewerRef, fileName],
  );

  return { canvasSize, exportImage };
}
