/**
 * Reading what a WebGL canvas is showing, from a browser suite.
 *
 * Every unit test stops at the boundary of the GPU, so nothing else can tell a
 * scene built right from a blank rectangle. The canvas is reduced to a small
 * luminance fingerprint: a canvas that never painted is one flat colour, and a
 * scene that changed moves a measurable share of the samples.
 *
 * The screenshot goes through the compositor, so it works whether or not the
 * viewer keeps its drawing buffer: `toDataURL()` on a WebGL canvas created
 * without `preserveDrawingBuffer` returns a blank frame.
 */

import type { Locator, Page } from '@playwright/test';
import { xMinMaxValues } from 'ml-spectra-processing';

/** The canvas is reduced to this many luminance samples per side. */
export const CANVAS_SIGNATURE_SIZE = 32;

/** Luminance steps (0–255) two samples must differ by to count as changed. */
export const CANVAS_CHANGE_THRESHOLD = 6;

/**
 * A 32×32 luminance fingerprint of what the canvas is showing.
 * @param page - The page the canvas lives in.
 * @param canvas - The canvas element.
 * @returns One luminance value per sample, row by row.
 */
export async function canvasSignature(
  page: Page,
  canvas: Locator,
): Promise<number[]> {
  const shot = await canvas.screenshot();
  return page.evaluate(
    async ([dataUrl, size]) => {
      const response = await fetch(dataUrl as string);
      const bitmap = await globalThis.createImageBitmap(await response.blob());
      const side = Number(size);
      const surface = document.createElement('canvas');
      surface.width = side;
      surface.height = side;
      const context = surface.getContext('2d');
      if (context === null) return [];
      context.drawImage(bitmap, 0, 0, side, side);
      const { data } = context.getImageData(0, 0, side, side);
      const luminance: number[] = [];
      for (let index = 0; index < data.length; index += 4) {
        luminance.push(
          0.2126 * (data[index] ?? 0) +
            0.7152 * (data[index + 1] ?? 0) +
            0.0722 * (data[index + 2] ?? 0),
        );
      }
      return luminance;
    },
    [
      `data:image/png;base64,${shot.toString('base64')}`,
      String(CANVAS_SIGNATURE_SIZE),
    ],
  );
}

/**
 * Take a fingerprint every second until the canvas shows more than one colour,
 * or the time runs out.
 * @param page - The page the canvas lives in.
 * @param canvas - The canvas element.
 * @param timeoutMs - How long to keep waiting.
 * @returns The last fingerprint taken, painted or not.
 */
export async function waitForCanvasPaint(
  page: Page,
  canvas: Locator,
  timeoutMs: number,
): Promise<number[]> {
  const deadline = Date.now() + timeoutMs;
  const next = async (signature: number[]): Promise<number[]> => {
    if (Date.now() >= deadline || signatureLevels(signature) >= 6) {
      return signature;
    }
    await page.waitForTimeout(1000);
    return next(await canvasSignature(page, canvas));
  };
  return next(await canvasSignature(page, canvas));
}

/**
 * Take a fingerprint every second until two in a row agree, so a camera
 * transition is not mistaken for the effect of a click.
 * @param page - The page the canvas lives in.
 * @param canvas - The canvas element.
 * @param start - The fingerprint to start comparing from.
 * @returns The settled fingerprint.
 * @throws {Error} When fifteen seconds pass without two agreeing.
 */
export async function waitForStableCanvas(
  page: Page,
  canvas: Locator,
  start: number[],
): Promise<number[]> {
  const next = async (previous: number[], left: number): Promise<number[]> => {
    if (left === 0) {
      throw new Error(
        'The scene kept moving on its own, so the effect of a click cannot be told apart from an animation.',
      );
    }
    await page.waitForTimeout(1000);
    const current = await canvasSignature(page, canvas);
    if (changedFraction(previous, current) < 0.01) return current;
    return next(current, left - 1);
  };
  return next(start, 15);
}

/**
 * Take a fingerprint every half second until the canvas differs from `before`,
 * or the time runs out.
 * @param page - The page the canvas lives in.
 * @param canvas - The canvas element.
 * @param before - The fingerprint to differ from.
 * @param timeoutMs - How long to keep waiting.
 * @returns The last fingerprint taken.
 */
export async function waitForCanvasChange(
  page: Page,
  canvas: Locator,
  before: number[],
  timeoutMs: number,
): Promise<number[]> {
  const deadline = Date.now() + timeoutMs;
  const next = async (current: number[]): Promise<number[]> => {
    if (Date.now() >= deadline || changedFraction(before, current) > 0.02) {
      return current;
    }
    await page.waitForTimeout(500);
    return next(await canvasSignature(page, canvas));
  };
  return next(await canvasSignature(page, canvas));
}

/**
 * Wait until a viewer has acted on where the pointer now rests. molstar picks
 * what lies under the pointer in its render loop and reports the pick a frame
 * or more later, so the wait is counted in frames the page has drawn — eight,
 * over at least a tenth of a second — which a loaded machine slows down with
 * it, and not in time, which it does not.
 * @param page - The page the viewer lives in.
 */
export async function waitForViewerPick(page: Page): Promise<void> {
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        let frames = 0;
        let first: number | undefined;
        const step = (time: number) => {
          first ??= time;
          frames++;
          if (frames >= 8 && time - first > 1000 / 10) resolve();
          else requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }),
  );
}

/**
 * How many distinct luminance steps of four a fingerprint holds.
 * @param signature - A fingerprint.
 * @returns The count; 1 is a blank canvas.
 */
export function signatureLevels(signature: number[]): number {
  const levels = new Set<number>();
  for (let index = 0; index < signature.length; index++) {
    levels.add(Math.round((signature[index] ?? 0) / 4));
  }
  return levels.size;
}

/**
 * The peak-to-peak luminance of a fingerprint.
 * @param signature - A fingerprint.
 * @returns The range, 0 on a uniform frame or an empty fingerprint.
 */
export function signatureSpread(signature: number[]): number {
  if (signature.length === 0) return 0;
  const { min, max } = xMinMaxValues(signature);
  return max - min;
}

/**
 * The share of samples that moved by more than
 * {@link CANVAS_CHANGE_THRESHOLD} between two fingerprints.
 * @param before - The fingerprint taken first.
 * @param after - The fingerprint taken second.
 * @returns A fraction between 0 and 1; 1 when they cannot be compared.
 */
export function changedFraction(before: number[], after: number[]): number {
  if (before.length === 0 || before.length !== after.length) return 1;
  let changed = 0;
  for (let index = 0; index < before.length; index++) {
    const step = Math.abs((before[index] ?? 0) - (after[index] ?? 0));
    if (step > CANVAS_CHANGE_THRESHOLD) changed++;
  }
  return changed / before.length;
}
