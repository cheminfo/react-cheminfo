/**
 * The frames of a trajectory: how many there are, which one is shown, and
 * playing them in a loop.
 *
 * molstar keeps a trajectory as one data node and shows one of its frames
 * through a `ModelFromTrajectory` node whose `modelIndex` says which. Playing
 * is molstar's own model-index animation, which steps that index; showing one
 * frame sets it.
 */

import type { PluginContext } from 'molstar/lib/mol-plugin/context.js';
import { AnimateModelIndex } from 'molstar/lib/mol-plugin-state/animation/built-in/model-index.js';
import { PluginStateObject } from 'molstar/lib/mol-plugin-state/objects.js';
import { ModelFromTrajectory } from 'molstar/lib/mol-plugin-state/transforms/model.js';
import { StateSelection } from 'molstar/lib/mol-state/index.js';

/** How fast molstar's model-index animation can step, frames per second. */
export const PLAYBACK_FPS_RANGE = { minimum: 5, maximum: 60 } as const;

/**
 * How many frames the trajectory on screen holds.
 * @param plugin - The molstar context.
 * @returns The most frames of any trajectory shown; 0 when none is.
 */
export function trajectoryFrameCount(plugin: PluginContext): number {
  const state = plugin.state.data;
  let count = 0;
  for (const model of modelCells(plugin)) {
    const trajectory = StateSelection.findAncestorOfType(
      state.tree,
      state.cells,
      model.transform.ref,
      PluginStateObject.Molecule.Trajectory,
    );
    count = Math.max(count, trajectory?.obj?.data.frameCount ?? 0);
  }
  return count;
}

/**
 * Show one frame of every trajectory on screen, and everything built on it:
 * the drawn model, its surface and the measurements over it.
 * @param plugin - The molstar context.
 * @param index - The frame, from 0.
 * @returns Nothing; resolves once the state tree is updated.
 */
export async function showTrajectoryFrame(
  plugin: PluginContext,
  index: number,
): Promise<void> {
  const update = plugin.build();
  for (const model of modelCells(plugin)) {
    update.to(model).update({ modelIndex: index });
  }
  await update.commit();
}

/**
 * The frame on screen.
 * @param plugin - The molstar context.
 * @returns The index of the frame the first trajectory shows; 0 when none is.
 */
export function shownTrajectoryFrame(plugin: PluginContext): number {
  return modelCells(plugin)[0]?.transform.params?.modelIndex ?? 0;
}

/**
 * Play the frames in a loop, or stop them where they stand.
 * @param plugin - The molstar context.
 * @param playing - Whether to play. A trajectory of one frame never plays.
 * @param framesPerSecond - How fast, clamped into {@link PLAYBACK_FPS_RANGE}.
 * @returns Nothing; resolves once the animation is started or stopped.
 */
export async function setTrajectoryPlayback(
  plugin: PluginContext,
  playing: boolean,
  framesPerSecond: number,
): Promise<void> {
  if (!playing || trajectoryFrameCount(plugin) < 2) {
    await stopTrajectory(plugin);
    return;
  }
  await plugin.managers.animation.play(AnimateModelIndex, {
    mode: { name: 'loop', params: { direction: 'forward' } },
    duration: {
      name: 'sequential',
      params: { maxFps: clampFramesPerSecond(framesPerSecond) },
    },
  });
}

/**
 * Stop the frames where they stand.
 * @param plugin - The molstar context.
 * @returns Nothing; resolves once the animation is stopped.
 */
export async function stopTrajectory(plugin: PluginContext): Promise<void> {
  const animation = plugin.managers.animation;
  if (animation.isAnimating) await animation.stop();
}

/**
 * A frame rate molstar's model-index animation accepts.
 * @param framesPerSecond - Any rate.
 * @returns The rate, rounded and clamped into {@link PLAYBACK_FPS_RANGE}.
 */
export function clampFramesPerSecond(framesPerSecond: number): number {
  const { minimum, maximum } = PLAYBACK_FPS_RANGE;
  if (!Number.isFinite(framesPerSecond)) return minimum;
  return Math.min(maximum, Math.max(minimum, Math.round(framesPerSecond)));
}

function modelCells(plugin: PluginContext) {
  return plugin.state.data.select(
    StateSelection.Generators.ofTransformer(ModelFromTrajectory),
  );
}
