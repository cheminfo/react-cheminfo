import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { ECOSYSTEM_SITES } from '../src/ecosystem/core/sites.ts';

import { openStory } from './story.ts';

const HEADING = 'Our other tools, all in the browser';

// Counted from the list itself, so adding a site does not leave the spec behind.
const SITE_COUNT = ECOSYSTEM_SITES.length;

// Every tile of the open menu, and nothing the page itself carries.
function tiles(page: Page) {
  return page.locator('.ecosystem-menu').getByRole('link');
}

async function openTools(page: Page, storyId: string): Promise<void> {
  await openStory(page, storyId);
  await page.getByRole('button', { name: 'Tools' }).click();
  await expect(page.getByText(HEADING)).toBeVisible();
}

test('the menu lists every site of the family', async ({ page }) => {
  await openTools(page, 'ecosystem-ecosystembutton--default');

  await expect(tiles(page)).toHaveCount(SITE_COUNT);
});

test('the current site is shown, and is the one tile that is not a link', async ({
  page,
}) => {
  await openTools(page, 'ecosystem-ecosystembutton--current-site');

  await expect(page.getByText('you are here')).toBeVisible();
  await expect(tiles(page)).toHaveCount(SITE_COUNT - 1);
  await expect(tiles(page).filter({ hasText: /vcl/ })).toHaveCount(0);
});

test('every other site opens its own https address in a new tab', async ({
  page,
}) => {
  await openTools(page, 'ecosystem-ecosystembutton--current-site');

  const surge = tiles(page).filter({ hasText: /surge/ });
  await expect(surge).toHaveAttribute('href', 'https://surge.cheminfo.org/');
  await expect(surge).toHaveAttribute('target', '_blank');
  await expect(surge).toHaveAttribute('rel', 'noreferrer');
});

test('the menu stands on its own, outside the button that opens it', async ({
  page,
}) => {
  await openStory(page, 'ecosystem-ecosystemmenu--current-site');

  await expect(page.getByText(HEADING)).toBeVisible();
  await expect(tiles(page)).toHaveCount(SITE_COUNT - 1);
});

test('the compact button drops its text but keeps its label', async ({
  page,
}) => {
  await openStory(page, 'ecosystem-ecosystembutton--compact');
  const compact = page.getByRole('button', { name: 'Tools' });

  await expect(compact).toHaveText('');
  await expect(compact).toHaveAttribute('aria-label', 'Tools');
  await expect(compact).toHaveAttribute('title', 'Tools');

  await compact.click();
  await expect(page.getByText(HEADING)).toBeVisible();
});
