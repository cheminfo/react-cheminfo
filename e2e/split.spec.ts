import type { Locator, Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { openStory } from './story.ts';

/**
 * The bar between two panes, as drawn.
 *
 * Everything else about a splitter can be read off the markup, and the unit
 * tests do. What cannot is whether the bar is a line a reader can find: which
 * of its two measurements `chrome.css` narrows to seven pixels depends on the
 * direction, and getting that wrong leaves a column's bar a seven-by-ten nub
 * against the left edge of its pane — addressable, draggable, invisible, and
 * invisible in the markup too.
 */

/**
 * The bar react-science draws between the two panes.
 * @param page - The page the story is open on.
 * @returns The bar.
 */
function bar(page: Page): Locator {
  return page.locator('.split-row > div > div:nth-child(2)');
}

/**
 * Where something is, insisting it is on screen first.
 * @param locator - What to measure.
 * @returns Its rectangle.
 */
async function box(locator: Locator) {
  await expect(locator).toBeVisible();
  const rect = await locator.boundingBox();
  if (rect === null) throw new Error('the bar is not laid out');
  return rect;
}

test('a row is divided by a thin bar standing the height of its panes', async ({
  page,
}) => {
  await openStory(page, 'split-splitpanes--across');

  const rect = await box(bar(page));
  const start = await box(page.getByTestId('split-start'));

  expect(rect.width).toBe(7);
  // It stands the whole height of what it divides, so the eye finds it.
  expect(rect.height).toBeGreaterThan(start.height - 2);
  await expect(bar(page)).toHaveCSS('cursor', 'ew-resize');
});

test('a column is divided by a thin bar running the width of its panes', async ({
  page,
}) => {
  await openStory(page, 'split-splitpanes--down');

  const rect = await box(bar(page));
  const start = await box(page.getByTestId('split-start'));

  expect(rect.height).toBe(7);
  // The measurement that was wrong: reached through the row's rule the bar came
  // back 7 px wide beside a pane several hundred wide.
  expect(rect.width).toBeGreaterThan(start.width - 2);
  expect(rect.x).toBeCloseTo(start.x, 0);
  await expect(bar(page)).toHaveCSS('cursor', 'ns-resize');
});

test('the bar a column is dragged by comes to rest where it was let go', async ({
  page,
}) => {
  await openStory(page, 'split-splitpanes--down');
  const rect = await box(bar(page));
  const opened = await box(page.getByTestId('split-start'));

  await page.mouse.move(rect.x + rect.width / 2, rect.y + rect.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    rect.x + rect.width / 2,
    rect.y + rect.height / 2 - 120,
    { steps: 10 },
  );
  await page.mouse.up();

  const rested = await box(page.getByTestId('split-start'));
  expect(rested.height).toBeLessThan(opened.height - 80);
});

test('a printed page carries no bar, and the panes keep their shares', async ({
  page,
}) => {
  await openStory(page, 'split-splitpanes--across');
  const divided = await share(page);

  await page.emulateMedia({ media: 'print' });

  await expect(bar(page)).toBeHidden();
  // The seven pixels the bar held go back to the two panes, in the proportion
  // they were already divided in: what is printed is the layout the reader
  // left, without the control that made it.
  expect(await share(page)).toBeCloseTo(divided, 0);
});

/**
 * The share of the box the first pane takes, read off what is drawn.
 * @param page - The page the story is open on.
 * @returns The percentage.
 */
async function share(page: Page): Promise<number> {
  const start = await box(page.getByTestId('split-start'));
  const end = await box(page.getByTestId('split-end'));
  return (start.width / (start.width + end.width)) * 100;
}
