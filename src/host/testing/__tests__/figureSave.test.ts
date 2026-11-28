import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import type { Page } from '@playwright/test';
import { afterEach, expect, test } from 'vitest';

import { saveFigureWithShortcut } from '../figureSave.ts';

const folders: string[] = [];

afterEach(() => {
  for (const folder of folders.splice(0)) {
    rmSync(folder, { recursive: true, force: true });
  }
});

/**
 * A page whose shortcut downloads a figure, written where Playwright keeps
 * downloads.
 * @param svg - What the download holds.
 * @returns The page, and what was asked of it, in order.
 */
function page(svg: string) {
  const folder = mkdtempSync(join(tmpdir(), 'figure-save-'));
  folders.push(folder);
  const file = join(folder, 'download');
  writeFileSync(file, svg);
  const download = { path: async () => file };
  const asked: unknown[][] = [];
  const fake = {
    waitForEvent: async (event: string, options: unknown) => {
      asked.push(['waitForEvent', event, options]);
      return download;
    },
    keyboard: {
      press: async (keys: string) => {
        asked.push(['press', keys]);
      },
    },
  } as unknown as Page;
  return { fake, asked, download };
}

test('Ctrl+S is pressed once the download is listened for, and the file is read', async () => {
  const { fake, asked, download } = page('<svg data-site="3d"/>');

  const saved = await saveFigureWithShortcut(fake);

  expect(saved).toStrictEqual({ download, svg: '<svg data-site="3d"/>' });
  expect(asked).toStrictEqual([
    ['waitForEvent', 'download', { timeout: 120_000 }],
    ['press', 'ControlOrMeta+s'],
  ]);
});

test('the keys and the wait may be other ones', async () => {
  const { fake, asked } = page('<svg/>');

  await saveFigureWithShortcut(fake, {
    keys: 'ControlOrMeta+Shift+s',
    timeout: 30_000,
  });

  expect(asked).toStrictEqual([
    ['waitForEvent', 'download', { timeout: 30_000 }],
    ['press', 'ControlOrMeta+Shift+s'],
  ]);
});
