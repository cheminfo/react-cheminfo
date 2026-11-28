/**
 * A folder of this computer, for a browser suite: Chrome's folder picker cannot
 * be driven, so the folder chosen is one of the page's own private storage — a
 * real folder handle, written to and listed like any other.
 */

import type { Page } from '@playwright/test';

/**
 * Make every page the test opens answer `showDirectoryPicker()` with a folder
 * of its private storage, created on first use. Call it before the page is
 * opened, as in `test.beforeEach`.
 * @param page - The page under test.
 * @param name - The folder's name.
 * @default name 'Course'
 */
export async function stubFolderPicker(
  page: Page,
  name = 'Course',
): Promise<void> {
  await page.addInitScript((folder) => {
    Object.defineProperty(globalThis, 'showDirectoryPicker', {
      value: async () => {
        const root = await navigator.storage.getDirectory();
        return root.getDirectoryHandle(folder, { create: true });
      },
    });
  }, name);
}
