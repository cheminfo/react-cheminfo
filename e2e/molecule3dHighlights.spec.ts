import type { Locator, Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import type { SceneShot } from './sceneInk.ts';
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

/** The row the story opens on. */
const C_H = 'C–H 1.093 Å ×6';

test('a row lights the model in the accent, and None gives the plain model back', async ({
  page,
}) => {
  // molstar's lazy chunk and a software-rendered scene outlast 30 s cold.
  test.setTimeout(120_000);
  const { canvas, accent } = await openViewer(page);
  const on = await litScene(page, canvas, accent, 'molecule3d-highlight-on');
  const lit = await inkOf(page, on, accent);

  await row(page, 'None').click();
  const off = await settledScene(
    page,
    canvas,
    'test-results/molecule3d-highlight-off.png',
  );
  const unlit = await inkOf(page, off, accent);

  expect(lit.pixels.size).toBeGreaterThan(500);
  expect(unlit.pixels.size).toBe(0);

  // Lit and cleared again, pixel for pixel the same: nothing was rebuilt and
  // the camera never moved.
  await row(page, C_H).click();
  const litAgain = await settledScene(page, canvas);
  await row(page, 'None').click();
  const offAgain = await settledScene(page, canvas);

  expect(litAgain.png.equals(on.png)).toBe(true);
  expect(offAgain.png.equals(off.png)).toBe(true);
});

test('the C–H row leaves the C–C bonds between its carbons in their colours', async ({
  page,
}) => {
  test.setTimeout(120_000);
  const { canvas, accent } = await openViewer(page);
  const carbonHydrogen = await inkOf(
    page,
    await litScene(page, canvas, accent),
    accent,
  );

  await row(page, 'C–C 1.505 Å ×2').click();
  const carbonCarbon = await inkOf(
    page,
    await settledScene(
      page,
      canvas,
      'test-results/molecule3d-highlight-cc.png',
    ),
    accent,
  );
  await row(page, 'C=O 1.230 Å').click();
  const carbonyl = await inkOf(page, await settledScene(page, canvas), accent);

  // The C–H row lights the carbon at one end of each C–C bond, the C=O row
  // the one at the other end. Had either lit the half-bonds leaving its atoms,
  // the two together would cover the C–C bonds; they leave them to the C–C row.
  expect(inkOutside(carbonCarbon, carbonHydrogen, carbonyl)).toBeGreaterThan(
    carbonCarbon.pixels.size / 4,
  );
});

test('a highlight outlasts the hover, and the measuring tools work over it', async ({
  page,
}) => {
  test.setTimeout(120_000);
  const { canvas, accent } = await openViewer(page);
  const on = await litScene(page, canvas, accent);
  const lit = await inkOf(page, on, accent);
  // Deep inside the ink: inside a hydrogen at the top and one at the bottom.
  const cores = inkCores(lit, 6);
  const top = cores[0];
  const bottom = cores.at(-1);
  if (top === undefined || bottom === undefined) {
    throw new Error('no atom is lit');
  }

  // molstar reads the pointer off a picking buffer it draws when first asked,
  // so the pointer is nudged until the atom under it is marked.
  let hovered = on;
  await expect(async () => {
    await page.mouse.move(on.left + top.x + 1, on.top + top.y);
    await page.mouse.move(on.left + top.x, on.top + top.y);
    hovered = await settledScene(page, canvas);
    expect(await largestDifference(page, hovered, on)).toBeGreaterThan(100);
  }).toPass({ timeout: 20_000 });
  const hoveredInk = await inkOf(page, hovered, accent);

  // The mark of the hover sits over the highlight, which stays lit.
  expect(hoveredInk.pixels.size).toBeGreaterThan(lit.pixels.size / 2);

  const box = await canvas.boundingBox();
  if (box === null) throw new Error('the viewer drew no canvas');
  await page.mouse.move(box.x + box.width - 4, box.y + box.height - 4);
  const left = await settledScene(page, canvas);

  // The mark goes with the pointer, and the highlight is all that is left.
  expect(await largestDifference(page, left, on)).toBeLessThan(32);

  await page.getByRole('button', { name: 'Distance', exact: true }).click();
  await page.mouse.click(on.left + top.x, on.top + top.y);
  await page.mouse.click(on.left + bottom.x, on.top + bottom.y);

  await expect(
    page.getByRole('button', { name: 'Remove all measurements' }),
  ).toBeEnabled();

  const measured = await settledScene(
    page,
    canvas,
    'test-results/molecule3d-highlight-measured.png',
  );
  const measuredInk = await inkOf(page, measured, accent);

  expect(measuredInk.pixels.size).toBeGreaterThan(lit.pixels.size / 2);
});

test('a model restyled from the options comes up lit', async ({ page }) => {
  test.setTimeout(120_000);
  const { canvas, accent } = await openViewer(page);
  const ballAndStick = await litScene(page, canvas, accent);
  const panel = page.locator('.bp6-popover:not(.bp6-tooltip)');

  await page.getByRole('button', { name: 'Display options' }).click();
  await panel.getByText('Sticks', { exact: true }).click();
  await page.keyboard.press('Escape');
  await expect(panel).toHaveCount(0);
  const box = await canvas.boundingBox();
  if (box === null) throw new Error('the viewer drew no canvas');
  // Off the toolbar, whose tooltip would otherwise sit over the scene.
  await page.mouse.move(box.x + box.width - 4, box.y + box.height - 4);
  // The restyle draws a new model; wait for it rather than the old one.
  let sticks = ballAndStick;
  await expect(async () => {
    sticks = await settledScene(page, canvas);
    expect(await largestDifference(page, sticks, ballAndStick)).toBeGreaterThan(
      100,
    );
  }).toPass({ timeout: 30_000 });
  await settledScene(
    page,
    canvas,
    'test-results/molecule3d-highlight-sticks.png',
  );
  const sticksInk = await inkOf(page, sticks, accent);

  expect(sticksInk.pixels.size).toBeGreaterThan(500);
});

/**
 * Open the story and wait for molstar's canvas.
 * @param page - The page to open it in.
 * @returns The canvas, and the accent the story's site paints highlights in.
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
async function litScene(
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
function row(page: Page, label: string): Locator {
  return page
    .getByRole('group', { name: 'Geometry' })
    .getByRole('button', { name: label, exact: true });
}
