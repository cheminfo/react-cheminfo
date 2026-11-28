import { expect, test } from '@playwright/test';

import {
  copiedFrame,
  copyByClick,
  readDrawnHeight,
  resetClipboard,
  shareDialog,
  sharedLink,
} from '../src/host-testing.ts';
import {
  collectPageErrors,
  dragSplitBar,
  readImagesLoaded,
  rectOf,
  splitBar,
  splitShare,
} from '../src/playwright.ts';

import { openStory } from './story.ts';

/**
 * The helpers the sites' browser suites measure the family's components with,
 * run against those components: a helper reading the wrong element would make
 * every suite using it pass while measuring nothing.
 */

test("a row's share is read off its own panes, and a drag moves it", async ({
  page,
}) => {
  await openStory(page, 'split-splitpanes--across');
  const bar = splitBar(page);
  await expect(bar).toHaveCount(1);

  const between = await rectOf(bar);
  const start = await rectOf(page.getByTestId('split-start'));
  const end = await rectOf(page.getByTestId('split-end'));
  expect(between.width).toBe(7);
  expect(await splitShare(bar)).toBeCloseTo(
    (start.width / (start.width + end.width + between.width)) * 100,
    5,
  );
  expect(await splitShare(bar, { countBar: false })).toBeCloseTo(
    (start.width / (start.width + end.width)) * 100,
    5,
  );

  const before = await splitShare(bar);
  await dragSplitBar(page, bar, 120);
  const dragged = await splitShare(bar);
  expect(dragged).toBeGreaterThan(before + 5);

  await dragSplitBar(page, bar, -120, { hover: true, grip: 'visible' });
  expect(await splitShare(bar)).toBeLessThan(dragged - 5);
});

test("a column's share is read down it, and its bar is dragged down", async ({
  page,
}) => {
  await openStory(page, 'split-splitpanes--down');
  const bar = splitBar(page);
  const start = await rectOf(page.getByTestId('split-start'));
  const end = await rectOf(page.getByTestId('split-end'));
  const between = await rectOf(bar);

  const before = await splitShare(bar, { along: 'height' });
  expect(before).toBeCloseTo(
    (start.height / (start.height + end.height + between.height)) * 100,
    5,
  );

  await dragSplitBar(page, bar, -120, { axis: 'y' });

  expect(await splitShare(bar, { along: 'height' })).toBeLessThan(before - 5);
});

test('a value copied by a click is read back off the clipboard, either way', async ({
  page,
}) => {
  await openStory(page, 'clipboard-clicktocopy--default');
  const value = page.getByTitle('Copy the SMILES (C=CC=O)');

  expect(await copyByClick(value)).toBe('C=CC=O');
  await resetClipboard(page);
  expect(await copyByClick(value, { until: 'clipboard' })).toBe('C=CC=O');
});

test('the share dialog hands out the link its button opens, and the iframe it copies', async ({
  page,
}) => {
  await openStory(page, 'share-sharedialog--default');
  const dialog = shareDialog(page);
  await expect(dialog).toBeVisible();

  const link = await sharedLink(dialog)();
  expect(link).not.toBeNull();
  expect(link).toBe(
    await dialog
      .getByRole('button', { name: 'Open in a new tab', exact: true })
      .getAttribute('href'),
  );

  const frame = await copiedFrame(page, dialog);
  expect(frame).toMatch(/^<iframe /);
});

test('what a page throws and what it logs as an error are collected', async ({
  page,
}) => {
  const errors = collectPageErrors(page);
  await openStory(page, 'split-splitpanes--across');

  await page.addScriptTag({
    content: `console.error('logged on purpose');
queueMicrotask(() => { throw new Error('thrown on purpose'); });`,
  });

  await expect
    .poll(() => errors)
    .toEqual(
      expect.arrayContaining([
        'console.error: logged on purpose',
        'pageerror: thrown on purpose',
      ]),
    );
});

test('the guide pictures are read as loaded, and a pane as drawn', async ({
  page,
}) => {
  await openStory(page, 'guide-emptyguide--default');
  const figures = page.locator('.empty-guide__figure img');

  await expect
    .poll(() => readImagesLoaded(figures))
    .toStrictEqual([true, true]);
  const height = await readDrawnHeight(page.locator('.empty-guide').first());
  expect(height).toBeGreaterThan(0);
});
