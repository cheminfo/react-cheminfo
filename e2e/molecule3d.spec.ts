import { expect, test } from '@playwright/test';

import { openStory } from './story.ts';

// molstar needs a real WebGL2 context, which headless Chromium only gets from
// the software renderer.
test.use({
  launchOptions: { args: ['--use-gl=angle', '--use-angle=swiftshader'] },
});

test('the surface is coloured by polarity and states its TPSA', async ({
  page,
}) => {
  // molstar's lazy chunk and a software-rendered surface outlast 30 s cold.
  test.setTimeout(120_000);
  const problems: string[] = [];
  page.on('console', (message) => {
    const text = message.text();
    if (text.includes('GL Driver Message')) return;
    if (message.type() === 'error') problems.push(text);
  });
  page.on('pageerror', (error) => {
    problems.push(error.message);
  });

  await openStory(page, 'molecule3d-moleculeviewer3d--polar-surface');

  await page.getByRole('button', { name: 'Mouse and keyboard' }).click();
  const help = page.getByTestId('molecule3d-help');
  await expect(
    help.getByText('Rotate in the plane of the screen', { exact: true }),
  ).toBeVisible();
  await help.screenshot({ path: 'test-results/molecule3d-help.png' });
  await page.keyboard.press('Escape');
  await expect(help).toHaveCount(0);

  await page.getByRole('button', { name: 'Display options' }).click();
  const options = page.locator('.bp6-popover');

  await expect(options.getByTestId('molecule3d-tpsa-value')).toHaveText(
    'TPSA: 20.2 Å²',
  );
  await expect(options.getByTestId('molecule3d-polarity-legend')).toHaveText(
    'δ+δ−neutral',
  );
  await expect(options.getByTestId('molecule3d-surface-color')).toHaveCount(0);
  await page.screenshot({ path: 'test-results/molecule3d-polarity.png' });

  await options.getByText('Element', { exact: true }).click();
  await expect(options.getByTestId('molecule3d-tpsa-value')).toHaveCount(0);
  await expect(options.getByTestId('molecule3d-polarity-legend')).toHaveCount(
    0,
  );

  await options.getByText('Uniform', { exact: true }).click();

  // The picker is a popover inside the options popover: choosing a colour
  // must leave both open and reach the settings.
  await page
    .getByTestId('molecule3d-surface-color')
    .getByRole('button')
    .click();
  await page.getByTitle('#332288').click();
  await expect(page.locator('input[value="332288"]')).toHaveCount(1);
  await expect(page.getByText('Surface colour', { exact: true })).toBeVisible();

  expect(problems).toStrictEqual([]);
});
