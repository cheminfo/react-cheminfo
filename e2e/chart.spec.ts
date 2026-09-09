import type { Locator, Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { openStory } from './story.ts';

// The "what differs" tab, which is three tracked line charts over the four
// measurements the iris model was fitted on.
const PANELS = 'projection-pcaviewer--what-differs';

// The four columns of the iris table, in the order the model was handed them.
const MEASUREMENTS = [
  'Sepal length',
  'Sepal width',
  'Petal length',
  'Petal width',
];

// What the sliding rectangle is announced as before the pointer has entered a
// slot: the first panel names no axis, so it falls back to the plain word.
const NOTHING_TRACKED = 'Measurements';

/**
 * The first panel — the one drawing the strongest component.
 * @param page - The page showing the panels.
 * @returns The panel.
 */
function panel(page: Page): Locator {
  return page.locator('.chart-frame').first();
}

/**
 * The layer holding the slot names, the crosshair and the markers. It is the
 * one drawn to fill its parent, where the frame's own is sized in pixels.
 * @param page - The page showing the panels.
 * @returns The layer.
 */
function tracking(page: Page): Locator {
  return panel(page).locator('svg[width="100%"]');
}

/**
 * The transparent rectangle the pointer is read from.
 * @param page - The page showing the panels.
 * @returns The rectangle.
 */
function slider(page: Page): Locator {
  return tracking(page).locator('rect[fill="transparent"]');
}

/**
 * The rectangle the slots are laid across, in page pixels.
 * @param page - The page showing the panels.
 * @returns The box, as Playwright reports it.
 */
async function plotBox(page: Page) {
  const box = await slider(page).boundingBox();
  if (box === null) throw new Error('the chart has not been laid out');
  return box;
}

test('the axis writes every measurement under the chart', async ({ page }) => {
  await openStory(page, PANELS);

  // Four names fit at this width, so every slot is written rather than every
  // nth one; the vertical axis names what the panel is drawn in.
  await expect(tracking(page).locator('.chart-axis-bottom text')).toHaveText(
    MEASUREMENTS,
  );
  await expect(panel(page).locator('.chart-axis-left text').last()).toHaveText(
    'Size (cm)',
  );
});

test('moving the pointer across the chart reports the slot under it', async ({
  page,
}) => {
  await openStory(page, PANELS);
  await expect(slider(page)).toHaveAttribute('aria-label', NOTHING_TRACKED);
  await expect(tracking(page).locator('path')).toHaveCount(0);

  const box = await plotBox(page);
  // The third of four slots, whose middle sits five eighths along the axis.
  await page.mouse.move(box.x + box.width * 0.625, box.y + box.height / 2);

  await expect(slider(page)).toHaveAttribute(
    'aria-label',
    'Measurement Petal length',
  );
  // The crosshair is the only path the tracking layer draws.
  await expect(tracking(page).locator('path')).toHaveCount(1);
  // One marker per drawn series: the average sample, and the two ends this
  // component pushes it to.
  await expect(tracking(page).locator('circle')).toHaveCount(3);

  await page.mouse.move(box.x + box.width * 0.125, box.y + box.height / 2);
  await expect(slider(page)).toHaveAttribute(
    'aria-label',
    'Measurement Sepal length',
  );
});

test('leaving the chart clears what it was reporting', async ({ page }) => {
  await openStory(page, PANELS);
  const box = await plotBox(page);
  await page.mouse.move(box.x + box.width * 0.625, box.y + box.height / 2);
  await expect(slider(page)).toHaveAttribute(
    'aria-label',
    'Measurement Petal length',
  );

  // Left of the plot is inside the figure but outside the slots.
  await page.mouse.move(box.x - 20, box.y + box.height / 2);

  await expect(slider(page)).toHaveAttribute('aria-label', NOTHING_TRACKED);
  await expect(tracking(page).locator('path')).toHaveCount(0);
  await expect(tracking(page).locator('circle')).toHaveCount(0);
});
