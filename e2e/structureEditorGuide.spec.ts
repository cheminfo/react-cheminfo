import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { openStory } from './story.ts';

// The editor pulls openchemlib, which a cold Vite dev server compiles first.
test.describe.configure({ timeout: 90_000 });

const STORY = 'structure-structureeditor-guide--half-page';

test('the guide stands beside the toolbar and under the corner buttons', async ({
  page,
}) => {
  await openGuidedEditor(page);
  const guide = page.getByTestId('structure-editor-guide');
  await expect(guide.getByTestId('empty-guide')).toBeVisible();
  await expect(page.getByTestId('structure-editor-splash')).toHaveCount(0);

  const [box, toolbar, corner] = await Promise.all([
    guide.boundingBox(),
    toolbarRect(page),
    page.getByRole('button', { name: 'Mouse and keyboard' }).boundingBox(),
  ]);
  if (box === null || corner === null) throw new Error('Nothing is drawn.');
  expect(box.x).toBeGreaterThanOrEqual(toolbar.x + toolbar.width - 1);
  expect(box.y).toBeGreaterThanOrEqual(corner.y + corner.height);
  await expect(
    guide.getByRole('img', { name: 'An example', exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: 'test-results/structure-editor-guide.png',
    animations: 'disabled',
  });
});

test('a stroke drawn through the guide draws, and the guide goes at the press', async ({
  page,
}) => {
  await openGuidedEditor(page);
  const guide = page.getByTestId('structure-editor-guide');
  const toolbar = await toolbarRect(page);

  // Button 5, the single bond, is the sixth down the first column: a press on
  // the toolbar is not a stroke, and leaves the guide where it is.
  await page.mouse.click(toolbar.x + 12, toolbar.y + 2 + 5 * 21 + 10);
  await expect(guide).toBeVisible();

  // Counted from the press on, so a guide flashing back before the stroke is
  // reported is caught too.
  await page.evaluate(() => {
    const record = globalThis as unknown as { guideReturns: number };
    record.guideReturns = 0;
    new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (
            node instanceof Element &&
            node.matches('[data-testid="structure-editor-guide"]')
          ) {
            record.guideReturns++;
          }
        }
      }
    }).observe(document.body, { childList: true, subtree: true });
  });

  const words = await guide.getByText('Draw', { exact: true }).boundingBox();
  if (words === null) throw new Error('The guide says nothing.');
  await page.mouse.move(words.x + 10, words.y + 40);
  await page.mouse.down();
  await expect(guide).toHaveCount(0);
  await page.mouse.move(words.x + 80, words.y + 60, { steps: 5 });
  await page.mouse.up();

  await expect(page.getByTestId('guided-smiles')).toHaveText('CC');
  await expect(guide).toHaveCount(0);
  expect(
    await page.evaluate(
      () => (globalThis as unknown as { guideReturns: number }).guideReturns,
    ),
  ).toBe(0);
});

test("the guide's own button takes the click, and sends it away", async ({
  page,
}) => {
  await openGuidedEditor(page);
  const guide = page.getByTestId('structure-editor-guide');

  await guide.getByRole('button', { name: 'Start drawing' }).click();

  await expect(guide).toHaveCount(0);
  await expect(page.getByTestId('guided-smiles')).toHaveText('—');
});

/**
 * Open the story and wait for the editor's canvas.
 * @param page - The page to open it in.
 */
async function openGuidedEditor(page: Page): Promise<void> {
  await page.setViewportSize({ width: 1000, height: 800 });
  await openStory(page, STORY);
  await expect(page.locator('[data-openchemlib-canvas-editor]')).toHaveCount(
    1,
    { timeout: 30_000 },
  );
  await expect(page.getByTestId('structure-editor-guide')).toBeVisible();
}

/**
 * Where the toolbar canvas is on the page.
 * @param page - The page the story is open in.
 * @returns Its box, in CSS pixels.
 */
async function toolbarRect(
  page: Page,
): Promise<{ x: number; y: number; width: number; height: number }> {
  await expect
    .poll(() =>
      page.evaluate(() => {
        const root = document.querySelector('[data-openchemlib-canvas-editor]');
        const toolbar = root?.shadowRoot?.firstElementChild;
        return toolbar instanceof HTMLCanvasElement ? toolbar.offsetHeight : 0;
      }),
    )
    .toBeGreaterThan(200);
  return page.evaluate(() => {
    const root = document.querySelector('[data-openchemlib-canvas-editor]');
    const toolbar = root?.shadowRoot?.firstElementChild;
    if (!(toolbar instanceof HTMLCanvasElement)) {
      throw new Error('the editor drew no toolbar');
    }
    const { x, y, width, height } = toolbar.getBoundingClientRect();
    return { x, y, width, height };
  });
}
