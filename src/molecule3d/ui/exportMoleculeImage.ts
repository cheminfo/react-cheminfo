import { downloadBlob } from '../../download/core/downloadBlob.ts';
import type { FigureFormat } from '../../download/core/downloadFigure.ts';
import { FIGURE_PNG_TYPE } from '../../download/core/figurePng.ts';
import { figurePixels } from '../../download/core/figureScale.ts';
import { FIGURE_SVG_TYPE } from '../../download/core/figureSvg.ts';
import { sanitizeFileName } from '../../download/core/sanitizeFileName.ts';
import type { ImageSize } from '../core/exportImage.ts';
import { dataUriBytes, rasterSvgMarkup } from '../core/exportImage.ts';

import type { Molecule3DViewer } from './viewer.ts';

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
 * Render the scene and hand it to the browser as a file.
 * @param viewer - The viewer holding the scene.
 * @param request - See {@link MoleculeImageRequest}.
 * @returns Nothing; resolves once the download has been started.
 */
export async function exportMoleculeImage(
  viewer: Molecule3DViewer,
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
