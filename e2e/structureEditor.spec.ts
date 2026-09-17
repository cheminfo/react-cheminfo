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
