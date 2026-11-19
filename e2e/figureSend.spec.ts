import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { announcedPng, openFigurePanel } from './figurePanel.ts';
import { openStory } from './story.ts';

// The embedded viewer, whose bar carries the glyph that saves the figure.
const IRIS = 'projection-pcaviewer--iris';

/** A file as the stand-in sheet received it. */
interface SharedFile {
  name: string;
  type: string;
  /** Its first bytes: hexadecimal for a PNG, text for anything else. */
  head: string;
  /** The size a PNG states in its header, `null` for anything else. */
  size: { width: number; height: number } | null;
  /** Whether the press was still fresh when the sheet was asked for. */
  fresh: boolean | null;
}

/**
 * Stand in for the share sheet of a phone, which no headless browser has: it
 * takes PNG and SVG files, records what it is handed, and refuses the first
 * `refusals` calls the way a browser refuses a press that is no longer fresh.
 * @param page - The page, before it is opened.
 * @param refusals - How many calls to refuse.
 */
async function standInSheet(page: Page, refusals = 0): Promise<void> {
  await page.addInitScript((refuse: number) => {
    const shared: unknown[] = [];
    let refused = 0;
    Object.assign(globalThis, { sharedFiles: shared });
    Object.defineProperty(Navigator.prototype, 'canShare', {
      configurable: true,
      value: (data: ShareData) =>
        (data.files ?? []).every((file) =>
          ['image/png', 'image/svg+xml'].includes(file.type),
        ),
    });
    Object.defineProperty(Navigator.prototype, 'share', {
      configurable: true,
      value: async (data: ShareData) => {
        const activation = (
          navigator as { userActivation?: { isActive: boolean } }
        ).userActivation;
        const fresh = activation === undefined ? null : activation.isActive;
        if (refused < refuse) {
          refused += 1;
          throw new DOMException('Not allowed', 'NotAllowedError');
        }
        const files = await Promise.all(
          (data.files ?? []).map(async (file) => {
            const png = file.type === 'image/png';
            const bytes = new Uint8Array(await file.slice(0, 24).arrayBuffer());
            const head = png
              ? [...bytes.subarray(0, 8)]
                  .map((byte) => byte.toString(16).padStart(2, '0'))
                  .join('')
              : await file.slice(0, 200).text();
            const header = new DataView(bytes.buffer);
            const size = png
              ? { width: header.getUint32(16), height: header.getUint32(20) }
              : null;
            return { name: file.name, type: file.type, head, size, fresh };
          }),
        );
        shared.push(...files);
      },
    });
  }, refusals);
}

async function sharedFiles(page: Page): Promise<SharedFile[]> {
  return page.evaluate(
    () => (globalThis as unknown as { sharedFiles: SharedFile[] }).sharedFiles,
  );
}

async function openPanel(page: Page): Promise<void> {
  await openStory(page, IRIS);
  await expect(page.locator('.chart-frame')).toHaveCount(1);
  await openFigurePanel(page);
}

const SENT = 'Sent, as a PNG.';

const SEND = { name: 'Send', exact: true } as const;

test('a browser with no share sheet offers no send', async ({ page }) => {
  await page.addInitScript(() => {
    for (const name of ['share', 'canShare']) {
      Object.defineProperty(Navigator.prototype, name, {
        configurable: true,
        value: undefined,
      });
    }
  });
  await openPanel(page);

  await expect(
    page.getByRole('button', { name: 'Save', exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('button', SEND)).toHaveCount(0);
});

test('send hands the PNG save would write to the share sheet', async ({
  page,
}) => {
  await standInSheet(page);
  await openPanel(page);
  await page.getByRole('radio', { name: 'PNG', exact: true }).click();
  await page.getByRole('radio', { name: '600 dpi', exact: true }).click();
  const announced = await announcedPng(page);

  await page.getByRole('button', SEND).click();

  await expect(page.getByText(SENT, { exact: true })).toBeVisible();
  const files = await sharedFiles(page);
  expect(files).toHaveLength(1);
  expect(files[0]).toMatchObject({
    name: 'projection-map.png',
    type: 'image/png',
    head: '89504e470d0a1a0a',
    size: announced,
  });
});

test('send hands over a PNG while the file to save is an SVG', async ({
  page,
}) => {
  await standInSheet(page);
  await openPanel(page);
  // A share sheet hands every file on as an attachment, and only a PNG is
  // shown as a picture in a chat or a mail.
  await expect(
    page.getByRole('radio', { name: 'SVG', exact: true }),
  ).toBeChecked();

  await page.getByRole('button', SEND).click();

  await expect(page.getByText(SENT, { exact: true })).toBeVisible();
  const files = await sharedFiles(page);
  expect(files).toHaveLength(1);
  expect(files[0]).toMatchObject({
    name: 'projection-map.png',
    type: 'image/png',
    head: '89504e470d0a1a0a',
  });
});

test('a press gone stale keeps the file, and the next press shares it while fresh', async ({
  page,
}) => {
  await standInSheet(page, 1);
  await openPanel(page);

  await page.getByRole('button', SEND).click();
  await expect(
    page.getByText(
      'The file is ready. Press Send again to choose where it goes.',
    ),
  ).toBeVisible();
  expect(await sharedFiles(page)).toHaveLength(0);

  await page.getByRole('button', SEND).click();

  await expect(page.getByText(SENT, { exact: true })).toBeVisible();
  const files = await sharedFiles(page);
  expect(files).toHaveLength(1);
  // The kept file goes inside the press itself, which is what an older
  // Safari demands.
  expect(files[0]?.fresh).toBe(true);
});
