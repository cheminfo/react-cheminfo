import { expect, test } from '@playwright/test';

import { openStory } from './story.ts';

/**
 * The file bar read left to right: each button's name, a rule as `|`.
 * @param page - The page showing a workbench.
 * @returns The names.
 */
async function fileBar(
  page: Parameters<typeof openStory>[0],
): Promise<string[]> {
  return page
    .getByRole('toolbar', { name: 'File', exact: true })
    .locator('button, .bp6-divider')
    .evaluateAll((elements) => {
      const names: string[] = [];
      for (const element of elements) {
        names.push(
          element.classList.contains('bp6-divider')
            ? '|'
            : (element.getAttribute('aria-label') ??
                element.textContent?.trim() ??
                ''),
        );
      }
      return names;
    });
}

test('a bench shows the family’s file bar, one group under a rule each', async ({
  page,
}) => {
  await openStory(page, 'editor-editorshell--bench');
  await expect
    .poll(() => fileBar(page))
    .toStrictEqual([
      'Open',
      'Save as…',
      '|',
      'Undo',
      'Redo',
      '|',
      'Delete the selection',
      'Clear the bench',
    ]);
});

test('a click takes a palette entry in hand, a double click adds it at once', async ({
  page,
}) => {
  await openStory(page, 'editor-editorshell--bench');
  const spring = page.getByRole('button', {
    name: 'Add a spring',
    exact: true,
  });
  const message = page.locator('.editor-status__message');

  await spring.click();
  await expect(spring).toHaveClass(/\bbp6-active\b/);
  await expect(message).toHaveText('Click on the bench to put a spring there.');

  await spring.click();
  await expect(spring).not.toHaveClass(/\bbp6-active\b/);

  await spring.dblclick();
  await expect(page.getByText('1 pieces', { exact: true })).toBeVisible();
  await expect(spring).not.toHaveClass(/\bbp6-active\b/);
  await expect(
    page.getByRole('button', { name: 'Save this figure — SVG', exact: true }),
  ).toBeVisible();
});

test('Enter on a focused palette entry adds it at once', async ({ page }) => {
  await openStory(page, 'editor-editorshell--bench');
  const mass = page.getByRole('button', { name: 'Add a mass', exact: true });

  await mass.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByText('1 pieces', { exact: true })).toBeVisible();
});

test('a lesson’s bench offers neither Open, Save as nor Clear', async ({
  page,
}) => {
  await openStory(page, 'editor-editorshell--lesson');
  await expect
    .poll(() => fileBar(page))
    .toStrictEqual(['Undo', 'Redo', '|', 'Delete the selection']);
});

test('the rail opens the folder panel, its sections in the family’s order', async ({
  page,
}) => {
  await openStory(page, 'editor-editorshell--bench');
  await page.locator('[data-panel-id="figures"]').click();
  const panel = page.getByTestId('figures-panel');
  await expect(
    panel.getByRole('toolbar', { name: 'Figures: actions', exact: true }),
  ).toBeVisible();
  const sections = panel.locator('section.folder-panel__section');
  await expect(sections).toHaveCount(4);
  expect(
    await sections.evaluateAll((all) => {
      const names: Array<string | null> = [];
      for (const section of all) names.push(section.getAttribute('aria-label'));
      return names;
    }),
  ).toStrictEqual([
    'Drafts',
    'On this computer',
    'Saved in this browser',
    'Examples',
  ]);
});
