import { downloadBlob } from '../../download/core/downloadBlob.ts';
import type { FigureFormat } from '../../download/core/downloadFigure.ts';
import { FIGURE_PNG_TYPE } from '../../download/core/figurePng.ts';
import { figurePixels } from '../../download/core/figureScale.ts';
import { FIGURE_SVG_TYPE } from '../../download/core/figureSvg.ts';
import { sanitizeFileName } from '../../download/core/sanitizeFileName.ts';
import { encodeAnimatedPng } from '../core/animatedPng.ts';
import type { ImageSize } from '../core/exportImage.ts';
import { dataUriBytes, rasterSvgMarkup } from '../core/exportImage.ts';

/** What an export asks of a viewer: a picture of its scene. */
export interface SceneCapture {
  /** Render the scene at that pixel size, as a `data:` URI. */
  captureImage: (size: ImageSize) => Promise<string | undefined>;
  /**
   * The frames of the scene, each rendered at that pixel size, for an animated
   * PNG.
   * @default undefined — the viewer has a single frame to give
   */
  frames?: {
    capture: (size: ImageSize) => Promise<ImageData[] | undefined>;
  };
}

/** What {@link exportMoleculeImage} writes. */
export interface MoleculeImageRequest {
  format: FigureFormat;
  /** Multiple of the canvas on screen the picture is rendered at. */
  scale: number;
  /** Size of the canvas on screen, CSS pixels. */
  size: ImageSize;
  /** File name without its extension. */
  fileName: string;
  /**
   * Every frame of the scene as one animated PNG, played at this many frames a
   * second, rather than the frame on screen. Ignored for an SVG.
   * @default undefined — the frame on screen
   */
  framesPerSecond?: number;
}

/**
 * Render the scene as a PNG, for the clipboard.
 * @param viewer - The viewer holding the scene.
 * @param scale - Multiple of the canvas on screen it is rendered at.
 * @param size - Size of the canvas on screen, CSS pixels.
 * @returns The PNG.
 * @throws {Error} When the viewer has nothing to render.
 */
export async function captureMoleculePng(
  viewer: SceneCapture,
  scale: number,
  size: ImageSize,
): Promise<Blob> {
  const dataUri = await viewer.captureImage(figurePixels(size, scale));
  if (dataUri === undefined) {
    throw new Error('There is no picture to copy yet.');
  }
  return new Blob([dataUriBytes(dataUri)], { type: FIGURE_PNG_TYPE });
}

/**
 * Render the scene and hand it to the browser as a file.
 * @param viewer - The viewer holding the scene.
 * @param request - See {@link MoleculeImageRequest}.
 * @returns Nothing; resolves once the download has been started.
 */
export async function exportMoleculeImage(
  viewer: SceneCapture,
  request: MoleculeImageRequest,
): Promise<void> {
  const { format, scale, size, fileName, framesPerSecond } = request;
  const pixels = figurePixels(size, scale);
  const base = sanitizeFileName(fileName, 'molecule');
  if (format === 'png' && framesPerSecond !== undefined) {
    if (viewer.frames === undefined) {
      throw new Error('This viewer has no frames to animate.');
    }
    const frames = await viewer.frames.capture(pixels);
    if (frames === undefined) return;
    const bytes = await encodeAnimatedPng(frames, framesPerSecond);
    downloadBlob(new Blob([bytes], { type: FIGURE_PNG_TYPE }), `${base}.png`);
    return;
  }
  const dataUri = await viewer.captureImage(pixels);
  if (dataUri === undefined) return;
  if (format === 'png') {
    downloadBlob(
      new Blob([dataUriBytes(dataUri)], { type: FIGURE_PNG_TYPE }),
      `${base}.png`,
    );
    return;
  }
  downloadBlob(
    new Blob([rasterSvgMarkup(dataUri, pixels)], { type: FIGURE_SVG_TYPE }),
    `${base}.svg`,
  );
}
