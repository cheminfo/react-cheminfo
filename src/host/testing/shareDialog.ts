/**
 * Reading what the family's share dialog hands out, for a site's browser
 * suite. The dialog prints neither the link nor the iframe: the link is where
 * its "Open in a new tab" button points, and the snippet is what "Copy the
 * iframe" puts on the clipboard. The selectors live here, beside the dialog
 * that draws them, so a redesign of the dialog updates one file.
 */

import type { Locator, Page } from '@playwright/test';

import { pollUntil } from '../../playwright/poll.ts';

import { readClipboardText } from './chatFrame.ts';

/** How {@link copiedFrame} waits for the clipboard. */
export interface CopiedFrameOptions {
  /**
   * How long to wait for the snippet, in milliseconds.
   * @default 5000
   */
  timeout?: number;
}

/**
 * The open share dialog.
 * @param page - The page it is open over.
 * @returns The dialog.
 */
export function shareDialog(page: Page): Locator {
  return page.locator('.share-dialog');
}

/**
 * A reader of the link the dialog hands out: the address its "Open in a new
 * tab" button opens, for `expect.poll`.
 * @param dialog - The open share dialog, or the page it is open over.
 * @returns The reader; it reads `null` while the link is not ready to hand
 * out, as while it is being sealed.
 */
export function sharedLink(
  dialog: Locator | Page,
): () => Promise<string | null> {
  const open = dialog.locator('.share-linkbar a');
  return () => open.getAttribute('href');
}

/**
 * Press "Copy the iframe" and read the snippet back from the clipboard, which
 * is emptied first, so a snippet copied earlier cannot answer. The dialog
 * closes on the copy.
 * @param page - The page, its context granted the clipboard.
 * @param dialog - The open share dialog.
 * @param options - See {@link CopiedFrameOptions}.
 * @returns The snippet.
 */
export async function copiedFrame(
  page: Page,
  dialog: Locator,
  options: CopiedFrameOptions = {},
): Promise<string> {
  const { timeout = 5000 } = options;
  await page.evaluate(() => navigator.clipboard.writeText(''));
  await dialog
    .getByRole('button', { name: 'Copy the iframe', exact: true })
    .click();
  return pollUntil(
    async () => {
      const text = await readClipboardText(page);
      return text === '' ? undefined : text;
    },
    timeout,
    'the iframe never reached the clipboard',
  );
}
