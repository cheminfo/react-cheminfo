import { expect, test } from '@playwright/test';

import { openStory } from './story.ts';

// The dialog pulls openchemlib, which a cold Vite dev server compiles before it
// serves it.
test.describe.configure({ timeout: 90_000 });

test('every notation is on screen, and the identifiers fold away under them', async ({
  page,
}) => {
  await openStory(page, 'structure-structureexportdialog--default');
  const dialog = page.getByRole('dialog');

  await expect(dialog.getByText('SMILES', { exact: true })).toBeVisible();
  await expect(
    dialog.getByText('C[n]1c(C(N(C)C(N2C)=O)=O)c2nc1'),
  ).toBeVisible();
  await expect(dialog.getByText('Molfile V3000')).toBeVisible();
  await expect(dialog.getByText('Molfile V2000')).toBeVisible();
  // The picture is the file: the preview is the SVG the save button writes.
  await expect(dialog.getByRole('img')).toHaveAttribute(
    'src',
    /^data:image\/svg\+xml/,
  );

  // The identifiers answer a database question, so they start folded.
  await expect(dialog.getByText('idCode', { exact: true })).toBeHidden();
  await page.getByRole('button', { name: 'Canonical identifiers' }).click();
  await expect(dialog.getByText('idCode', { exact: true })).toBeVisible();
  // Caffeine has no stereocentre and no tautomeric site, so its three
  // identifiers are the same string.
  await expect(
    dialog.getByText(String.raw`dg|d@Dq]@\bbbbfJSSimUSTs@@`),
  ).toHaveCount(3);

  await page.screenshot({ path: 'test-results/structure-export.png' });
});

test('the resolution says the pixels it would write', async ({ page }) => {
  await openStory(page, 'structure-structureexportdialog--default');
  const dialog = page.getByRole('dialog');

  // The picture is cropped to the structure, so the size is caffeine's own.
  // It opens at two, which is what a slide wants.
  await expect(dialog.getByText('571 × 622 pixels')).toBeVisible();

  // Four times the resolution is four times the drawing, not four times the
  // white around it — the defect the bond length exists for.
  await dialog.getByRole('radio', { name: '4×' }).click();
  await expect(dialog.getByText('1141 × 1243 pixels')).toBeVisible();

  await dialog.getByRole('radio', { name: '1×' }).click();
  await expect(dialog.getByText('285 × 311 pixels')).toBeVisible();
});

test('the picture and the molfiles leave as files, named after the structure', async ({
  page,
}) => {
  await openStory(page, 'structure-structureexportdialog--default');
  const dialog = page.getByRole('dialog');

  const png = page.waitForEvent('download');
  await dialog.getByRole('button', { name: 'Save PNG' }).click();
  const pngFile = await png;
  expect(pngFile.suggestedFilename()).toBe('caffeine.png');

  const svg = page.waitForEvent('download');
  await dialog.getByRole('button', { name: 'Save SVG' }).click();
  const svgFile = await svg;
  expect(svgFile.suggestedFilename()).toBe('caffeine.svg');

  // The two molfiles are the same extension, so the dialect is in the name.
  const molfiles = dialog.getByRole('button', { name: 'Save', exact: true });
  const v3000 = page.waitForEvent('download');
  await molfiles.first().click();
  const v3000File = await v3000;
  expect(v3000File.suggestedFilename()).toBe('caffeine-v3000.mol');

  const v2000 = page.waitForEvent('download');
  await molfiles.last().click();
  const v2000File = await v2000;
  expect(v2000File.suggestedFilename()).toBe('caffeine-v2000.mol');
});

test('a notation is copied by clicking it', async ({ page }) => {
  await openStory(page, 'structure-structureexportdialog--default');
  const dialog = page.getByRole('dialog');

  await dialog.getByText('C[n]1c(C(N(C)C(N2C)=O)=O)c2nc1').click();

  await expect(
    page.evaluate(() => navigator.clipboard.readText()),
  ).resolves.toBe('C[n]1c(C(N(C)C(N2C)=O)=O)c2nc1');
});

test('nothing drawn is said rather than guessed at', async ({ page }) => {
  await openStory(page, 'structure-structureexportdialog--nothing');

  await expect(page.getByText('Nothing is drawn yet.')).toBeVisible();
});

test("the export button's tooltip leaves when the button is pressed", async ({
  page,
}) => {
  await openStory(page, 'structure-structureeditor--default');
  // The editor pulls openchemlib, and a cold dev server compiles it before it
  // serves it: hovering before the canvas is there races the chunk.
  await expect(page.locator('[data-openchemlib-canvas-editor]')).toBeAttached({
    timeout: 60_000,
  });
  const button = page.getByRole('button', { name: 'Export the structure' });
  const tooltip = page.locator('.bp6-tooltip');

  // From somewhere else, so the hover is a pointer arriving rather than one
  // that was already there when the lazily-loaded button mounted under it.
  await page.mouse.move(0, 0);
  await button.hover();
  await expect(tooltip).toContainText('Export the structure');

  // The dialog lands over the button, so the `mouseleave` that would close the
  // tooltip is never delivered: without the fix the card stays on screen, over
  // the dialog it was explaining.
  await button.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(tooltip).toHaveCount(0);

  await page.screenshot({
    path: 'test-results/structure-export-from-editor.png',
  });

  // And it does not come back once the dialog is gone: the open Blueprint had
  // scheduled when the pointer arrived must have been cancelled by the press,
  // not merely hidden behind the dialog.
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.mouse.move(400, 500);
  await page.waitForTimeout(700);
  await expect(tooltip).toHaveCount(0);
});

test('the help button lets go of its tooltip when it is pressed', async ({
  page,
}) => {
  await openStory(page, 'structure-structureeditor--default');
  await expect(page.locator('[data-openchemlib-canvas-editor]')).toBeAttached({
    timeout: 60_000,
  });
  const help = page.getByRole('button', { name: 'Mouse and keyboard' });
  const tooltip = page.locator('.bp6-tooltip');

  await page.mouse.move(0, 0);
  await help.hover();
  await expect(tooltip).toContainText('Mouse and keyboard');

  await help.click();
  await expect(page.getByTestId('structure-editor-help')).toBeVisible();
  await expect(tooltip).toHaveCount(0);

  await page.keyboard.press('Escape');
  await page.mouse.move(400, 500);
  await page.waitForTimeout(700);
  await expect(tooltip).toHaveCount(0);
});
