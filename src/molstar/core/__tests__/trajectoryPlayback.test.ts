/**
 * The frames of a trajectory read off, and written to, molstar's state tree:
 * how many there are, which one is shown, and playing them — against a
 * stand-in tree holding only what those helpers read.
 */

import { expect, test } from 'vitest';

import {
  setTrajectoryPlayback,
  showTrajectoryFrame,
  shownTrajectoryFrame,
  stopTrajectory,
  trajectoryFrameCount,
} from '../trajectory.ts';

import { trajectoryStandIn } from './trajectoryStandIn.ts';

test('the frame count is that of the longest trajectory on screen', () => {
  const { plugin } = trajectoryStandIn({
    trajectories: [
      { frames: 3, shown: 0 },
      { frames: 8, shown: 0 },
    ],
  });

  expect(trajectoryFrameCount(plugin)).toBe(8);
});

test('a scene with no trajectory has no frames, and shows the first', () => {
  const { plugin } = trajectoryStandIn();

  expect(trajectoryFrameCount(plugin)).toBe(0);
  expect(shownTrajectoryFrame(plugin)).toBe(0);
});

test('the frame on screen is the one the first model shows', () => {
  const { plugin } = trajectoryStandIn({
    trajectories: [
      { frames: 6, shown: 4 },
      { frames: 6, shown: 2 },
    ],
  });

  expect(shownTrajectoryFrame(plugin)).toBe(4);
});

test('showing a frame moves every model to it in one commit', async () => {
  const { plugin, log, shownFrames } = trajectoryStandIn({
    trajectories: [
      { frames: 6, shown: 0 },
      { frames: 6, shown: 1 },
    ],
  });

  await showTrajectoryFrame(plugin, 3);

  expect(log).toStrictEqual(['commit model-0→3 model-1→3']);
  expect(shownFrames()).toStrictEqual([3, 3]);
  expect(shownTrajectoryFrame(plugin)).toBe(3);
});

test('playing loops the frames forward, at a rate molstar accepts', async () => {
  const { plugin, log } = trajectoryStandIn({
    trajectories: [{ frames: 10, shown: 0 }],
  });

  await setTrajectoryPlayback(plugin, true, 200);

  expect(log).toStrictEqual(['play loop forward sequential at 60 fps']);
});

test('a trajectory of one frame never plays, and stops what was playing', async () => {
  const { plugin, log } = trajectoryStandIn({
    trajectories: [{ frames: 1, shown: 0 }],
    animating: true,
  });

  await setTrajectoryPlayback(plugin, true, 25);

  expect(log).toStrictEqual(['stop']);
});

test('playback turned off stops the frames where they stand', async () => {
  const { plugin, log, shownFrames } = trajectoryStandIn({
    trajectories: [{ frames: 10, shown: 7 }],
    animating: true,
  });

  await setTrajectoryPlayback(plugin, false, 25);

  expect(log).toStrictEqual(['stop']);
  expect(shownFrames()).toStrictEqual([7]);
});

test('stopping frames that are not playing asks molstar for nothing', async () => {
  const { plugin, log } = trajectoryStandIn({
    trajectories: [{ frames: 10, shown: 0 }],
  });

  await stopTrajectory(plugin);

  expect(log).toStrictEqual([]);
});
