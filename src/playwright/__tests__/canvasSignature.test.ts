import type { Locator, Page } from '@playwright/test';
import { expect, test } from 'vitest';

import {
  CANVAS_SIGNATURE_SIZE,
  canvasSignature,
  changedFraction,
  signatureLevels,
  signatureSpread,
  waitForCanvasChange,
  waitForCanvasPaint,
  waitForStableCanvas,
} from '../canvasSignature.ts';

const BLANK = [240, 240, 240, 240];
const PAINTED = [10, 40, 80, 120, 160, 200, 240, 30];
/** The painted frame in negative: every sample moved far past the threshold. */
const MOVED = negative(PAINTED);

/**
 * A fingerprint in negative.
 * @param signature - The fingerprint.
 * @returns Each sample subtracted from 255.
 */
function negative(signature: number[]): number[] {
  const inverted: number[] = [];
  for (let index = 0; index < signature.length; index++) {
    inverted.push(255 - (signature[index] ?? 0));
  }
  return inverted;
}

/**
 * A page whose fingerprints are taken from a queue, and which records every
 * pause instead of taking it.
 * @param signatures - What each fingerprint reads, in order; the last repeats.
 * @returns The page, the canvas, and the pauses it was asked for.
 */
function viewer(signatures: number[][]) {
  const pauses: number[] = [];
  const asked: unknown[] = [];
  const page = {
    evaluate: async (_run: unknown, argument: unknown) => {
      asked.push(argument);
      return signatures.length > 1 ? signatures.shift() : signatures[0];
    },
    waitForTimeout: async (milliseconds: number) => {
      pauses.push(milliseconds);
    },
  } as unknown as Page;
  const canvas = {
    screenshot: async () => Buffer.from('png'),
  } as unknown as Locator;
  return { page, canvas, pauses, asked };
}

test('a fingerprint is taken off a screenshot, reduced to 32 samples a side', async () => {
  const { page, canvas, asked } = viewer([PAINTED]);

  await expect(canvasSignature(page, canvas)).resolves.toStrictEqual(PAINTED);
  expect(asked).toStrictEqual([
    [`data:image/png;base64,${Buffer.from('png').toString('base64')}`, '32'],
  ]);
  expect(CANVAS_SIGNATURE_SIZE).toBe(32);
});

test('a blank frame has one level, and its spread is nothing', () => {
  expect(signatureLevels(BLANK)).toBe(1);
  expect(signatureSpread(BLANK)).toBe(0);
  expect(signatureSpread([])).toBe(0);
  // 10, 40, 80, 120, 160, 200, 240 and 30 are eight steps of four apart.
  expect(signatureLevels(PAINTED)).toBe(8);
  expect(signatureSpread(PAINTED)).toBe(230);
});

test('a sample changed by more than six steps counts as changed', () => {
  expect(changedFraction([0, 0, 0, 0], [6, 7, 0, 20])).toBe(0.5);
  expect(changedFraction([], [])).toBe(1);
  expect(changedFraction([0, 0], [0, 0, 0])).toBe(1);
});

test('the paint is waited for a second at a time, and a painted frame ends the wait', async () => {
  const { page, canvas, pauses } = viewer([BLANK, BLANK, PAINTED]);

  await expect(waitForCanvasPaint(page, canvas, 60_000)).resolves.toStrictEqual(
    PAINTED,
  );
  expect(pauses).toStrictEqual([1000, 1000]);
});

test('a canvas still blank at the deadline is handed back as it is', async () => {
  const { page, canvas, pauses } = viewer([BLANK]);

  await expect(waitForCanvasPaint(page, canvas, 0)).resolves.toStrictEqual(
    BLANK,
  );
  expect(pauses).toStrictEqual([]);
});

test('two fingerprints in a row that agree settle the scene', async () => {
  const { page, canvas, pauses } = viewer([MOVED, PAINTED, PAINTED]);

  await expect(
    waitForStableCanvas(page, canvas, PAINTED),
  ).resolves.toStrictEqual(PAINTED);
  expect(pauses).toStrictEqual([1000, 1000, 1000]);
});

test('a scene that moves for fifteen seconds is an animation, and says so', async () => {
  const frames: number[][] = [];
  for (let index = 0; index < 16; index++) {
    frames.push(index % 2 === 0 ? MOVED : PAINTED);
  }
  const { page, canvas, pauses } = viewer(frames);

  await expect(waitForStableCanvas(page, canvas, PAINTED)).rejects.toThrow(
    'The scene kept moving on its own',
  );
  expect(pauses).toHaveLength(15);
});

test('a change is waited for half a second at a time', async () => {
  const { page, canvas, pauses } = viewer([PAINTED, MOVED]);

  await expect(
    waitForCanvasChange(page, canvas, PAINTED, 30_000),
  ).resolves.toStrictEqual(MOVED);
  expect(pauses).toStrictEqual([500]);
});
