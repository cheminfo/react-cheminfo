import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

import { parseHexColor } from '../src/color/core/hex.ts';
import { rgbToHsv } from '../src/color/core/hsv.ts';

/** The pixels of a picture of the scene painted in one colour, lit or not. */
export interface Ink {
  /** Width of the picture, so a pixel index can be turned back into a place. */
  width: number;
  /** Every pixel painted in the colour, as `y * width + x`. */
  pixels: ReadonlySet<number>;
}

/** A picture of the scene, and where it was taken on the page. */
export interface SceneShot {
  /** The PNG, as the screenshot wrote it. */
  png: Buffer;
  /** Page coordinate of the picture's left edge. */
  left: number;
  /** Page coordinate of its top edge. */
  top: number;
}

/**
 * The width the toolbars over the canvas take, which a picture of the scene
 * leaves out: an active tool is drawn in a blue of its own.
 */
const TOOLBAR_WIDTH = 48;

/**
 * A picture of the scene once it has stopped changing.
 *
 * molstar keeps refining a still scene for a few frames after a change, so a
 * picture is only worth comparing once two in a row agree.
 * @param page - The page showing the viewer.
 * @param canvas - molstar's canvas.
 * @param path - Where to keep the picture, for a reader to look at.
 * @default path undefined — the picture is not kept
 * @returns The picture, and where it lies on the page.
 */
export async function settledScene(
  page: Page,
  canvas: Locator,
  path?: string,
): Promise<SceneShot> {
  const box = await canvas.boundingBox();
  if (box === null) throw new Error('the viewer drew no canvas');
  const clip = {
    x: box.x + TOOLBAR_WIDTH,
    y: box.y,
    width: box.width - TOOLBAR_WIDTH,
    height: box.height,
  };
  let previous = await page.screenshot({ clip });
  await expect(async () => {
    const next = await page.screenshot({ clip });
    const settled = next.equals(previous);
    previous = next;
    expect(settled).toBe(true);
  }).toPass({ intervals: [250], timeout: 15_000 });
  if (path !== undefined) {
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, previous);
  }
  return { png: previous, left: clip.x, top: clip.y };
}

/**
 * The pixels of a picture painted in `color`, however the scene lights them.
 *
 * The canvas shades a colour from dark to light across a sphere, so a pixel is
 * read as the colour when it has its hue and enough of its saturation; the
 * element colours of a model — grey carbon, white hydrogen, red oxygen — never
 * do for a blue, a teal or a violet.
 * @param page - Any page: it decodes the picture.
 * @param shot - The picture.
 * @param color - The colour, as `#rrggbb`.
 * @returns The pixels painted in it.
 */
export async function inkOf(
  page: Page,
  shot: SceneShot,
  color: string,
): Promise<Ink> {
  const { width, pixels } = await page.evaluate(
    async ({ png, hue }) => {
      const response = await fetch(`data:image/png;base64,${png}`);
      const bitmap = await globalThis.createImageBitmap(await response.blob());
      const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
      const context = canvas.getContext('2d');
      if (context === null) throw new Error('no 2D context to read with');
      context.drawImage(bitmap, 0, 0);
      const { data } = context.getImageData(0, 0, bitmap.width, bitmap.height);
      const painted: number[] = [];
      for (let index = 0; index * 4 < data.length; index++) {
        const red = data[index * 4] ?? 0;
        const green = data[index * 4 + 1] ?? 0;
        const blue = data[index * 4 + 2] ?? 0;
        const max = Math.max(red, green, blue);
        const range = max - Math.min(red, green, blue);
        // Too grey, or too dark, to have a hue worth reading.
        if (range <= 0.35 * max || max <= 38) continue;
        let sector = (red - green) / range + 4;
        if (max === red) sector = ((green - blue) / range + 6) % 6;
        else if (max === green) sector = (blue - red) / range + 2;
        const turn = Math.abs(sector * 60 - hue);
        if (Math.min(turn, 360 - turn) < 20) painted.push(index);
      }
      return { width: bitmap.width, pixels: painted };
    },
    {
      png: shot.png.toString('base64'),
      hue: rgbToHsv(parseHexColor(color)).hue,
    },
  );
  return { width, pixels: new Set(pixels) };
}

/**
 * How far apart two pictures of the scene are, at the pixel they differ most.
 *
 * Two pictures of one still scene are the same to the byte, but molstar
 * refines the picture around where the pointer last marked something, so a
 * scene the pointer has left differs from its earlier picture by a few levels
 * of a channel where a mark stood.
 * @param page - Any page: it decodes the pictures.
 * @param first - One picture.
 * @param second - The other, of the same size.
 * @returns The largest sum, over red, green and blue, of the differences of a
 * pixel's channels: 0 for the same picture, 765 for black against white.
 */
export async function largestDifference(
  page: Page,
  first: SceneShot,
  second: SceneShot,
): Promise<number> {
  return page.evaluate(
    async (pictures) => {
      const [one, other] = await Promise.all(
        pictures.map(async (png) => {
          const response = await fetch(`data:image/png;base64,${png}`);
          const blob = await response.blob();
          const bitmap = await globalThis.createImageBitmap(blob);
          const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
          const context = canvas.getContext('2d');
          if (context === null) throw new Error('no 2D context to read with');
          context.drawImage(bitmap, 0, 0);
          return context.getImageData(0, 0, bitmap.width, bitmap.height).data;
        }),
      );
      if (one === undefined || other === undefined) return Number.NaN;
      let largest = 0;
      for (let index = 0; index < one.length; index += 4) {
        let difference = 0;
        for (let channel = index; channel < index + 3; channel++) {
          difference += Math.abs((one[channel] ?? 0) - (other[channel] ?? 0));
        }
        if (difference > largest) largest = difference;
      }
      return largest;
    },
    [first.png.toString('base64'), second.png.toString('base64')],
  );
}

/**
 * How many pixels of `ink` none of `others` paints.
 * @param ink - The pixels counted.
 * @param others - The pixels taken away.
 * @returns The count.
 */
export function inkOutside(ink: Ink, ...others: readonly Ink[]): number {
  let count = 0;
  for (const pixel of ink.pixels) {
    let elsewhere = false;
    for (const other of others) {
      if (other.pixels.has(pixel)) elsewhere = true;
    }
    if (!elsewhere) count++;
  }
  return count;
}

/**
 * The pixels of the ink deepest inside it, top first: those a disc of `radius`
 * around them lies wholly in, which puts them inside an atom rather than on a
 * thin bond or an edge.
 * @param ink - The pixels painted.
 * @param radius - Radius of the disc, pixels.
 * @returns Their places, in picture coordinates, from top to bottom.
 */
export function inkCores(
  ink: Ink,
  radius: number,
): Array<{ x: number; y: number }> {
  const cores: Array<{ x: number; y: number }> = [];
  for (const pixel of ink.pixels) {
    const x = pixel % ink.width;
    const y = (pixel - x) / ink.width;
    let inside = true;
    for (let dy = -radius; dy <= radius && inside; dy++) {
      for (let dx = -radius; dx <= radius && inside; dx++) {
        if (dx * dx + dy * dy > radius * radius) continue;
        const column = x + dx;
        inside =
          column >= 0 &&
          column < ink.width &&
          ink.pixels.has((y + dy) * ink.width + column);
      }
    }
    if (inside) cores.push({ x, y });
  }
  return cores.toSorted((first, second) => first.y - second.y);
}
