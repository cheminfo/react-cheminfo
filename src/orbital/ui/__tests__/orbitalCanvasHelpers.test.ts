import { expect, test } from 'vitest';

import { fitAxes, resolutionKey } from '../orbitalCanvasHelpers.ts';

/**
 * A viewer that records what it was asked, and whose frame reaches as far as
 * it is told to.
 * @param frameReach - What `showAxes` answers.
 * @returns The viewer and the calls it received.
 */
function recordingViewer(frameReach: number | undefined) {
  const calls: string[] = [];
  const viewer = {
    hideAxes: async () => {
      calls.push('hide');
    },
    showAxes: async (reach: number) => {
      calls.push(`show ${reach}`);
      return frameReach;
    },
  };
  return { viewer, calls };
}

test('the frame widens what the camera fits to the reach it draws at', async () => {
  const { viewer, calls } = recordingViewer(3.5);

  await expect(fitAxes(viewer, 2, true)).resolves.toBe(3.5);
  expect(calls).toStrictEqual(['show 2']);
});

test('a frame that reports no reach leaves the surface reach alone', async () => {
  const { viewer, calls } = recordingViewer(undefined);

  await expect(fitAxes(viewer, 2, true)).resolves.toBe(2);
  expect(calls).toStrictEqual(['show 2']);
});

test('no frame is drawn before there is a surface to draw it around', async () => {
  const { viewer, calls } = recordingViewer(3.5);

  await expect(fitAxes(viewer, undefined, true)).resolves.toBeUndefined();
  expect(calls).toStrictEqual([]);
});

test('switching the frame off removes it and fits the surface alone', async () => {
  const { viewer, calls } = recordingViewer(3.5);

  await expect(fitAxes(viewer, 2, false)).resolves.toBe(2);
  expect(calls).toStrictEqual(['hide']);
});

test('the resolution key changes exactly when the sampling would', () => {
  expect(resolutionKey(48)).toBe('48');
  expect(resolutionKey({ floor: 24, cap: 96 })).toBe('24-96');
  expect(resolutionKey({ floor: 24, cap: 96 })).toBe(
    resolutionKey({ cap: 96, floor: 24 }),
  );
});
