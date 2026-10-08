import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { openStory } from './story.ts';

/**
 * Where a fraction of the strip lies on the page.
 * @param page - The page.
 * @param fraction - From 0 at the low end to 1 at the high end.
 * @returns The point, halfway down the strip.
 */
async function pointOnStrip(page: Page, fraction: number) {
  const box = await page
    .getByRole('img', { name: 'The scale being edited' })
    .boundingBox();
  if (box === null) throw new Error('the strip is not laid out');
  return { x: box.x + fraction * box.width, y: box.y + box.height / 2 };
}

const link = (page: Page) => page.getByText(/^\?scale=/);

/**
 * The anchors' handles, not the tone sliders beside the strip.
 * @param page - The page.
 * @returns The handles.
 */
const anchors = (page: Page) =>
  page.getByRole('slider', { name: /^Position of anchor/ });

test('a click on the strip adds an anchor in the colour already there', async ({
  page,
}) => {
  await openStory(page, 'color-colorscaleeditor--default');
  await expect(link(page)).toHaveText(
    '?scale=rgb,0-0b5754,0.55-f2a71b,1-7f1d1d',
  );

  const { x, y } = await pointOnStrip(page, 0.8);
  await page.mouse.click(x, y);

  await expect(anchors(page)).toHaveCount(4);
  await expect(link(page)).toHaveText(
    /^\?scale=rgb,0-0b5754,0\.55-f2a71b,0\.8\d*-[\da-f]{6},1-7f1d1d$/,
  );
  await expect(page.getByLabel('Colour of anchor 3')).toBeVisible();
});

test('an anchor is dragged along the strip, past its neighbour', async ({
  page,
}) => {
  await openStory(page, 'color-colorscaleeditor--default');
  const first = page.getByRole('slider', { name: 'Position of anchor 1' });
  const from = await pointOnStrip(page, 0);
  const to = await pointOnStrip(page, 0.7);

  await first.hover();
  await page.mouse.down();
  await page.mouse.move(to.x, from.y + 20, { steps: 8 });
  await page.mouse.up();

  await expect(link(page)).toHaveText(
    /^\?scale=rgb,0\.55-f2a71b,0\.7\d*-0b5754,1-7f1d1d$/,
  );
});

test('an anchor pointed at goes with Backspace, but never the last two', async ({
  page,
}) => {
  await openStory(page, 'color-colorscaleeditor--default');

  await page.getByRole('slider', { name: 'Position of anchor 2' }).hover();
  await page.keyboard.press('Backspace');
  await expect(link(page)).toHaveText('?scale=rgb,0-0b5754,1-7f1d1d');

  await page.getByRole('slider', { name: 'Position of anchor 1' }).hover();
  await page.keyboard.press('Backspace');
  await expect(anchors(page)).toHaveCount(2);
});

test('the anchor clicked is the one set exactly below the strip', async ({
  page,
}) => {
  await openStory(page, 'color-colorscaleeditor--default');

  await page.getByRole('slider', { name: 'Position of anchor 3' }).click();
  await expect(page.getByLabel('Colour of anchor 3')).toHaveValue('#7f1d1d');

  const position = page.getByRole('textbox', { name: 'Position of anchor 3' });
  await position.fill('0.9');
  await position.blur();
  await expect(link(page)).toHaveText(
    '?scale=rgb,0-0b5754,0.55-f2a71b,0.9-7f1d1d',
  );
});
