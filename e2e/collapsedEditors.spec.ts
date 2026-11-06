import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { openStory } from './story.ts';

const NARROW = { width: 700, height: 700 };
const WIDE = { width: 1280, height: 700 };

const EDITORS = [
  { name: 'infrared', story: 'infrared-ireditor--bands' },
  { name: 'mass', story: 'mass-masseditor--peak-tables' },
];

async function boxOf(page: Page, selector: string) {
  const box = await page.locator(selector).first().boundingBox();
  if (!box) throw new Error(`${selector} is not on the page.`);
  return box;
}

for (const { name, story } of EDITORS) {
  test(`a narrow window leaves the ${name} chart the whole row`, async ({
    page,
  }) => {
    await page.setViewportSize(NARROW);
    await openStory(page, story);

    await expect(page.locator('.panel-row')).toBeVisible();
    await expect(page.locator('.panel-row__drawer')).toHaveCount(0);
    const chart = await boxOf(page, '.panel-row__view');
    expect(chart.width).toBeGreaterThan(550);
    expect(chart.height).toBeGreaterThan(300);
    await expect(page.locator('.panel-row__view svg').first()).toBeVisible();
  });

  test(`the ${name} rail brings one panel over the whole row, then sends it away`, async ({
    page,
  }) => {
    await page.setViewportSize(NARROW);
    await openStory(page, story);
    const spectra = page.locator('[data-panel-id="spectra"]');
    const drawer = page.locator('.panel-row__drawer');

    await spectra.click();

    await expect(drawer.locator('.side-panel__fold')).toHaveCount(1);
    expect(await boxOf(page, '.panel-row__drawer')).toStrictEqual(
      await boxOf(page, '.panel-row'),
    );

    await spectra.click();

    await expect(drawer).toHaveCount(0);
  });

  test(`a wider window gives the ${name} viewer its side back, with the panel on screen`, async ({
    page,
  }) => {
    await page.setViewportSize(NARROW);
    await openStory(page, story);
    await page.locator('[data-panel-id="metadata"]').click();
    await expect(page.locator('.panel-row__drawer')).toBeVisible();

    await page.setViewportSize(WIDE);

    await expect(page.locator('.panel-row')).toHaveCount(0);
    const open = page.locator('.side-panel__fold');
    await expect(open).not.toHaveCount(0);
    await expect(page.locator('[data-panel-id="metadata"]')).toHaveClass(
      /active/,
    );
  });
}
