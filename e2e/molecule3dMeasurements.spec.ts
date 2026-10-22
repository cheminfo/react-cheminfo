import type { Locator, Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { changedPixels, countGpuBuffers, gpuBuffers } from './sceneChanges.ts';
import type { Ink } from './sceneInk.ts';
import {
  inkCores,
  inkOf,
  inkOutside,
  largestDifference,
  settledScene,
} from './sceneInk.ts';
import { openStory } from './story.ts';

// molstar needs a real WebGL2 context, which headless Chromium only gets from
// the software renderer.
test.use({
  launchOptions: { args: ['--use-gl=angle', '--use-angle=swiftshader'] },
});

/**
 * How far a pixel may drift and still be read as the same: molstar refines the
 * picture where the pointer marked an atom, by a few levels of a channel.
 */
const SAME_PIXEL = 32;

/** Room around the two picked atoms for the label drawn between them. */
const LABEL_ROOM = 40;

test('a measurement from the picker comes and goes alone: the model stays built, lit, and where it was', async ({
  page,
}) => {
  // molstar's lazy chunk and a software-rendered scene outlast 30 s cold.
  test.setTimeout(120_000);
  await page.addInitScript(countGpuBuffers);
  const { canvas, accent } = await openViewer(page);
  const away = await cornerOf(canvas);
  await page.mouse.move(away.x, away.y);
  const before = await settledScene(
    page,
    canvas,
    'test-results/molecule3d-measurement-before.png',
  );
  const lit = await inkOf(page, before, accent);
  // Deep inside the ink: inside a hydrogen at the top and one at the bottom.
  const cores = inkCores(lit, 6);
  const top = cores[0];
  const bottom = cores.at(-1);
  if (top === undefined || bottom === undefined) {
    throw new Error('no atom is lit');
  }
  const remove = page.getByRole('button', { name: 'Remove all measurements' });
  const atStart = await gpuBuffers(page);

  await page.getByRole('button', { name: 'Distance', exact: true }).click();
  await page.mouse.click(before.left + top.x, before.top + top.y);
  await page.mouse.click(before.left + bottom.x, before.top + bottom.y);
  await expect(remove).toBeEnabled();
  await page.mouse.move(away.x, away.y);
  const measured = await settledScene(
    page,
    canvas,
    'test-results/molecule3d-measurement-added.png',
  );
  const afterAdding = await gpuBuffers(page);

  // The measurement is drawn, and nothing is torn down to draw it.
  const drawn = afterAdding.created - atStart.created;
  expect(drawn).toBeGreaterThan(0);
  expect(afterAdding.deleted - atStart.deleted).toBe(0);
  // Every pixel that changed is the measurement's own, between its atoms: the
  // camera did not move, and the highlight around it is untouched.
  const changed = await changedPixels(page, before, measured, SAME_PIXEL);
  const room = {
    left: Math.min(top.x, bottom.x) - LABEL_ROOM,
    right: Math.max(top.x, bottom.x) + LABEL_ROOM,
    top: Math.min(top.y, bottom.y) - LABEL_ROOM,
    bottom: Math.max(top.y, bottom.y) + LABEL_ROOM,
  };
  expect(changed.pixels.size).toBeGreaterThan(100);
  expect(pixelsOutside(changed, room)).toBe(0);

  // Clicked without the pointer: a button that turns disabled under it opens
  // its tooltip over the scene, and nothing ever closes it.
  await remove.dispatchEvent('click');
  await expect(remove).toBeDisabled();
  const cleared = await settledScene(
    page,
    canvas,
    'test-results/molecule3d-measurement-removed.png',
  );
  const afterRemoving = await gpuBuffers(page);

  // Removing it frees exactly what drawing it made, and builds nothing.
  expect(afterRemoving.created - afterAdding.created).toBe(0);
  expect(afterRemoving.deleted - afterAdding.deleted).toBe(drawn);
  // The scene is the one it was, the highlight lit as before.
  expect(await largestDifference(page, cleared, before)).toBeLessThan(
    SAME_PIXEL,
  );
  const relit = await inkOf(page, cleared, accent);
  expect(inkOutside(lit, relit)).toBe(0);
  expect(inkOutside(relit, lit)).toBe(0);
});

/**
 * Open the highlights story and wait for its lit model.
 * @param page - The page to open it in.
 * @returns molstar's canvas, and the accent the story paints highlights in.
 */
async function openViewer(
  page: Page,
): Promise<{ canvas: Locator; accent: string }> {
  await openStory(page, 'molecule3d-moleculeviewer3d--highlights');
  const canvas = page.locator('canvas').first();
  await expect(canvas).toBeVisible({ timeout: 60_000 });
  const accent = await page.evaluate(() =>
    globalThis
      .getComputedStyle(document.documentElement)
      .getPropertyValue('--accent')
      .trim(),
  );
  await expect
    .poll(
      async () => {
        const ink = await inkOf(page, await settledScene(page, canvas), accent);
        return ink.pixels.size;
      },
      { timeout: 60_000 },
    )
    .toBeGreaterThan(0);
  return { canvas, accent };
}

/**
 * A place for the pointer that marks nothing: the canvas's bottom right corner.
 * @param canvas - molstar's canvas.
 * @returns Its page coordinates.
 */
async function cornerOf(canvas: Locator): Promise<{ x: number; y: number }> {
  const box = await canvas.boundingBox();
  if (box === null) throw new Error('the viewer drew no canvas');
  return { x: box.x + box.width - 4, y: box.y + box.height - 4 };
}

/**
 * How many pixels lie outside a box.
 * @param ink - The pixels.
 * @param box - The box, in picture coordinates, edges included.
 * @param box.left - Its left edge.
 * @param box.right - Its right edge.
 * @param box.top - Its top edge.
 * @param box.bottom - Its bottom edge.
 * @returns The count.
 */
function pixelsOutside(
  ink: Ink,
  box: { left: number; right: number; top: number; bottom: number },
): number {
  let count = 0;
  for (const pixel of ink.pixels) {
    const x = pixel % ink.width;
    const y = (pixel - x) / ink.width;
    if (x < box.left || x > box.right || y < box.top || y > box.bottom) {
      count++;
    }
  }
  return count;
}
