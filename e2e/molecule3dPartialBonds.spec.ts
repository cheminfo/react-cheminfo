import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { changedPixels, countGpuBuffers, gpuBuffers } from './sceneChanges.ts';
import { largestDifference, settledScene } from './sceneInk.ts';
import { openStory } from './story.ts';

// molstar needs a real WebGL2 context, which headless Chromium only gets from
// the software renderer.
test.use({
  launchOptions: { args: ['--use-gl=angle', '--use-angle=swiftshader'] },
});

/** An open panel, never the tooltip of the button that opened it. */
const PANEL = '.bp6-popover:not(.bp6-tooltip)';

/** The largest difference, over red, green and blue, still one same pixel. */
const SAME_PIXEL = 32;

test('a transition state is drawn with its forming bonds, which the options take away', async ({
  page,
}) => {
  // molstar's lazy chunk and a software-rendered scene outlast 30 s cold.
  test.setTimeout(120_000);
  const before = await openScene(
    page,
    'diels-alder',
    'test-results/molecule3d-partial-bonds.png',
  );

  const after = await switchOff(
    page,
    'test-results/molecule3d-partial-bonds-off.png',
  );

  // The dashes and their two labels were most of what changed.
  const changed = await changedPixels(page, before, after, SAME_PIXEL);
  expect(changed.pixels.size).toBeGreaterThan(500);
});

test('an ordinary molecule read from XYZ has none to take away', async ({
  page,
}) => {
  test.setTimeout(120_000);
  const before = await openScene(page, 'benzene');

  const after = await switchOff(page);

  expect(await largestDifference(page, before, after)).toBeLessThan(SAME_PIXEL);
});

async function openScene(page: Page, story: string, path?: string) {
  await page.addInitScript(countGpuBuffers);
  await openStory(page, `molecule3d-partialbonds--${story}`);
  const canvas = page.getByTestId('molecule3d').locator('canvas');
  await expect(canvas).toBeVisible({ timeout: 60_000 });
  return settledScene(page, canvas, path);
}

/**
 * Switch the partial bonds off from the options, and wait for the model to be
 * drawn again without them.
 * @param page - The page showing the viewer.
 * @param path - Where to keep the picture, for a reader to look at.
 * @default path undefined — the picture is not kept
 * @returns The scene, once settled.
 */
async function switchOff(page: Page, path?: string) {
  const canvas = page.getByTestId('molecule3d').locator('canvas');
  await page.getByRole('button', { name: 'Display options' }).click();
  const options = page.locator(PANEL);
  const toggle = options.getByTestId('molecule3d-partial-bonds');
  await expect(toggle).toBeChecked();
  const atStart = await gpuBuffers(page);

  await options.getByText('Partial bonds', { exact: true }).click();
  await expect(toggle).not.toBeChecked();
  await page.keyboard.press('Escape');
  await expect(options).toHaveCount(0);

  // A new style draws the model again, which builds its geometry anew.
  await expect
    .poll(
      async () => {
        const { created } = await gpuBuffers(page);
        return created - atStart.created;
      },
      { timeout: 30_000 },
    )
    .toBeGreaterThan(0);
  return settledScene(page, canvas, path);
}
