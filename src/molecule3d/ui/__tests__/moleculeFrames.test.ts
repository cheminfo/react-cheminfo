/**
 * The frames of what a viewer shows, through every redraw: stopped while the
 * scene is rebuilt, counted once it is drawn, and played again as they were —
 * against the trajectory stand-in of the molstar helpers.
 */

import type { PluginContext } from 'molstar/lib/mol-plugin/context.js';
import { expect, test } from 'vitest';

import type { StandInTrajectory } from '../../../molstar/core/__tests__/trajectoryStandIn.ts';
import { trajectoryStandIn } from '../../../molstar/core/__tests__/trajectoryStandIn.ts';
import type { MolstarPlugin } from '../../../molstar/core/index.ts';
import { MoleculeFrames } from '../moleculeFrames.ts';

test('a redraw stops the frames, reports how many the new scene holds, and leaves a still scene still', async () => {
  const { frames, context, log, counts } = framesOf({
    trajectories: [{ frames: 12, shown: 3 }],
    animating: true,
  });

  await frames.redraw(context, async () => {
    log.push('draw');
    return 12;
  });

  expect(log).toStrictEqual(['stop', 'draw']);
  expect(counts).toStrictEqual([12]);
});

test('frames set playing keep playing through every redraw, at the rate asked', async () => {
  const { frames, context, log } = framesOf({
    trajectories: [{ frames: 12, shown: 0 }],
  });

  await frames.play(true, 10);
  await frames.redraw(context, async () => 12);

  expect(log).toStrictEqual([
    'play loop forward sequential at 10 fps',
    'stop',
    'play loop forward sequential at 10 fps',
  ]);
});

test('frames stopped stay stopped through a redraw', async () => {
  const { frames, context, log } = framesOf({
    trajectories: [{ frames: 12, shown: 0 }],
  });

  await frames.play(true, 10);
  await frames.play(false, 10);
  await frames.redraw(context, async () => 12);

  expect(log).toStrictEqual(['play loop forward sequential at 10 fps', 'stop']);
});

test('the pictures of the frames are taken on the canvas', async () => {
  const { frames } = framesOf({ trajectories: [] });

  await expect(frames.capture({ width: 4, height: 3 })).rejects.toThrow(
    'This viewer cannot take a picture of its scene.',
  );
});

/**
 * Frames over a canvas whose context is the trajectory stand-in.
 * @param options - The trajectories on screen, and whether they play.
 * @param options.trajectories - See {@link StandInTrajectory}.
 * @param options.animating - Whether the frames are playing.
 * @returns The frames, the context, the log of its calls and the counts reported.
 */
function framesOf(options: {
  trajectories: StandInTrajectory[];
  animating?: boolean;
}) {
  const { plugin: context, log } = trajectoryStandIn(options);
  Object.assign(context, { helpers: {} });
  const canvas = {
    run: async <Result>(
      action: (plugin: PluginContext) => Result | Promise<Result>,
    ) => action(context),
  } as unknown as MolstarPlugin;
  const counts: number[] = [];
  const frames = new MoleculeFrames(canvas, (count) => counts.push(count));
  return { frames, context, log, counts };
}
