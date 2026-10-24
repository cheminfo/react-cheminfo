import type { JSHandle, Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { openStory } from './story.ts';

// The editor pulls openchemlib, which a cold Vite dev server compiles first.
test.describe.configure({ timeout: 90_000 });

test('text dropped on the canvas replaces the drawing', async ({ page }) => {
  await openEmptyEditor(page);
  const dataTransfer = await textTransfer(page, 'c1ccccc1O');

  await page.locator(CANVAS).dispatchEvent('dragenter', { dataTransfer });
  const overlay = page.getByTestId('structure-drop-overlay');

  await expect(overlay).toHaveText('Drop to load the structure');
  await page.screenshot({ path: 'test-results/structure-import-overlay.png' });

  await overlay.dispatchEvent('drop', { dataTransfer });

  await expect(overlay).toHaveCount(0);
  await expect(readout(page, 'SMILES')).toHaveText('Oc1ccccc1');
  await expect(
    page.getByRole('button', { name: 'Export the structure' }),
  ).toBeEnabled();
});

test('leaving the canvas lowers the veil', async ({ page }) => {
  await openEmptyEditor(page);
  const dataTransfer = await textTransfer(page, 'CCO');

  await page.locator(CANVAS).dispatchEvent('dragenter', { dataTransfer });
  const overlay = page.getByTestId('structure-drop-overlay');

  await expect(overlay).toBeVisible();

  await overlay.dispatchEvent('dragleave', { dataTransfer });

  await expect(overlay).toHaveCount(0);
});

test('a file opened from the corner replaces the drawing', async ({ page }) => {
  await openEmptyEditor(page);

  await page.getByTestId('structure-editor-file').setInputFiles({
    name: 'acetone.smi',
    mimeType: 'text/plain',
    buffer: Buffer.from('CC(=O)C acetone\n'),
  });

  await expect(readout(page, 'SMILES')).toHaveText('CC(C)=O');
});

test('text that holds no structure keeps the drawing and says so', async ({
  page,
}) => {
  await openEmptyEditor(page);
  const dataTransfer = await textTransfer(page, 'ethanol');

  await page.locator(CANVAS).dispatchEvent('dragenter', { dataTransfer });
  await page
    .getByTestId('structure-drop-overlay')
    .dispatchEvent('drop', { dataTransfer });

  const alert = page.getByRole('alert');

  await expect(alert).toHaveText(
    'That text is not a molfile, a SMILES or an idCode, so the drawing was kept.',
  );
  await page.screenshot({ path: 'test-results/structure-import-problem.png' });
  await expect(
    page.getByRole('button', { name: 'Export the structure' }),
  ).toBeDisabled();

  await alert.getByRole('button', { name: 'Dismiss' }).click();

  await expect(alert).toHaveCount(0);
});

const CANVAS = '[data-openchemlib-canvas-editor]';

/**
 * Open the blank editor and wait for its canvas.
 * @param page - The page to open it in.
 */
async function openEmptyEditor(page: Page): Promise<void> {
  await openStory(page, 'structure-structureeditor--empty');
  await expect(page.locator(CANVAS)).toHaveCount(1, { timeout: 30_000 });
}

/**
 * A drag carrying plain text, as text dragged from another page does.
 * @param page - The page the drag happens in.
 * @param text - What it carries.
 * @returns The transfer, living in the page.
 */
async function textTransfer(
  page: Page,
  text: string,
): Promise<JSHandle<DataTransfer>> {
  return page.evaluateHandle((data) => {
    const transfer = new DataTransfer();
    transfer.setData('text/plain', data);
    return transfer;
  }, text);
}

/**
 * The notation the story prints under the editor.
 * @param page - The page the story is open in.
 * @param label - Which notation.
 * @returns Its printed value.
 */
function readout(page: Page, label: string) {
  return page
    .getByText(label, { exact: true })
    .locator('xpath=following-sibling::pre');
}
