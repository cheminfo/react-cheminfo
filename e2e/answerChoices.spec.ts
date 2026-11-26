import { expect, test } from '@playwright/test';

import { openStory } from './story.ts';

test('answer choices: the arrows move the pick, and Enter checks the answer', async ({
  page,
}) => {
  await openStory(page, 'pedagogy-questioncard--choice-field');
  const group = page.getByRole('radiogroup', { name: 'The ion is' });
  const cation = group.getByRole('radio').nth(0);
  const anion = group.getByRole('radio').nth(1);

  await expect(cation).toHaveAttribute('aria-checked', 'false');
  await expect(anion).toHaveAttribute('aria-checked', 'true');
  // The row is one stop of the Tab key: the answer picked.
  await expect(anion).toHaveAttribute('tabindex', '0');
  await expect(cation).toHaveAttribute('tabindex', '-1');

  await anion.focus();
  await page.keyboard.press('Enter');

  await expect(page.getByText('anion, expected cation')).toBeVisible();
  await expect(anion).toHaveAttribute('aria-checked', 'true');

  await page.keyboard.press('ArrowLeft');

  await expect(cation).toHaveAttribute('aria-checked', 'true');
  await expect(cation).toBeFocused();
  await expect(page.getByText('anion, expected cation')).toBeHidden();

  await page.keyboard.press('Enter');

  await expect(page.getByText('Without a hint.')).toBeVisible();
});

test('answer choices: Space picks the answer the focus is on', async ({
  page,
}) => {
  await openStory(page, 'pedagogy-questioncard--choice-field');
  const radios = page
    .getByRole('radiogroup', { name: 'The ion is' })
    .getByRole('radio');

  await radios.nth(1).focus();
  await page.keyboard.press('Home');

  await expect(radios.nth(0)).toHaveAttribute('aria-checked', 'true');

  await page.keyboard.press('End');
  await radios.nth(0).focus();
  await page.keyboard.press('Space');

  await expect(radios.nth(0)).toHaveAttribute('aria-checked', 'true');
  await expect(radios.nth(1)).toHaveAttribute('aria-checked', 'false');
  // The formula of a label is drawn, not written with its braces.
  await expect(radios.nth(1)).not.toContainText('{{');
});
