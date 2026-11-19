import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { ECOSYSTEM_SITES } from '../src/ecosystem/core/sites.ts';

import { openStory } from './story.ts';

const HEADING = 'Our tools, all in the browser';

// Counted from the list itself, so adding a site does not leave the spec behind.
const SITE_COUNT = ECOSYSTEM_SITES.length;

// Every tile of the open menu: the links under its topics, and neither the
// page's own nor the one to the entrance of the family.
function tiles(page: Page) {
  return page.locator('.ecosystem-menu section').getByRole('link');
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

  const isomers = tiles(page).filter({ hasText: /isomers/ });
  await expect(isomers).toHaveAttribute(
    'href',
    'https://isomers.cheminfo.org/',
  );
  await expect(isomers).toHaveAttribute('target', '_blank');
  await expect(isomers).toHaveAttribute('rel', 'noreferrer');
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

test('the search takes the keyboard, keeps the sites that answer, and Enter opens the one lit', async ({
  page,
  context,
}) => {
  // The tab Enter opens is answered here, so no test ever reaches the site.
  await context.route('https://optics.cheminfo.org/**', (route) =>
    route.fulfill({ contentType: 'text/html', body: '<title>optics</title>' }),
  );
  await openTools(page, 'ecosystem-ecosystembutton--default');
  const search = page.getByRole('textbox', { name: 'Search the tools' });
  await expect(search).toBeFocused();

  await page.keyboard.type('physics');

  await expect(tiles(page)).toHaveCount(3);
  await expect(
    page.locator('.ecosystem-menu').getByRole('heading', { level: 3 }),
  ).toHaveText(['Physics']);

  const opened = page.waitForEvent('popup');
  await page.keyboard.press('Enter');
  const tab = await opened;
  await tab.waitForLoadState();
  expect(tab.url()).toBe('https://optics.cheminfo.org/');
});

test('a search nothing answers says so', async ({ page }) => {
  await openTools(page, 'ecosystem-ecosystembutton--default');
  await page.keyboard.type('xyzzy');

  await expect(page.getByText('No tool matches “xyzzy”.')).toBeVisible();
  await expect(tiles(page)).toHaveCount(0);
});

test('the menu links to the entrance of the family, in a new tab', async ({
  page,
}) => {
  await openTools(page, 'ecosystem-ecosystembutton--default');
  const home = page
    .locator('.ecosystem-menu')
    .getByRole('link', { name: 'www.cheminfo.org', exact: true });

  await expect(home).toHaveAttribute('href', 'https://www.cheminfo.org/');
  await expect(home).toHaveAttribute('target', '_blank');
  await expect(home).toHaveAttribute('rel', 'noreferrer');
});
