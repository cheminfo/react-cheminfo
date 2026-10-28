import { expect, test } from '@playwright/test';

import { openStory } from './story.ts';

// The editor pulls openchemlib, which a cold Vite dev server compiles before it
// serves it.
test.describe.configure({ timeout: 90_000 });

test('a fragment to start from, applied, is handed back with its mode', async ({
  page,
}) => {
  await openStory(page, 'structure-structuresearchdialog--default');
  const dialog = page.getByRole('dialog');
  const apply = dialog.getByRole('button', { name: 'Apply' });
  const result = page.getByTestId('structure-search-result');
  await expect(result).toHaveText('nothing drawn');

  await dialog.getByRole('button', { name: 'Is exactly' }).click();
  await dialog.getByRole('button', { name: 'Benzene' }).click();
  // Apply waits for the example to be read into the canvas.
  await expect(apply).toBeEnabled();
  await page.screenshot({ path: 'test-results/structure-search-dialog.png' });
  await apply.click();

  await expect(dialog).toBeHidden();
  await expect(result).toHaveText('exact ≥ 0.7 gFp@DiTt@@B');
});

test('Escape hands back what the dialog holds rather than losing it', async ({
  page,
}) => {
  await openStory(page, 'structure-structuresearchdialog--similarity');
  const dialog = page.getByRole('dialog');

  await dialog.getByRole('button', { name: 'Contains' }).click();
  await page.keyboard.press('Escape');

  await expect(dialog).toBeHidden();
  await expect(page.getByTestId('structure-search-result')).toHaveText(
    'substructure ≥ 0.8 gFp@DiTt@@B',
  );
});

test('a similarity search sets its least similarity in the dialog', async ({
  page,
}) => {
  await openStory(page, 'structure-structuresearchdialog--similarity');
  const dialog = page.getByRole('dialog');

  await expect(dialog.getByLabel('Fingerprint')).toBeVisible();
  await dialog.getByLabel('Minimum similarity').selectOption('0.9');
  await dialog.getByRole('button', { name: 'Apply' }).click();

  await expect(page.getByTestId('structure-search-result')).toHaveText(
    'similarity ≥ 0.9 gFp@DiTt@@B',
  );
});
