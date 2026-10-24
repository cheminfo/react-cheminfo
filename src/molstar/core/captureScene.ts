/**
 * A picture of the scene, rendered off screen at a size of its own — one
 * frame, or every frame of the trajectory on screen.
 */

import type { PluginContext } from 'molstar/lib/mol-plugin/context.js';
import type { ViewportScreenshotHelper } from 'molstar/lib/mol-plugin/util/viewport-screenshot.js';
import { Task } from 'molstar/lib/mol-task/index.js';

import type { ImageSize } from '../../molecule3d/core/exportImage.ts';

import {
  setTrajectoryPlayback,
  showTrajectoryFrame,
  shownTrajectoryFrame,
  stopTrajectory,
  trajectoryFrameCount,
} from './trajectory.ts';

/**
 * Render the scene without its selection highlights or its axes.
 * @param plugin - The molstar context.
 * @param size - Pixel size of the picture.
 * @returns The PNG as a data URI.
 * @throws {Error} When the plugin has no screenshot helper.
 */
export async function captureScene(
  plugin: PluginContext,
  size: ImageSize,
): Promise<string> {
  return pictureHelper(plugin, size).getImageDataUri();
}

/** How a series of frames is played, so it can be resumed once captured. */
export interface FramePlayback {
  playing: boolean;
  framesPerSecond: number;
}

/**
 * Render every frame of the trajectory on screen, in order, as the scene shows
 * it: the model, its surface and the measurements over it, each at that frame.
 * The animation is stopped while the frames are taken and resumed afterwards,
 * and the scene is left on the frame it showed.
 * @param plugin - The molstar context.
 * @param size - Pixel size of each picture.
 * @param playback - What to resume once the frames are taken.
 * @returns One picture per frame; a scene of one model gives one.
 * @throws {Error} When the plugin has no screenshot helper.
 */
export async function captureFrames(
  plugin: PluginContext,
  size: ImageSize,
  playback: FramePlayback,
): Promise<ImageData[]> {
  const pass = pictureHelper(plugin, size).imagePass;
  const loop = plugin.animationLoop;
  const shown = shownTrajectoryFrame(plugin);
  const count = Math.max(1, trajectoryFrameCount(plugin));
  await stopTrajectory(plugin);
  loop.stop({ noDraw: true });
  try {
    await pass.updateBackground();
    const frames: ImageData[] = [];
    for (let index = 0; index < count; index++) {
      // eslint-disable-next-line no-await-in-loop -- each frame is a commit of the state tree, and commits must not interleave
      if (count > 1) await showTrajectoryFrame(plugin, index);
      // The scene is otherwise committed on the next animation frame, after
      // the picture has been taken of the previous one.
      plugin.canvas3d?.commit(true);
      // eslint-disable-next-line no-await-in-loop -- one render at a time on the one image pass
      const image = await plugin.runTask(
        Task.create('Render a frame', (runtime) =>
          pass.getImageData(runtime, size.width, size.height),
        ),
      );
      frames.push(image);
    }
    return frames;
  } finally {
    if (count > 1) await showTrajectoryFrame(plugin, shown);
    loop.start({ immediate: true });
    await setTrajectoryPlayback(
      plugin,
      playback.playing,
      playback.framesPerSecond,
    );
  }
}

/**
 * The screenshot helper, set to draw a picture of `size` with no axes and an
 * opaque background.
 * @param plugin - The molstar context.
 * @param size - Pixel size of the picture.
 * @returns The helper.
 * @throws {Error} When the plugin has no screenshot helper.
 */
function pictureHelper(
  plugin: PluginContext,
  size: ImageSize,
): ViewportScreenshotHelper {
  const helper = plugin.helpers.viewportScreenshot;
  if (helper === undefined) {
    throw new Error('This viewer cannot take a picture of its scene.');
  }
  helper.behaviors.values.next({
    ...helper.values,
    resolution: { name: 'custom', params: size },
    axes: { name: 'off', params: {} },
    transparent: false,
  });
  return helper;
}
