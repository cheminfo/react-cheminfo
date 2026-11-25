import { expect, test } from '@playwright/test';

import { openStory } from './story.ts';

// The editor pulls openchemlib, which a cold Vite dev server compiles before it
// serves it.
test.describe.configure({ timeout: 90_000 });

test('a fragment to start from, searched in a mode, is handed back with it', async ({
  page,
}) => {
  await openStory(page, 'structure-structuresearchdialog--default');
  const dialog = page.getByRole('dialog');
  const exact = dialog.getByRole('button', { name: 'Is exactly', exact: true });
  const result = page.getByTestId('structure-search-result');
  await expect(result).toHaveText('nothing drawn');
  await expect(exact).toHaveAccessibleDescription('The one molecule drawn.');

  await dialog.getByRole('button', { name: 'Benzene' }).click();
  // The modes wait for the example to be read into the canvas.
  await expect(exact).toBeEnabled();
  await page.screenshot({ path: 'test-results/structure-search-dialog.png' });
  await exact.click();

  await expect(dialog).toBeHidden();
  await expect(result).toHaveText('exact ≥ 0.7 gFp@DiTt@@B');
});

test('Escape hands back what the dialog holds rather than losing it', async ({
  page,
}) => {
  await openStory(page, 'structure-structuresearchdialog--similarity');
  const dialog = page.getByRole('dialog');

  await dialog.getByRole('button', { name: 'Pyridine' }).click();
  await expect(
    dialog.getByRole('button', { name: 'Contains', exact: true }),
  ).toBeEnabled();
  await page.keyboard.press('Escape');

  await expect(dialog).toBeHidden();
  await expect(page.getByTestId('structure-search-result')).toHaveText(
    'similarity ≥ 0.8 gFx@@eJf`@@P',
  );
});

test('a similarity search sets its least similarity in the dialog', async ({
  page,
}) => {
  await openStory(page, 'structure-structuresearchdialog--similarity');
  const dialog = page.getByRole('dialog');

  await expect(dialog.getByLabel('Fingerprint')).toBeVisible();
  await dialog.getByLabel('Minimum similarity').selectOption('0.9');
  await dialog.getByRole('button', { name: 'Similar to', exact: true }).click();

  await expect(page.getByTestId('structure-search-result')).toHaveText(
    'similarity ≥ 0.9 gFp@DiTt@@B',
  );
});
