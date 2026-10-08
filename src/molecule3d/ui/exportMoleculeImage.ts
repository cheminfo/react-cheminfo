import { downloadBlob } from '../../download/core/downloadBlob.ts';
import type { FigureFormat } from '../../download/core/downloadFigure.ts';
import { FIGURE_PNG_TYPE } from '../../download/core/figurePng.ts';
import { figurePixels } from '../../download/core/figureScale.ts';
import { FIGURE_SVG_TYPE } from '../../download/core/figureSvg.ts';
import { sanitizeFileName } from '../../download/core/sanitizeFileName.ts';
import type { ImageSize } from '../core/exportImage.ts';
import { dataUriBytes, rasterSvgMarkup } from '../core/exportImage.ts';

/** The one thing an export asks of a viewer: a picture of its scene. */
export interface SceneCapture {
  /** Render the scene at that pixel size, as a `data:` URI. */
  captureImage: (size: ImageSize) => Promise<string | undefined>;
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
  const { format, scale, size, fileName } = request;
  const pixels = figurePixels(size, scale);
  const dataUri = await viewer.captureImage(pixels);
  if (dataUri === undefined) return;
  const base = sanitizeFileName(fileName, 'molecule');
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
