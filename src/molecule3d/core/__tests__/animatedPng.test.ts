import { convertIndexedToRgb, decodeApng } from 'fast-png';
import { expect, test } from 'vitest';

import type { RgbaFrame } from '../animatedPng.ts';
import { encodeAnimatedPng } from '../animatedPng.ts';

const RED = [255, 0, 0, 255];
const GREEN = [0, 255, 0, 255];
const BLUE = [0, 0, 255, 255];

test('three frames loop forever, each shown for a twenty-fifth of a second', async () => {
  const bytes = await encodeAnimatedPng(
    [frame(RED, GREEN), frame(GREEN, BLUE), frame(BLUE, RED)],
    25,
  );

  const image = decodeApng(bytes);

  expect(image.numberOfFrames).toBe(3);
  // 0 plays: forever.
  expect(image.numberOfPlays).toBe(0);
  expect(
    image.frames.map((each) => each.delayNumber / each.delayDenominator),
  ).toStrictEqual([0.04, 0.04, 0.04]);
  expect(pixels(bytes)).toStrictEqual([
    [255, 0, 0, 0, 255, 0],
    [0, 255, 0, 0, 0, 255],
    [0, 0, 255, 255, 0, 0],
  ]);
});

test('every byte survives, a frame read from a larger buffer included', async () => {
  const shared = new Uint8ClampedArray([9, ...RED, ...GREEN]);
  const offset: RgbaFrame = { width: 2, height: 1, data: shared.subarray(1) };

  const bytes = await encodeAnimatedPng([offset, frame(GREEN, RED)], 10);

  expect(
    decodeApng(bytes).frames.map(
      (each) => each.delayNumber / each.delayDenominator,
    ),
  ).toStrictEqual([0.1, 0.1]);
  expect(pixels(bytes)).toStrictEqual([
    [255, 0, 0, 0, 255, 0],
    [0, 255, 0, 255, 0, 0],
  ]);
});

test('no frame is refused', async () => {
  await expect(encodeAnimatedPng([], 25)).rejects.toThrow(
    'There is no frame to encode.',
  );
});

test('frames of two sizes are refused', async () => {
  const small: RgbaFrame = { width: 1, height: 1, data: new Uint8Array(RED) };

  await expect(
    encodeAnimatedPng([frame(RED, GREEN), small], 25),
  ).rejects.toThrow('Every frame of an animated PNG must be the same size.');
});

function frame(left: number[], right: number[]): RgbaFrame {
  return {
    width: 2,
    height: 1,
    data: new Uint8ClampedArray([...left, ...right]),
  };
}

/**
 * The RGB bytes of every frame, read back by fast-png: three opaque colours
 * are written as a palette.
 * @param bytes - The animated PNG.
 * @returns One array of RGB bytes per frame.
 */
function pixels(bytes: Uint8Array): number[][] {
  const image = decodeApng(bytes);
  return image.frames.map((each) =>
    Array.from(convertIndexedToRgb({ ...image, data: each.data })),
  );
}
