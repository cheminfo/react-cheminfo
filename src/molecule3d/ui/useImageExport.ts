import type { RefObject } from 'react';
import { useCallback, useMemo } from 'react';

import type { FigureNotice } from '../../download/core/copyFigure.ts';
import { copyFigure } from '../../download/core/copyFigure.ts';
import type { FigureFormat } from '../../download/core/downloadFigure.ts';
import type { FigurePixels } from '../../download/core/figureScale.ts';
import { DEFAULT_FRAMES_PER_SECOND } from '../core/animatedPng.ts';

import type { SceneCapture } from './exportMoleculeImage.ts';
import {
  captureMoleculePng,
  captureMoleculeSvg,
  exportMoleculeImage,
} from './exportMoleculeImage.ts';
import type { Molecule3DCapture } from './moleculeViewer3DProps.ts';

/** What {@link useImageExport} hands the export panel. */
export interface ImageExport {
  /** Size of the canvas on screen, or `null` before it is laid out. */
  canvasSize: () => FigurePixels | null;
  /**
   * Render the scene at `scale` and download it as `format` — every frame of
   * it, as an animated PNG, when `animated` is set and the format is PNG.
   */
  exportImage: (
    format: FigureFormat,
    scale: number,
    animated?: boolean,
  ) => Promise<void>;
  /**
   * Render the scene at `scale` and put it on the clipboard as a PNG. Call it
   * from the click itself: Safari only allows a write the click started.
   */
  copyImage: (scale: number) => Promise<FigureNotice>;
  /** The scene rendered on request, for a page handing the picture on. */
  capture: Molecule3DCapture;
}

/**
 * The callbacks the export panel needs, bound to the canvas and its viewer.
 * @param container - The element molstar draws into.
 * @param viewerRef - The viewer, once created.
 * @param fileName - File name without its extension.
 * @param framesPerSecond - How fast an animated PNG plays its frames.
 * @default 25
 * @returns See {@link ImageExport}.
 */
export function useImageExport(
  container: HTMLDivElement | null,
  viewerRef: RefObject<SceneCapture | null>,
  fileName: string,
  framesPerSecond = DEFAULT_FRAMES_PER_SECOND,
): ImageExport {
  const canvasSize = useCallback((): FigurePixels | null => {
    if (container === null) return null;
    const box = container.getBoundingClientRect();
    if (box.width <= 0 || box.height <= 0) return null;
    return { width: Math.round(box.width), height: Math.round(box.height) };
  }, [container]);

  const exportImage = useCallback(
    async (format: FigureFormat, scale: number, animated = false) => {
      const viewer = viewerRef.current;
      const size = canvasSize();
      if (viewer === null || size === null) {
        throw new Error('There is no picture to export yet.');
      }
      await exportMoleculeImage(viewer, {
        format,
        scale,
        size,
        fileName,
        framesPerSecond: animated ? framesPerSecond : undefined,
      });
    },
    [canvasSize, viewerRef, fileName, framesPerSecond],
  );

  const copyImage = useCallback(
    (scale: number) => {
      const viewer = viewerRef.current;
      const size = canvasSize();
      if (viewer === null || size === null) {
        return Promise.reject(new Error('There is no picture to copy yet.'));
      }
      return copyFigure(captureMoleculePng(viewer, scale, size));
    },
    [canvasSize, viewerRef],
  );

  const capture = useMemo(
    (): Molecule3DCapture => ({
      svg: async (scale) => {
        const viewer = viewerRef.current;
        const size = canvasSize();
        if (viewer === null || size === null) {
          throw new Error('There is no picture to copy yet.');
        }
        return captureMoleculeSvg(viewer, scale, size);
      },
      png: async (scale) => {
        const viewer = viewerRef.current;
        const size = canvasSize();
        if (viewer === null || size === null) {
          throw new Error('There is no picture to copy yet.');
        }
        return captureMoleculePng(viewer, scale, size);
      },
    }),
    [canvasSize, viewerRef],
  );

  return { canvasSize, exportImage, copyImage, capture };
}
