/**
 * The frames of the file a viewer shows: how many there are, whether they
 * play, and a picture of each.
 *
 * Kept apart from the viewer because every redraw of the scene has to go
 * through it: a running animation must not step a state tree being rebuilt —
 * it finds no model and stops itself — so the frames are stopped first and
 * started again once the new file is drawn.
 */

import type { PluginContext } from 'molstar/lib/mol-plugin/context.js';

import type { FramePlayback, MolstarPlugin } from '../../molstar/core/index.ts';
import {
  captureFrames,
  setTrajectoryPlayback,
  stopTrajectory,
} from '../../molstar/core/index.ts';
import { DEFAULT_FRAMES_PER_SECOND } from '../core/animatedPng.ts';
import type { ImageSize } from '../core/exportImage.ts';

/** The frames of what one viewer shows. */
export class MoleculeFrames {
  readonly #plugin: MolstarPlugin;
  readonly #onCountChange: (frameCount: number) => void;
  // Kept across redraws, so the next file plays as the last one did.
  #playback: FramePlayback = {
    playing: false,
    framesPerSecond: DEFAULT_FRAMES_PER_SECOND,
  };

  /**
   * Follow the frames of what `plugin` draws.
   * @param plugin - The canvas.
   * @param onCountChange - Called with how many frames each scene drawn holds.
   */
  constructor(
    plugin: MolstarPlugin,
    onCountChange: (frameCount: number) => void,
  ) {
    this.#plugin = plugin;
    this.#onCountChange = onCountChange;
  }

  /**
   * Redraw the scene with the frames stopped, then report how many the new
   * scene holds and play them if playback is on.
   * @param plugin - The molstar context.
   * @param draw - Draws the scene, and resolves with how many frames it holds.
   * @returns Nothing; resolves once the scene is drawn and playing.
   */
  async redraw(
    plugin: PluginContext,
    draw: () => Promise<number>,
  ): Promise<void> {
    await stopTrajectory(plugin);
    this.#onCountChange(await draw());
    const { playing, framesPerSecond } = this.#playback;
    await setTrajectoryPlayback(plugin, playing, framesPerSecond);
  }

  /**
   * Play the frames in a loop, or stop them, now and for every scene drawn
   * afterwards. A scene of one frame stays still.
   * @param playing - Whether to play.
   * @param framesPerSecond - How fast.
   * @returns Nothing; resolves once the animation is started or stopped.
   */
  play(playing: boolean, framesPerSecond: number): Promise<void> {
    this.#playback = { playing, framesPerSecond };
    return this.#plugin.run((plugin) =>
      setTrajectoryPlayback(plugin, playing, framesPerSecond),
    );
  }

  /**
   * Render every frame off screen, as a still picture of the scene is
   * rendered. Playback pauses while they are taken.
   * @param size - Pixel size of each picture.
   * @returns The pictures, in order; `undefined` once the canvas is disposed.
   * @throws {Error} When the plugin has no screenshot helper.
   */
  capture(size: ImageSize): Promise<ImageData[] | undefined> {
    return this.#plugin.run((plugin) =>
      captureFrames(plugin, size, this.#playback),
    );
  }
}
