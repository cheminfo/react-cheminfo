/**
 * The 32-column table is the 18-column one with the f block set back in its
 * periods: the cells keep their shape, only narrower, and the two series sit
 * between groups 2 and 3 rather than underneath.
 */

import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { openStory } from './story.ts';

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

async function boxOf(page: Page, symbol: string): Promise<Box> {
  const box = await page.getByTestId(`element-${symbol}`).boundingBox();
  if (box === null) throw new Error(`no cell for ${symbol}`);
  return box;
}

async function cellShape(
  page: Page,
  story: string,
): Promise<{ heightPerWidth: number; symbolPerCell: number }> {
  await openStory(page, story);
  await expect(page.getByTestId('element-Fe')).toBeVisible();
  await expect(page.locator('[data-measured]')).toHaveCount(1);
  return page.evaluate(() => {
    const cell = document.querySelector('[data-testid="element-Fe"]');
    // The second span of a cell is its symbol; the first is the atomic number.
    const symbol = cell?.querySelectorAll('span')[1];
    if (cell === null || symbol === undefined) throw new Error('no cell');
    const box = cell.getBoundingClientRect();
    return {
      heightPerWidth: box.height / box.width,
      symbolPerCell: symbol.getBoundingClientRect().width / box.width,
    };
  });
}

test('the two series stand in periods 6 and 7, lutetium under yttrium', async ({
  page,
}) => {
  await openStory(page, 'periodic-periodictable--thirty-two-columns');
  await expect(page.locator('[data-measured]')).toHaveCount(1);

  const barium = await boxOf(page, 'Ba');
  const lanthanum = await boxOf(page, 'La');
  const yttrium = await boxOf(page, 'Y');
  const lutetium = await boxOf(page, 'Lu');
  const hafnium = await boxOf(page, 'Hf');

  expect(lanthanum.y).toBeCloseTo(barium.y, 0);
  expect(lanthanum.x).toBeGreaterThan(barium.x);
  expect(lutetium.x).toBeCloseTo(yttrium.x, 0);
  expect(lutetium.y).toBeGreaterThan(yttrium.y);
  expect(hafnium.x).toBeGreaterThan(lutetium.x);
  await expect(page.getByText('57–71')).toHaveCount(0);
});

test('a cell keeps its proportions in 32 columns, only narrower', async ({
  page,
}) => {
  const standard = await cellShape(
    page,
    'periodic-periodictable--property-map',
  );
  const wide = await cellShape(
    page,
    'periodic-periodictable--thirty-two-columns',
  );

  expect(
    Math.abs(wide.heightPerWidth / standard.heightPerWidth - 1),
  ).toBeLessThan(0.04);
  expect(
    Math.abs(wide.symbolPerCell / standard.symbolPerCell - 1),
  ).toBeLessThan(0.04);
});

test('the 32-column table fits the box it is given', async ({ page }) => {
  await openStory(page, 'periodic-periodictable--thirty-two-columns');
  await expect(page.locator('[data-measured]')).toHaveCount(1);

  const overflow = await page.evaluate(() => {
    const grid = document.querySelector('[data-testid="periodic-table"]');
    if (grid === null) throw new Error('no table');
    return grid.scrollWidth - grid.clientWidth;
  });

  expect(overflow).toBe(0);
});

for (const story of [
  'periodic-periodictable--property-map',
  'periodic-periodictable--thirty-two-columns',
]) {
  test(`nothing stands below the last row of ${story}`, async ({ page }) => {
    await openStory(page, story);
    await expect(page.locator('[data-measured]')).toHaveCount(1);
    // The block labels are drawn: their strip is the last row of a 32-column
    // table, and a letter taller than it would hang under the drawing.
    await expect(page.locator('[data-block]')).toHaveCount(4);

    const hanging = await page.evaluate(() => {
      const grid = document.querySelector('[data-testid="periodic-table"]');
      if (grid === null) throw new Error('no table');
      const bottom = grid.getBoundingClientRect().bottom;
      let deepest = 0;
      for (const element of grid.querySelectorAll('*')) {
        const below = element.getBoundingClientRect().bottom - bottom;
        if (below > deepest) deepest = below;
      }
      return deepest;
    });

    expect(hanging).toBeLessThan(0.5);
  });
}
