import type { Page } from '@playwright/test';
import { afterEach, expect, test, vi } from 'vitest';

import { stubFolderPicker } from '../folderPicker.ts';

/** The test's own window, where the init script defines the picker. */
const testWindow = globalThis as unknown as Record<string, unknown>;

afterEach(() => {
  vi.unstubAllGlobals();
  delete testWindow.showDirectoryPicker;
});

/**
 * A page that runs its init script at once, in the test's own window, whose
 * private storage records the folders asked of it.
 * @returns The page, and the folders asked for.
 */
function page() {
  const asked: unknown[][] = [];
  vi.stubGlobal('navigator', {
    storage: {
      getDirectory: async () => ({
        getDirectoryHandle: async (name: string, options: unknown) => {
          asked.push([name, options]);
          return { kind: 'directory', name };
        },
      }),
    },
  });
  // A page opened afresh has no picker yet; one the test can take away again
  // stands in for it, so the script's definition stays removable.
  testWindow.showDirectoryPicker = undefined;
  const fake = {
    addInitScript: async (
      script: (argument: unknown) => void,
      argument: unknown,
    ) => {
      script(argument);
    },
  } as unknown as Page;
  return { fake, asked };
}

/**
 * Open the folder picker the init script defined.
 * @returns The folder it answers with.
 */
function pick(): Promise<unknown> {
  return (testWindow.showDirectoryPicker as () => Promise<unknown>)();
}

test("the folder picker answers with a folder of the page's private storage", async () => {
  const { fake, asked } = page();

  await stubFolderPicker(fake);

  await expect(pick()).resolves.toStrictEqual({
    kind: 'directory',
    name: 'Course',
  });
  expect(asked).toStrictEqual([['Course', { create: true }]]);
});

test('the folder may be named', async () => {
  const { fake, asked } = page();

  await stubFolderPicker(fake, 'Lab journal');
  await pick();

  expect(asked).toStrictEqual([['Lab journal', { create: true }]]);
});
