/**
 * The story of the viewer beside the rows of a geometry card, as the specs
 * open it and read it.
 */

import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

import type { SceneShot } from './sceneInk.ts';
import { inkOf, settledScene } from './sceneInk.ts';
import { openStory } from './story.ts';

/**
 * Open the story and wait for molstar's canvas.
 * @param page - The page to open it in.
 * @returns The canvas, and the accent the story's site paints highlights in.
 */
export async function openViewer(
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
  return { canvas, accent };
}

/**
 * The scene once the highlight the story opens on is drawn, whenever the
 * molecule arrives.
 * @param page - The page showing the story.
 * @param canvas - molstar's canvas.
 * @param accent - The colour of the highlight.
 * @param name - The name to keep the picture under, for a reader to look at.
 * @default name undefined — the picture is not kept
 * @returns The picture.
 */
export async function litScene(
  page: Page,
  canvas: Locator,
  accent: string,
  name?: string,
): Promise<SceneShot> {
  await expect
    .poll(
      async () => {
        const ink = await inkOf(page, await settledScene(page, canvas), accent);
        return ink.pixels.size;
      },
      { timeout: 60_000 },
    )
    .toBeGreaterThan(0);
  return settledScene(
    page,
    canvas,
    name === undefined ? undefined : `test-results/${name}.png`,
  );
}

/**
 * One row of the story's geometry.
 * @param page - The page showing the story.
 * @param label - What the row says.
 * @returns Its button.
 */
export function row(page: Page, label: string): Locator {
  return page
    .getByRole('group', { name: 'Geometry' })
    .getByRole('button', { name: label, exact: true });
}
