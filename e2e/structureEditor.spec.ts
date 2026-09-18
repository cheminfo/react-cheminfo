import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { openStory } from './story.ts';

/**
 * How long openchemlib is held back before it is served.
 *
 * The editor is imported lazily, and the bug this covers was a measuring loop
 * that gave up after about two seconds and left the toolbar cut off for the
 * life of the page. So the chunk arrives later than any deadline would have
 * waited, which is a slow connection, a cold cache or a busy laptop.
 */
const CHUNK_DELAY = 4000;

// The editor pulls openchemlib, which a cold Vite dev server compiles before it
// serves, and one of these specs then holds it back on purpose.
test.describe.configure({ timeout: 90_000 });

/** What the editor's box and its toolbar measure, in CSS pixels. */
interface EditorSize {
  box: number;
  toolbar: number;
}

test('the box clears the toolbar although the editor arrives late', async ({
  page,
}) => {
  await delayOpenchemlib(page);
  await openStory(page, 'structure-structureeditor--small-box');

  const size = await editorSize(page);
  // The toolbar is one canvas of a fixed height: a shorter box does not scroll
  // it, it cuts the last buttons — O, S, F, Cl, Br, I, H — off the palette.
  expect(size.toolbar).toBeGreaterThan(200);
  expect(size.box).toBeGreaterThanOrEqual(size.toolbar);
});

test('the box clears the toolbar again after the editor is reloaded', async ({
  page,
}) => {
  await openStory(page, 'structure-structureeditor--reloadable');
  await editorSize(page);

  await page.getByRole('button', { name: 'Reload' }).click();
  const size = await editorSize(page);

  expect(size.box).toBeGreaterThanOrEqual(size.toolbar);
});

test('a toolbar button names itself when the pointer rests on it', async ({
  page,
}) => {
  await openStory(page, 'structure-structureeditor--default');
  await editorSize(page);
  const toolbar = await toolbarRect(page);
  const tooltip = page.getByTestId('structure-editor-tooltip');

  // Button 5, the single bond, is the sixth down the first column.
  await page.mouse.move(toolbar.x + 12, toolbar.y + 2 + 5 * 21 + 10);
  await expect(tooltip).toContainText('Single bond');
  await expect(tooltip.locator('kbd')).toHaveText('1');

  // Button 19, atom mapping, is greyed in a molecule editor and says why.
  await page.mouse.move(toolbar.x + 33, toolbar.y + 2 + 2 * 21 + 10);
  await expect(tooltip).toContainText('Atom mapping');
  await expect(tooltip).toContainText('Only when drawing a reaction.');
  await page.screenshot({ path: 'test-results/structure-editor-tooltip.png' });

  await page.mouse.move(toolbar.x + 300, toolbar.y + 200);
  await expect(tooltip).toHaveCount(0);
});

test('the help button and F1 open the guide to the keys', async ({ page }) => {
  await openStory(page, 'structure-structureeditor--default');
  await editorSize(page);
  const help = page.getByTestId('structure-editor-help');

  await page.getByRole('button', { name: 'Mouse and keyboard' }).click();
  await expect(
    help.getByText('Pointer on an atom', { exact: true }),
  ).toBeVisible();
  await page.screenshot({ path: 'test-results/structure-editor-help.png' });
  await page.keyboard.press('Escape');
  await expect(help).toHaveCount(0);

  // The drawing takes the keys once focused, and F1 is openchemlib's own
  // help key, which it leaves unimplemented on the web.
  await page.evaluate(() => {
    const root = document.querySelector('[data-openchemlib-canvas-editor]');
    const canvas = root?.shadowRoot?.querySelector('canvas[tabindex]');
    if (!(canvas instanceof HTMLCanvasElement)) {
      throw new Error('the editor drew no canvas');
    }
    canvas.focus();
  });
  await page.keyboard.press('F1');
  await expect(help).toBeVisible();
});

/**
 * Where the toolbar canvas is on the page.
 * @param page - The page the story is open in.
 * @returns The toolbar's top left corner, in CSS pixels.
 */
async function toolbarRect(page: Page): Promise<{ x: number; y: number }> {
  return page.evaluate(() => {
    const root = document.querySelector('[data-openchemlib-canvas-editor]');
    const toolbar = root?.shadowRoot?.firstElementChild;
    if (!(toolbar instanceof HTMLCanvasElement)) {
      throw new Error('the editor drew no toolbar');
    }
    const rect = toolbar.getBoundingClientRect();
    return { x: rect.x, y: rect.y };
  });
}

/**
 * Serve openchemlib late, so the editor appears well after a deadline would
 * have expired.
 * @param page - The page to slow down.
 */
async function delayOpenchemlib(page: Page): Promise<void> {
  await page.route('**/*openchemlib*', async (route) => {
    await new Promise((resolve) => {
      setTimeout(resolve, CHUNK_DELAY);
    });
    await route.continue();
  });
}

/**
 * Measure the editor's box against the toolbar it has to show.
 *
 * The toolbar lives in a shadow root, so it is read in the page rather than
 * through a locator, and the box is the packaged container the component puts
 * `overflow: hidden` on.
 * @param page - The page the story is open in.
 * @returns The two heights, in CSS pixels.
 */
async function editorSize(page: Page): Promise<EditorSize> {
  await expect
    .poll(
      () =>
        page.evaluate(
          () =>
            document.querySelector('[data-openchemlib-canvas-editor]') !== null,
        ),
      { timeout: CHUNK_DELAY + 15_000 },
    )
    .toBe(true);

  return page.evaluate(() => {
    const root = document.querySelector('[data-openchemlib-canvas-editor]');
    const toolbar = root?.shadowRoot?.firstElementChild;
    if (
      !(root instanceof HTMLElement) ||
      !(toolbar instanceof HTMLCanvasElement)
    ) {
      throw new Error('the editor drew no toolbar');
    }
    let box: HTMLElement | null = root;
    while (box !== null && box.style.overflow !== 'hidden') {
      box = box.parentElement;
    }
    if (box === null) throw new Error('the editor is in no packaged container');
    return {
      box: box.getBoundingClientRect().height,
      toolbar: toolbar.offsetHeight,
    };
  });
}
