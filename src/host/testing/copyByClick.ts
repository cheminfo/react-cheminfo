/**
 * Copying a value the way a reader does — a click on a `<ClickToCopy>` — and
 * reading back what landed on the clipboard, for a site's browser suite. What
 * says the copy happened is the component's own `data-copy="copied"`, read
 * here, beside the component, so a change to it updates one file.
 */

import type { Locator } from '@playwright/test';

import { pollUntil } from '../../playwright/poll.ts';

import { readClipboardText } from './chatFrame.ts';

/** How {@link copyByClick} knows the copy landed. */
export interface CopyByClickOptions {
  /**
   * What is waited for: the value's tick (`data-copy="copied"`), or the
   * clipboard itself, emptied before the click and read until it holds
   * something — for a machine so loaded it can miss a tick lasting a second
   * and a half.
   * @default 'tick'
   */
  until?: 'tick' | 'clipboard';
  /**
   * How long the clipboard is read for, in milliseconds, with
   * `until: 'clipboard'`.
   * @default 5000
   */
  timeout?: number;
}

/**
 * Click a value and read what it put on the clipboard, once it says it copied.
 * @param value - The value, e.g. `page.getByTitle('Copy the SMILES (CCO)')`:
 * located by its title, because a copied value adds a hidden "Copied" to its
 * text.
 * @param options - See {@link CopyByClickOptions}.
 * @returns The clipboard's text.
 */
export async function copyByClick(
  value: Locator,
  options: CopyByClickOptions = {},
): Promise<string> {
  const { until = 'tick', timeout = 5000 } = options;
  const page = value.page();
  if (until === 'clipboard') {
    await page.evaluate(() => navigator.clipboard.writeText(''));
    await value.click();
    return pollUntil(
      async () => {
        const text = await readClipboardText(page);
        return text === '' ? undefined : text;
      },
      timeout,
      'the click put nothing on the clipboard',
    );
  }
  await value.click();
  // The value itself, once it carries the tick: in its own frame, whichever.
  await value
    .locator('xpath=self::*[@data-copy="copied"]')
    .waitFor({ state: 'attached' });
  return readClipboardText(page);
}
