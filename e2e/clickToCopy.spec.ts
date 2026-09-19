import type { Locator, Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { openStory } from './story.ts';

/**
 * The clipboard, read once the value says it was copied: the write is
 * asynchronous, and the tick is what says it landed.
 * @param page - The page holding the value.
 * @param value - The value that was just clicked.
 * @returns What the clipboard now holds, as plain text.
 */
async function copiedText(page: Page, value: Locator): Promise<string> {
  await expect(value).toHaveAttribute('data-copy', 'copied');
  return page.evaluate(() => navigator.clipboard.readText());
}

test('hovering shows the copy cursor and the clipboard glyph; a click copies and ticks', async ({
  page,
}) => {
  await openStory(page, 'clipboard-clicktocopy--default');
  const value = page.getByRole('button', { name: 'C=CC=O' });
  const icon = value.locator('.click-to-copy__icon');

  await expect(value).toHaveAttribute('title', 'Copy the SMILES (C=CC=O)');
  await expect(value).toHaveCSS('cursor', 'copy');
  await expect(icon).toHaveCSS('opacity', '0');

  await value.hover();
  await expect(icon).toHaveCSS('opacity', '1');
  await expect(icon).toHaveClass(/bp6-icon-clipboard/);

  await value.click();
  expect(await copiedText(page, value)).toBe('C=CC=O');
  await expect(icon).toHaveClass(/bp6-icon-tick/);
  await expect(page.getByRole('status')).toHaveText('Copied');

  await expect(value).not.toHaveAttribute('data-copy', /./, { timeout: 3000 });
  await expect(icon).toHaveClass(/bp6-icon-clipboard/);
});

test('Enter copies a focused value, as a click does', async ({ page }) => {
  await openStory(page, 'clipboard-clicktocopy--default');
  const value = page.getByRole('button', { name: 'C=CC=O' });
  await value.focus();

  await page.keyboard.press('Enter');

  expect(await copiedText(page, value)).toBe('C=CC=O');
});

test('a table cell copies its own value', async ({ page }) => {
  await openStory(page, 'clipboard-clicktocopy--table-cells');
  const cell = page.getByRole('cell', { name: '-13.19' });

  await expect(cell).toHaveCSS('cursor', 'copy');
  await cell.click();

  expect(await copiedText(page, cell)).toBe('-13.19');
});

test('a formula goes on the clipboard as text', async ({ page }) => {
  await openStory(page, 'clipboard-clicktocopy--formula');
  const value = page.getByRole('button', { name: /C3H4O/ });

  await value.click();

  expect(await copiedText(page, value)).toBe('C3H4O');
});

test('a value inside a clickable row copies without opening the row', async ({
  page,
}) => {
  await openStory(page, 'clipboard-clicktocopy--inside-clickable-row');
  const value = page.getByRole('button', { name: 'C=CC=O', exact: true });

  await value.click();
  expect(await copiedText(page, value)).toBe('C=CC=O');
  await expect(page.getByTestId('opened')).toHaveText('Opened 0 times');

  await page.getByTestId('row').click({ position: { x: 4, y: 4 } });
  await expect(page.getByTestId('opened')).toHaveText('Opened 1 times');
});

test('the text of a tool is not selectable, a field and a marked region are', async ({
  page,
}) => {
  await openStory(page, 'clipboard-clicktocopy--selection-policy');

  await expect(page.getByTestId('tool-text')).toHaveCSS('user-select', 'none');
  await expect(page.getByRole('textbox', { name: 'SMILES' })).toHaveCSS(
    'user-select',
    'text',
  );
  await expect(page.getByTestId('prose')).toHaveCSS('user-select', 'text');

  await page.getByTestId('tool-text').dblclick();
  expect(await page.evaluate(() => window.getSelection()?.toString())).toBe('');

  await page.getByTestId('prose').dblclick();
  expect(await page.evaluate(() => window.getSelection()?.toString())).not.toBe(
    '',
  );
});
