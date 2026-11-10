/**
 * Pictures of the scene: the helper set to a picture's size with no axes and
 * an opaque background, and a trajectory rendered one frame at a time with
 * the scene left as it was found — the frame it showed, its render loop and
 * its playback.
 */

import type { PluginContext } from 'molstar/lib/mol-plugin/context.js';
import { expect, test } from 'vitest';

import { captureFrames, captureScene, pictureHelper } from '../captureScene.ts';

import type { StandInTrajectory } from './trajectoryStandIn.ts';
import { trajectoryStandIn } from './trajectoryStandIn.ts';

test('a picture is drawn at its own size, without axes, on an opaque background', async () => {
  const { plugin, values } = picturePlugin();

  const uri = await captureScene(plugin, { width: 640, height: 480 });

  expect(uri).toBe('data:image/png;base64,picture');
  expect(values).toStrictEqual([
    {
      imageFormat: 'png',
      resolution: { name: 'custom', params: { width: 640, height: 480 } },
      axes: { name: 'off', params: {} },
      transparent: false,
    },
  ]);
});

test('a viewer with no screenshot helper cannot take a picture', () => {
  const plugin = { helpers: {} } as unknown as PluginContext;

  expect(() => pictureHelper(plugin, { width: 1, height: 1 })).toThrow(
    'This viewer cannot take a picture of its scene.',
  );
});

test('every frame of a trajectory is rendered in order, and the scene goes back to the frame it showed', async () => {
  const { plugin, log } = picturePlugin({
    trajectories: [{ frames: 3, shown: 1 }],
    animating: true,
  });

  const frames = await captureFrames(
    plugin,
    { width: 40, height: 30 },
    { playing: true, framesPerSecond: 30 },
  );

  expect(frames).toStrictEqual([
    { width: 40, height: 30, frame: 0 },
    { width: 40, height: 30, frame: 1 },
    { width: 40, height: 30, frame: 2 },
  ]);
  expect(log).toStrictEqual([
    'stop',
    'loop stop',
    'background',
    'commit model-0→0',
    'canvas commit',
    'read frame 0',
    'commit model-0→1',
    'canvas commit',
    'read frame 1',
    'commit model-0→2',
    'canvas commit',
    'read frame 2',
    'commit model-0→1',
    'loop start',
    'play loop forward sequential at 30 fps',
  ]);
});

test('a scene of one model gives one picture, and leaves its frames alone', async () => {
  const { plugin, log } = picturePlugin();

  const frames = await captureFrames(
    plugin,
    { width: 40, height: 30 },
    { playing: false, framesPerSecond: 25 },
  );

  expect(frames).toStrictEqual([{ width: 40, height: 30, frame: 0 }]);
  expect(log).toStrictEqual([
    'loop stop',
    'background',
    'canvas commit',
    'read frame 0',
    'loop start',
  ]);
});

test('a frame that fails to render still restores the frame, the loop and the playback', async () => {
  const { plugin, log } = picturePlugin({
    trajectories: [{ frames: 2, shown: 1 }],
    failFrame: 1,
  });

  await expect(
    captureFrames(
      plugin,
      { width: 40, height: 30 },
      { playing: true, framesPerSecond: 12 },
    ),
  ).rejects.toThrow('lost the context');
  expect(log.slice(-3)).toStrictEqual([
    'commit model-0→1',
    'loop start',
    'play loop forward sequential at 12 fps',
  ]);
});

interface PictureOptions {
  /**
   * The trajectories on screen.
   * @default []
   */
  trajectories?: StandInTrajectory[];
  /**
   * Whether the frames are playing.
   * @default false
   */
  animating?: boolean;
  /**
   * The frame whose render fails.
   * @default undefined — every frame renders
   */
  failFrame?: number;
}

/**
 * A trajectory stand-in that can also take pictures: its screenshot helper
 * records the values it is set to, and its image pass renders the frame the
 * first model shows.
 * @param options - See {@link PictureOptions}.
 * @returns The plugin, the log of its calls and the helper values set.
 */
function picturePlugin(options: PictureOptions = {}) {
  const { failFrame, ...trajectory } = options;
  const standIn = trajectoryStandIn(trajectory);
  const { log, shownFrames } = standIn;
  const values: unknown[] = [];
  const helper = {
    values: {
      imageFormat: 'png',
      axes: { name: 'on', params: {} },
      transparent: true,
    },
    behaviors: {
      values: {
        next: (next: unknown) => {
          values.push(next);
        },
      },
    },
    getImageDataUri: async () => 'data:image/png;base64,picture',
    imagePass: {
      async updateBackground() {
        log.push('background');
      },
      async getImageData(_runtime: unknown, width: number, height: number) {
        const frame = shownFrames()[0] ?? 0;
        if (frame === failFrame) throw new Error('lost the context');
        log.push(`read frame ${frame}`);
        return { width, height, frame };
      },
    },
  };
  const plugin = Object.assign(standIn.plugin, {
    helpers: { viewportScreenshot: helper },
    runTask: (task: { run: () => Promise<unknown> }) => task.run(),
    canvas3d: {
      commit() {
        log.push('canvas commit');
      },
    },
    animationLoop: {
      stop() {
        log.push('loop stop');
      },
      start() {
        log.push('loop start');
      },
    },
  });
  return { plugin, log, values };
}
