import { expect, test } from '@playwright/test';

import { openStory } from './story.ts';

// The dialog pulls openchemlib, which a cold Vite dev server compiles before it
// serves it.
test.describe.configure({ timeout: 90_000 });

test('the glyph beside a card’s structure opens its export, which copies it', async ({
  page,
}) => {
  await openStory(page, 'card-cardstructure--default');
  await expect(page.locator('.card-structure svg').first()).toBeVisible();
  await page.screenshot({ path: 'test-results/card-structure.png' });

  await page
    .getByRole('button', {
      name: 'Copy or save the structure: SMILES, molfile',
    })
    .click();
  const dialog = page.getByRole('dialog');
  const smiles = dialog.getByText('C[n]1c(C(N(C)C(N2C)=O)=O)c2nc1');
  await smiles.click();

  await expect(
    page.evaluate(() => navigator.clipboard.readText()),
  ).resolves.toBe('C[n]1c(C(N(C)C(N2C)=O)=O)c2nc1');
});

test('every structure of a grid carries a glyph of its own', async ({
  page,
}) => {
  await openStory(page, 'card-cardstructure--grid');

  await expect(page.getByTestId('card-structure')).toHaveCount(3);
  await expect(page.locator('.card-figure__drawing svg')).toHaveCount(3);
  await page.screenshot({ path: 'test-results/card-structure-grid.png' });
});
