/**
 * The table keeps its proportions inside a host that zooms the page.
 *
 * A PowerPoint for Mac add-in frames its page at a zoom — 1.34 on the machine
 * this was found on — and WebKit resolves a container-query unit against the
 * zoomed container and then applies the zoom to the result again, so every
 * length written in `cqw` came out a third too large while the cells stayed
 * the size the window gave them. The symbol then overran its cell on Safari
 * and in the add-in, and on no other engine.
 *
 * So this is the one spec that runs in WebKit as well, and it asserts the
 * shape of the drawing rather than any length: whatever width the window
 * leaves, a cell is the same share of the table and the symbol the same share
 * of the cell.
 */

import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { openStory } from './story.ts';

/** The zoom a PowerPoint for Mac add-in frame was measured at. */
const ZOOM = 1.34;

interface Shape {
  cellPerTable: number;
  symbolPerCell: number;
  heightPerWidth: number;
}

async function shapeOf(page: Page, zoom: number): Promise<Shape> {
  await openStory(page, 'periodic-periodictable--property-map');
  await expect(page.getByTestId('element-Fe')).toBeVisible();
  if (zoom !== 1) {
    await page.addStyleTag({ content: `html { zoom: ${String(zoom)} }` });
  }

  return page.evaluate(() => {
    const table = document.querySelector('[data-testid="periodic-table"]');
    const cell = document.querySelector('[data-testid="element-Fe"]');
    if (table === null || cell === null) throw new Error('no table');
    // The second span of a cell is its symbol; the first is the atomic number.
    const symbol = cell.querySelectorAll('span')[1];
    if (symbol === undefined) throw new Error('no symbol');
    const box = cell.getBoundingClientRect();
    return {
      cellPerTable: box.width / table.getBoundingClientRect().width,
      symbolPerCell: symbol.getBoundingClientRect().width / box.width,
      heightPerWidth: box.height / box.width,
    };
  });
}

test('the drawing keeps its proportions under a host page zoom', async ({
  page,
}) => {
  const plain = await shapeOf(page, 1);
  const zoomed = await shapeOf(page, ZOOM);

  // A third of a cell is what the defect cost, so a couple of per cent of
  // tolerance leaves room for one engine's text metrics and catches it.
  expect(zoomed.symbolPerCell).toBeCloseTo(plain.symbolPerCell, 2);
  expect(zoomed.cellPerTable).toBeCloseTo(plain.cellPerTable, 2);
  expect(zoomed.heightPerWidth).toBeCloseTo(plain.heightPerWidth, 2);
});
