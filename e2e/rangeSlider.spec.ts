import type { Locator, Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { openStory } from './story.ts';

/**
 * Drag a handle of the default story from one year to another, pausing on the
 * way so the page sees it move. The pointer moves by the distance between the
 * two years, from wherever the handle is grabbed: Blueprint places a range
 * handle's centre half a handle away from the value it marks, so aiming at a
 * year's absolute position lands a tick off.
 * @param page - The page.
 * @param handle - The handle.
 * @param from - The year it stands on.
 * @param to - Where to drop it.
 */
async function drag(page: Page, handle: Locator, from: number, to: number) {
  const track = await page.locator('.bp6-slider-track').boundingBox();
  const box = await handle.boundingBox();
  if (track === null || box === null) throw new Error('nothing is laid out');
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  const distance = ((to - from) / (2026 - 1970)) * track.width;
  await page.mouse.move(x + distance, y, { steps: 8 });
}

test('a dragged handle previews as it moves and settles when let go', async ({
  page,
}) => {
  await openStory(page, 'range-rangeslider--default');
  const low = page.getByRole('slider', { name: 'Year, lowest' });

  await drag(page, low, 1970, 1990);

  await expect(page.getByTestId('preview')).toHaveText('1990 – open');
  await expect(page.getByTestId('held')).toHaveText('open – open');
  await expect(
    page.getByRole('button', { name: 'Year, lowest: 1990' }),
  ).toBeVisible();

  await page.mouse.up();

  await expect(page.getByTestId('held')).toHaveText('1990 – open');
});

test('a handle dragged back to the end of the track opens its side', async ({
  page,
}) => {
  await openStory(page, 'range-rangeslider--default');
  const high = page.getByRole('slider', { name: 'Year, highest' });

  await drag(page, high, 2026, 2000);
  await page.mouse.up();
  await expect(page.getByTestId('held')).toHaveText('open – 2000');

  await drag(page, high, 2000, 2030);
  await page.mouse.up();
  await expect(page.getByTestId('held')).toHaveText('open – open');
});

test('a value is clicked, typed and kept on Enter', async ({ page }) => {
  await openStory(page, 'range-rangeslider--default');

  await page.getByRole('button', { name: 'Year: no upper bound' }).click();
  const box = page.getByRole('textbox', { name: 'Year, highest' });
  await expect(box).toBeFocused();
  await page.keyboard.type('2005');
  await page.keyboard.press('Enter');

  await expect(page.getByTestId('held')).toHaveText('open – 2005');
  await expect(
    page.getByRole('slider', { name: 'Year, highest' }),
  ).toHaveAttribute('aria-valuenow', '2005');
});
