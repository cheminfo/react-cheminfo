/**
 * What a molstar canvas reports while the reader moves around its scene: where
 * the camera stands, and which atom the pointer rests on.
 */

import type { MolstarPlugin } from '../../molstar/core/index.ts';
import { subscribeHoverAtom } from '../../molstar/core/index.ts';
import type { Molecule3DCamera } from '../core/camera.ts';
import type { AtomReference } from '../core/measurement.ts';

import { watchCamera } from './camera.ts';
import { moleculeStructure } from './renderMolecule.ts';
import { ScenePictures } from './scenePictures.ts';

/**
 * The pictures of a viewer, and what it reports while the reader moves around
 * its scene. Every watch is safe to start before the canvas exists.
 */
export class SceneWatches extends ScenePictures {
  readonly #plugin: MolstarPlugin;

  /**
   * Follow the scene of one canvas.
   * @param plugin - The canvas.
   */
  constructor(plugin: MolstarPlugin) {
    super(plugin);
    this.#plugin = plugin;
  }

  /**
   * Follow the camera, however it moves.
   * @param listener - Called after every move.
   * @returns A function that stops calling the listener; safe to call before
   * the canvas exists.
   */
  watchCamera(listener: (camera: Molecule3DCamera | null) => void): () => void {
    return this.#plugin.subscribe((plugin) => watchCamera(plugin, listener));
  }

  /**
   * Follow the atom under the pointer.
   * @param listener - Called with the atom each time the pointer rests on
   * another one, and with `null` once it leaves the atoms.
   * @returns A function that stops calling the listener; safe to call before
   * the canvas exists.
   */
  watchHoverAtom(listener: (atom: AtomReference | null) => void): () => void {
    return this.#plugin.subscribe((plugin) =>
      subscribeHoverAtom(plugin, moleculeStructure, listener),
    );
  }
}
