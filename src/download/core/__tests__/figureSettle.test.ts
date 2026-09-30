import { expect, test } from 'vitest';

import { settle } from '../figureSettle.ts';

/**
 * A figure that reports each reading in turn, one per frame, and then the last
 * one for ever.
 * @param readings - What it reports, frame by frame.
 * @returns The reading, and how many frames were taken.
 */
function drawing(readings: ReadonlyArray<string | null>) {
  let frames = 0;
  return {
    read: () => readings[Math.min(frames - 1, readings.length - 1)] ?? null,
    nextFrame: () => {
      frames++;
      return Promise.resolve();
    },
    frames: () => frames,
  };
}

test('a figure is taken once it has held still for two frames', async () => {
  const figure = drawing([null, null, '1:600×320', '2:766×320', '2:766×320']);
  await settle(figure.read, { nextFrame: figure.nextFrame });

  // Frames 5 and 6 read the same as the frame before each of them.
  expect(figure.frames()).toBe(6);
});

test('a figure that keeps changing is never taken early', async () => {
  const figure = drawing(['1:a', '2:a', '3:a', '4:a', '4:a', '4:a']);
  await settle(figure.read, { nextFrame: figure.nextFrame });

  expect(figure.frames()).toBe(6);
});

test('a figure that never draws is given up on', async () => {
  const figure = drawing([null]);

  await expect(
    settle(figure.read, { nextFrame: figure.nextFrame, maxFrames: 20 }),
  ).rejects.toThrow('The figure did not finish drawing, so nothing was saved.');
  expect(figure.frames()).toBe(20);
});

test('a wait that is stopped ends at the next frame', async () => {
  const figure = drawing([null]);
  const controller = new AbortController();
  controller.abort();

  await expect(
    settle(figure.read, {
      nextFrame: figure.nextFrame,
      signal: controller.signal,
    }),
  ).rejects.toThrow('The figure was not saved.');
  expect(figure.frames()).toBe(1);
});
