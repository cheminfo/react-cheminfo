/**
 * The pictures a molstar canvas takes of its scene: the whole frame, for an
 * export at the size the reader picks, and a figure, for a page the picture
 * is handed to or a file the site saves.
 */

import type { MolstarPlugin } from '../../molstar/core/index.ts';
import { captureFigure, captureScene } from '../../molstar/core/index.ts';
import type { ImageSize } from '../core/exportImage.ts';
import type { RenderedFigure } from '../core/figureFrame.ts';

/**
 * The pictures a viewer takes of its scene, without the selection highlights
 * or the axes. Every method resolves to nothing once the viewer is disposed.
 */
export class ScenePictures {
  readonly #plugin: MolstarPlugin;

  /**
   * Picture the scene of one canvas.
   * @param plugin - The canvas.
   */
  constructor(plugin: MolstarPlugin) {
    this.#plugin = plugin;
  }

  /**
   * Render the whole frame off screen at a given size.
   * @param size - Pixel size of the picture.
   * @returns The PNG as a data URI; `undefined` once the viewer is disposed.
   * @throws {Error} When the plugin has no screenshot helper.
   */
  captureImage(size: ImageSize): Promise<string | undefined> {
    return this.#plugin.run((plugin) => captureScene(plugin, size));
  }

  /**
   * Render the part of the frame holding the molecule, as a figure.
   * @param size - The frame asked for, in pixels.
   * @param longest - The longest side the figure may have, in pixels.
   * @returns The figure; `undefined` once the viewer is disposed.
   * @throws {Error} When the plugin has no screenshot helper.
   */
  captureFigure(
    size: ImageSize,
    longest: number,
  ): Promise<RenderedFigure | undefined> {
    return this.#plugin.run((plugin) => captureFigure(plugin, size, longest));
  }
}
