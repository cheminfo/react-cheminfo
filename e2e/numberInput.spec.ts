import { expect, test } from '@playwright/test';

import { openStory } from './story.ts';

test('a decimal typed into the box stays typed, and the page reads it', async ({
  page,
}) => {
  await openStory(page, 'number-numberinput--default');
  const box = page.getByRole('textbox', { name: 'Concentration' });

  await box.click();
  await page.keyboard.press('ControlOrMeta+a');
  await page.keyboard.type('0.2');

  await expect(box).toHaveValue('0.2');
  await expect(page.getByTestId('held')).toHaveText('0.2');
});

test('the bounds wait until the box is left', async ({ page }) => {
  await openStory(page, 'number-numberinput--whole-numbers');
  const box = page.getByRole('textbox', { name: 'Concentration' });

  await box.click();
  await page.keyboard.press('ControlOrMeta+a');
  await page.keyboard.type('1');
  await expect(box).toHaveValue('1');

  await page.keyboard.type('5');
  await box.blur();
  await expect(box).toHaveValue('15');
});
