import { expect, test } from '@playwright/test';

import { openStory } from './story.ts';

test('a band opens onto every candidate it could be', async ({ page }) => {
  await openStory(page, 'infrared-ireditor--bands');
  // By position: the button's own name turns from "1 more" to "less".
  const more = page.locator('td button[aria-expanded]').first();
  await expect(more).toHaveText('1 more');

  await more.click();

  await expect(more).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('td li')).toHaveText([
    /^alcohol, ether, ester C–O stretch/,
    /^alkyl fluoride C–F stretch/,
  ]);

  await more.click();

  await expect(page.locator('td li')).toHaveCount(0);
});
