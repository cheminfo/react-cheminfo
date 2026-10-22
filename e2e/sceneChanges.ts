import type { Page } from '@playwright/test';

import type { Ink, SceneShot } from './sceneInk.ts';

/** How many GL buffers the page has made and freed since it opened. */
export interface GpuBuffers {
  /** Buffers created. */
  created: number;
  /** Buffers deleted. */
  deleted: number;
}

/**
 * Count every GL buffer the page creates and deletes, from before its first
 * script runs. Pass it to `page.addInitScript`.
 *
 * This is what building or tearing down a drawing costs: molstar keeps the
 * geometry of each representation in buffers of its own, created when it is
 * drawn and deleted when it goes, while the hover, the selection and a
 * repaint only rewrite textures — so a model kept on screen makes and frees
 * none.
 */
export function countGpuBuffers(): void {
  const counts: GpuBuffers = { created: 0, deleted: 0 };
  Object.defineProperty(globalThis, 'gpuBuffers', { value: counts });
  const prototype = WebGL2RenderingContext.prototype;
  const counted = [
    ['createBuffer', 'created'],
    ['deleteBuffer', 'deleted'],
  ] as const;
  for (const [method, count] of counted) {
    const original: unknown = Reflect.get(prototype, method);
    if (typeof original !== 'function') continue;
    const counting = new Proxy(original, {
      apply(target, context, parameters) {
        counts[count]++;
        return Reflect.apply(target, context, parameters) as unknown;
      },
    });
    Reflect.set(prototype, method, counting);
  }
}

/**
 * The counts {@link countGpuBuffers} keeps.
 * @param page - A page it was installed in.
 * @returns The counts so far.
 */
export function gpuBuffers(page: Page): Promise<GpuBuffers> {
  return page.evaluate(() => ({
    ...(globalThis as unknown as { gpuBuffers: GpuBuffers }).gpuBuffers,
  }));
}

/**
 * The pixels where two pictures of the scene differ by more than `threshold`.
 * @param page - Any page: it decodes the pictures.
 * @param first - One picture.
 * @param second - The other, of the same size.
 * @param threshold - The largest difference still read as the same pixel, as
 * a sum over red, green and blue.
 * @returns Every pixel that differs by more, as `y * width + x`.
 */
export async function changedPixels(
  page: Page,
  first: SceneShot,
  second: SceneShot,
  threshold: number,
): Promise<Ink> {
  const { width, pixels } = await page.evaluate(
    async ({ pictures, most }) => {
      const decoded = await Promise.all(
        pictures.map(async (png) => {
          const response = await fetch(`data:image/png;base64,${png}`);
          const blob = await response.blob();
          const bitmap = await globalThis.createImageBitmap(blob);
          const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
          const context = canvas.getContext('2d');
          if (context === null) throw new Error('no 2D context to read with');
          context.drawImage(bitmap, 0, 0);
          const { data } = context.getImageData(
            0,
            0,
            bitmap.width,
            bitmap.height,
          );
          return { width: bitmap.width, data };
        }),
      );
      const [one, other] = decoded;
      if (one === undefined || other === undefined) {
        throw new Error('two pictures are needed');
      }
      const differing: number[] = [];
      for (let index = 0; index * 4 < one.data.length; index++) {
        let difference = 0;
        for (let channel = index * 4; channel < index * 4 + 3; channel++) {
          difference += Math.abs(
            (one.data[channel] ?? 0) - (other.data[channel] ?? 0),
          );
        }
        if (difference > most) differing.push(index);
      }
      return { width: one.width, pixels: differing };
    },
    {
      pictures: [first.png.toString('base64'), second.png.toString('base64')],
      most: threshold,
    },
  );
  return { width, pixels: new Set(pixels) };
}
